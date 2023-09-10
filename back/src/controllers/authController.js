import bcrypt from "bcrypt";
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

export const signUp = async (req, res) => {
  if (req.session)
    return res
      .status(401)
      .json({ signedUp: false, msg: "Already authenticated!" });

  const body = await getBody(req);
  const { email, username, password } = JSON.parse(body);

  if (password.length < 7 || username.length < 5)
    return res.status(401).json({
      signedUp: false,
      msg: `${password.length < 7 ? "password" : "username"} must be ${
        password.length < 7 ? "7" : "5"
      } characters minimum`,
    });

  let user = await User.findByUsername(username);

  if (user?.username)
    return res.status(401).json({
      signedUp: false,
      msg: "This username is already used.",
    });

  user = await User.findByEmail(email);

  if (user?.email)
    return res.json({ signedUp: false, msg: "This email is already used." });

  const saltRounds = 10;

  bcrypt.hash(password, saltRounds, async (err, hash) => {
    if (err) {
      console.error(err);
      return res.status(401).json({
        signedUp: false,
        msg: "Registration failed, try again.",
      });
    }

    const newUser = await User.createUser(email, username, hash);

    if (newUser) {
      return res.status(201).json({
        signedUp: true,
        msg: `Welcome to Camagru, <strong>${newUser.username}</strong> please check your email to confirm your registration`,
      });
    } else {
      return res.status(401).json({
        signedUp: false,
        msg: "Registration failed, try again.",
      });
    }
  });
};
