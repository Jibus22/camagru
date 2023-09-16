import bcrypt from "bcrypt";
import { sendConfirmationMail } from "../mail/sendMail.js";
import * as Auth from "../models/authModel.js";
import * as User from "../models/userModel.js";

const maxSessionAge = 3600 * 24; // 24h sessions
const maxRegistrationAge = 3600 * 1; // 1h registration

const cleanUserSessions = async (user) => {
  let date = new Date();
  date = new Date(date.getTime() - maxSessionAge * 1000);

  const sessions = await Auth.deleteSessionByDate(user.id, date);
  return sessions;
};

export const signIn = async (req, res) => {
  const { username, password } = req.body;
  let user = await User.findByUsername(username);

  if (!user)
    return res.status(401).json({ auth: false, msg: "Authentication error" });

  const verified = await bcrypt.compare(password, user.password);

  if (!verified)
    return res.status(401).json({ auth: false, msg: "Authentication error" });

  if (!user.registered)
    return res.status(401).json({
      auth: false,
      msg: "Check your mail to confirm your registration",
    });
  // Take advantage of signin to clean expired sessions
  cleanUserSessions(user);

  const session = await Auth.createSession(user.id);

  res.setHeader("Set-Cookie", [
    `camagru_sid=${session.sid}; samesite=Lax; path=/; max-age=${maxSessionAge}; httpOnly`,
    `camagru_uid=${session.uid}; samesite=Lax; path=/; max-age=${maxSessionAge}; httpOnly`,
  ]);

  return res.json({
    auth: true,
    msg: `Welcome <strong>${username}</strong>, you are authenticated !`,
  });
};

export const signUp = async (req, res) => {
  let newUser;
  try {
    let hash;
    const saltRounds = 10;
    const { email, username, password } = req.body;
    hash = await bcrypt.hash(password, saltRounds);

    newUser = await User.create(email, username, hash);
    const newRegistration = await Auth.createRegistration(newUser.id);

    const link = "http://localhost:4000/registration/" + newRegistration.rid;

    try {
      await sendConfirmationMail(email, username, link);
    } catch (err) {
      // Triggered when email isn't valid, so we delete the created tables
      // without warning the user of this issue to prevent scammers to fetch
      // email validity if ever we would feedback this.
      console.log(err);
      await User.deleteById(newUser.id);
    }

    return res.status(201).json({
      auth: true,
      msg: `Welcome to Camagru, ${
        newUser.username
      }. Please check your email to confirm your registration. The link will expires in ${
        maxRegistrationAge / 60
      } minutes`,
    });
  } catch (err) {
    console.log(err);
    if (newUser) await User.deleteById(newUser.id);

    return res.status(401).json({
      auth: false,
      msg: "Registration failed, try again.",
    });
  }
};

export const confirmRegistration = async (req, res) => {
  let date = new Date();
  date = new Date(date.getTime() - maxRegistrationAge * 1000);
  await Auth.deleteOutdatedRegistrations(date);

  const user = await User.findByRegistrationToken(req.params.token);

  console.log(user);

  if (!user) return res.status(301).json({ msg: "User not found" });

  //TODO: create res.redirect() method to be able to redirect where we want

  if (user.registered)
    return res.status(301).json({ msg: "User already registered" });

  await Auth.deleteRegistrationById(user.rid);

  await User.updateById(user.id, { registered: true });

  res.json({ niquel: "michel" });
};
