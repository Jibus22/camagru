import bcrypt from "bcrypt";
import { DBError } from "../errors/DBError.js";
import { sendConfirmationMail } from "../mail/sendMail.js";
import * as Auth from "../models/authModel.js";
import * as User from "../models/userModel.js";
import { getBody } from "../utils.js";

const maxAge = 3600 * 24; // 24h sessions

const cleanUserSessions = async (user) => {
  let date = new Date();
  date = new Date(date.getTime() - maxAge * 1000);

  const sessions = await Auth.deleteSessionByDate(user.id, date);
  return sessions;
};

export const signIn = async (req, res) => {
  if (req.session)
    return res
      .status(401)
      .json({ authenticated: false, msg: "Already authenticated!" });

  const body = await getBody(req);
  const { username, password } = JSON.parse(body);
  let user = await User.findByUsername(username);

  const verified = await bcrypt.compare(password, user?.password);

  if (!verified)
    return res.status(401).json({
      authenticated: false,
      msg: "Authentication error, please try again.",
    });

  // Take advantage of signin to clean expired sessions
  cleanUserSessions(user);

  const session = await Auth.createSession(user.id);

  res.setHeader("Set-Cookie", [
    `camagru_sid=${session.sid}; samesite=Lax; path=/; max-age=${maxAge}; httpOnly`,
    `camagru_uid=${session.uid}; samesite=Lax; path=/; max-age=${maxAge}; httpOnly`,
  ]);

  return res.json({
    authenticated: true,
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

  let hash;

  try {
    const saltRounds = 10;
    hash = await bcrypt.hash(password, saltRounds);

    const newUser = await User.createUser(email, username, hash);
    const newRegistration = await Auth.createRegistration(newUser.id);

    const link = "http://localhost:4000/registration/" + newRegistration.rid;
    sendConfirmationMail(email, username, link);

    return res.status(201).json({
      signedUp: true,
      msg: `Welcome to Camagru, ${newUser.username}. Please check your email to confirm your registration.`,
    });
  } catch (err) {
    console.error(err);
    if (newUser) await User.deleteUserById(newUser.id);

    return res.status(401).json({
      signedUp: false,
      msg: "Registration failed, try again.",
    });
  }
};
