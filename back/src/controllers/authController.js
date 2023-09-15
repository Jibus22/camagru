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
  if (req.session)
    return res.status(401).json({ auth: false, msg: "Already authenticated!" });

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
  try {
    let hash;
    const saltRounds = 10;
    const { email, username, password } = req.body;
    hash = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create(email, username, hash);
    const newRegistration = await Auth.createRegistration(newUser.id);

    const link = "http://localhost:4000/registration/" + newRegistration.rid;

    //TODO choper le retour de cette fonction pck si elle renvoie une erreur
    // c'est que l'adresse mail n'est pas valide, du coup il faut delete user
    sendConfirmationMail(email, username, link);

    return res.status(201).json({
      signedUp: true,
      msg: `Welcome to Camagru, ${
        newUser.username
      }. Please check your email to confirm your registration. The link will expires in ${
        maxRegistrationAge / 60
      } minutes`,
    });
  } catch (err) {
    console.error(err);
    if (newUser) await User.deleteById(newUser.id);

    return res.status(401).json({
      signedUp: false,
      msg: "Registration failed, try again.",
    });
  }
};

export const confirmRegistration = async (req, res) => {
  let date = new Date();
  date = new Date(date.getTime() - maxRegistrationAge * 1000);
  await Auth.deleteOutdatedRegistrations(date);

  const user = await User.findByRegistration();

  console.log(user);

  if (!user) return res.status(301).json({ msg: "User not found" });

  //TODO: create res.redirect() method to be able to redirect where we want

  if (user.registered)
    return res.status(301).json({ msg: "User already registered" });

  await Auth.deleteRegistrationById(user.rid);

  await User.updateById(user.id, { registered: true });

  res.json({ niquel: "michel" });
};
