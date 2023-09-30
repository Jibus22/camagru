import { parse } from "cookie";
import * as User from "../models/userModel.js";
import * as ResetPassword from "../models/resetPasswordModel.js";
import * as MailUpdate from "../models/mailUpdateModel.js";
import {
  mailRegex,
  passwordRegex,
  usernameRegex,
  uuidv4Regex,
} from "../utils.js";

export const authGuard = async (req, res, next) => {
  if (!req.session)
    return res.status(401).json({ auth: false, msg: "Not authenticated" });
  else next();
};

/**
 * Verify user and session id in cookies to check if the user is already
 * authenticated and add session to the request object for the following logic
 */
export const authSession = async (req, res, next) => {
  if (!req.headers.cookie) return next();

  const { camagru_sid, camagru_uid } = parse(req.headers.cookie);

  const user = await User.findBySession(camagru_sid, camagru_uid);

  req.session = user; // {sid, id, username, email, registered, post_notif}

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

const findDuplicates = async ({ email, username }) => {
  try {
    let user;
    if (username) {
      user = await User.findByUsername(username);
      if (user?.username) return "This username is not available.";
    }

    if (email) {
      user = await User.findByEmail(email);
      if (user?.email) return "This email is not available.";
    }
  } catch (err) {
    console.error(err);
    return "error";
  }
  return null;
};

export const editSanitize = async (req, res, next) => {
  if (!req.session)
    return res
      .status(401)
      .json({ auth: false, msg: "You are not authenticated" });

  const { email, username, password, enable, disable } = req.body;
  if (!email && !username && !password && !enable && !disable)
    return res.status(401).json({ auth: false, msg: "All fields are empty !" });

  let err = sanitizeInput(req.body);
  if (err) return res.status(401).json({ auth: false, msg: err });

  err = await findDuplicates(req.body);
  if (err) return res.status(401).json({ auth: false, msg: err });

  next();
};

export const signUpSanitize = async (req, res, next) => {
  if (req.session)
    return res.status(401).json({ auth: false, msg: "Already authenticated!" });

  const { email, username, password } = req.body;
  if (!email || !username || !password)
    return res.status(401).json({ auth: false, msg: "A field is missing !" });

  let err = sanitizeInput(req.body);
  if (err) return res.status(401).json({ auth: false, msg: err });

  err = await findDuplicates(req.body);
  if (err) return res.status(401).json({ auth: false, msg: err });

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

    if (!user) return res.redirect(301, "http://localhost:5173");

    req.user = user;

    next();
  } catch (err) {
    console.error(err);
    res.json({ coucou: "pwdResetSanitize err" });
  }
};

const mailUpdateAge = 3600 * 1; // 1h mail update

export const mailUpdateSanitize = async (req, res, next) => {
  if (!req.session)
    return res
      .status(401)
      .json({ auth: false, msg: "You are not authenticated" });

  try {
    let date = new Date();
    date = new Date(date.getTime() - mailUpdateAge * 1000);
    await MailUpdate.deleteOutdated(date);

    if (!uuidv4Regex.test(req.params.token)) {
      return res.redirect(301, "http://localhost:5173");
    }

    const response = await MailUpdate.find(req.params.token, req.session.id);

    if (!response) return res.redirect(301, "http://localhost:5173");

    const { new_email } = response;

    req.session.newEmail = new_email;

    await MailUpdate.deleteById(req.params.token);

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ coucou: "err" });
  }
};
