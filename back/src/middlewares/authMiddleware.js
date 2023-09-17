import { parse } from "cookie";
import * as User from "../models/userModel.js";
import * as ResetPassword from "../models/resetPasswordModel.js";
import {
  mailRegex,
  passwordRegex,
  usernameRegex,
  uuidv4Regex,
} from "../utils.js";

/**
 * Verify user and session id in cookies to check if the user is already
 * authenticated and add session to the request object for the following logic
 */
export const authGuard = async (req, res, next) => {
  if (!req.headers.cookie) return next();

  const { camagru_sid, camagru_uid } = parse(req.headers.cookie);

  const user = await User.findBySession(camagru_sid, camagru_uid);

  req.session = user; // {sid, id, username, email, registered}

  next();
};

const sanitizeInput = ({ email, username, password }) => {
  if (email && !mailRegex.test(email)) {
    return "email is badly formated";
  } else if (password && !passwordRegex.test(password)) {
    return "password is badly formated";
  } else if (username && !usernameRegex.test(username)) {
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

export const confirmPwdResetSanitize = async (req, res, next) => {
  const err = sanitizeInput(req.body);
  if (err) return res.status(401).json({ auth: false, msg: err });

  const { email } = req.body;
  const usr = await User.findByEmail(email);

  if (!usr?.email) {
    // We don't feedback if the email doesn't exist to prevent spamming
    return res.json({ auth: true, msg: "check your email" });
  }

  if (!usr?.registered) {
    return res.json({
      auth: false,
      msg: "Your didn't confirmed your account, check your email",
    });
  }

  req.user = usr;

  next();
};

const maxPwdResetAge = 3600 * 1; // 1h pwdReset

export const pwdResetSanitize = async (req, res, next) => {
  try {
    let date = new Date();
    date = new Date(date.getTime() - maxPwdResetAge * 1000);
    await ResetPassword.deleteOutdated(date);

    if (!uuidv4Regex.test(req.params.token)) {
      return res.redirect(301, "http://localhost:5173");
    }

    const user = await User.findByResetPasswordToken(req.params.token);

    console.log(user);

    if (!user) return res.redirect(301, "http://localhost:5173");

    await ResetPassword.deleteById(user.pwd_id);

    req.user = user;

    next();
  } catch (err) {
    console.log(err);
    res.json({ coucou: "pwdResetSanitize err" });
  }
};
