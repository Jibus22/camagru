import bcrypt from "bcrypt";
import { sendConfirmationMail } from "../mail/sendMail.js";
import * as Auth from "../models/authModel.js";
import * as User from "../models/userModel.js";
import { getBody } from "../utils.js";

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

  const body = await getBody(req);
  const { username, password } = JSON.parse(body);
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

const signUpSanitize = async (user) => {
  if (user.password.length < 7) return "password must be 7 characters minimum";
  if (user.username.length < 4) return "username must be 4 characters minimum";
  if (user.username.length > 15)
    return "username can't be longer than 15 characters";

  let usr = await User.findByUsername(user.username);
  if (usr?.username) return "This username is already used.";

  usr = await User.findByEmail(user.email);
  if (usr?.email) return "This email is already used.";
  return null;
};

export const signUp = async (req, res) => {
  if (req.session)
    return res
      .status(401)
      .json({ signedUp: false, msg: "Already authenticated!" });

  const body = await getBody(req);
  const { email, username, password } = JSON.parse(body);

  const err = await signUpSanitize({ email, username, password });
  if (err) return res.status(401).json({ signedUp: false, msg: err });

  // TODO: au lieu de sanitize ici, installer un middleware qui s'en charge et
  // qui passe également un coup de regex sur les inputs

  let hash;

  try {
    const saltRounds = 10;
    hash = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create(email, username, hash);
    const newRegistration = await Auth.createRegistration(newUser.id);

    const link = "http://localhost:4000/registration/" + newRegistration.rid;
    sendConfirmationMail(email, username, link);

    return res.status(201).json({
      signedUp: true,
      msg: `Welcome to Camagru, ${
        newUser.username
      }. Please check your email to confirm your registration. The link will expires in ${
        maxRegistrationAge / 60
      }minutes`,
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
