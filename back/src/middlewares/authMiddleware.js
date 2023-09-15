import { parse } from "cookie";
import * as Auth from "../models/authModel.js";
import * as User from "../models/userModel.js";

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

const sanitizeInput = async ({ email, username, password }) => {
  const mailRegex = /^[-.\w]+@([\w-]+\.)+[\w-]+$/g;
  const passwordRegex = /^([\w.,#!?$%^&*;:"'{}=`~()-]{7,30})$/g;
  const usernameRegex = /^([\w-]{4,15})$/g;

  if (!mailRegex.test(email)) return "email is badly formated";
  if (!passwordRegex.test(password)) return "password is badly formated";
  if (!usernameRegex.test(username)) return "username is badly formated";

  let usr = await User.findByUsername(username);
  if (usr?.username) return "This username is not available.";

  usr = await User.findByEmail(email);
  if (usr?.email) return "This email is not available.";

  return null;
};

export const signUpSanitize = async (req, res, next) => {
  if (req.session)
    return res
      .status(401)
      .json({ signedUp: false, msg: "Already authenticated!" });

  const err = await sanitizeInput(req.body);
  if (err) return res.status(401).json({ signedUp: false, msg: err });

  next();
};
