import { parse } from "cookie";
import * as Auth from "../models/authModel.js";
import * as User from "../models/userModel.js";
import { mailRegex, passwordRegex, usernameRegex } from "../utils.js";

/**
 * Verify user and session id in cookies to check if the user is already
 * authenticated and add session to the request object for the following logic
 */
export const authGuard = async (req, res, next) => {
  if (!req.headers.cookie) return next();

  const { camagru_sid, camagru_uid } = parse(req.headers.cookie);

  const session = await Auth.findOneSession(camagru_uid, camagru_sid);

  req.session = session;

  //TODO sans doute mettre le user dans req

  next();
};

const sanitizeInput = ({ email, username, password }) => {
  if (!mailRegex.test(email)) {
    return "email is badly formated";
  } else if (!passwordRegex.test(password)) {
    return "password is badly formated";
  } else if (!usernameRegex.test(username)) {
    return "username is badly formated";
  } else {
    return null;
  }
};

export const signUpSanitize = async (req, res, next) => {
  if (req.session)
    return res.status(401).json({ auth: false, msg: "Already authenticated!" });

  const err = sanitizeInput(req.body);
  console.log(err);
  if (err) return res.status(401).json({ auth: false, msg: err });

  const { email, username } = req.body;
  let usr = await User.findByUsername(username);
  if (usr?.username) {
    return res
      .status(401)
      .json({ auth: false, msg: "This username is not available." });
  }

  usr = await User.findByEmail(email);
  if (usr?.email) {
    return res
      .status(401)
      .json({ auth: false, msg: "This email is not available." });
  }

  next();
};

export const signInSanitize = async (req, res, next) => {
  if (req.session)
    return res.status(401).json({ auth: false, msg: "Already authenticated!" });

  const err = sanitizeInput(req.body);
  if (err) return res.status(401).json({ auth: false, msg: err });

  next();
};
