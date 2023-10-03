import fs from "fs";
import bcrypt from "bcrypt";
import { sendMail } from "../mail/sendMail.js";
import * as db from "../db/index.js";
import * as Auth from "../models/authModel.js";
import * as User from "../models/userModel.js";
import * as Registration from "../models/registrationModel.js";
import * as ResetPassword from "../models/resetPasswordModel.js";
import { backendBasename, FRONTENDORIGIN, uuidv4Regex } from "../utils.js";

const maxSessionAge = 3600 * 24; // 24h sessions
const maxRegistrationAge = 3600 * 1; // 1h registration

const saltRounds = 10; // salting complexity

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
    msg: `Welcome ${username}, you are authenticated !`,
  });
};

export const signUp = async (req, res) => {
  let newUser;
  try {
    let hash;
    let defaultAvatar = fs.readFileSync("src/assets/default.jpg");
    defaultAvatar = new Uint8Array(defaultAvatar);

    const { email, username, password } = req.body;
    hash = await bcrypt.hash(password, saltRounds);

    newUser = await User.create(email, username, hash, defaultAvatar);
    const newRegistration = await Registration.create(newUser.id);

    const link = backendBasename("/registration/") + newRegistration.rid;

    try {
      await sendMail({
        to: email,
        subject: "registration confirmation",
        html: `<h2>Hi ${username}</h2><p>Please confirm your registration to camagru by clicking on this link: <a href=${link} target='blank'>link</a></p>`,
      });
    } catch (err) {
      // Triggered when email isn't valid, so we delete the created tables
      // without warning the user of this issue to prevent scammers to fetch
      // email validity if ever we would feedback this.
      console.error(err);
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
    console.error(err);
    if (newUser) await User.deleteById(newUser.id);

    return res.status(401).json({
      auth: false,
      msg: "Registration failed, try again.",
    });
  }
};

export const confirmRegistration = async (req, res) => {
  try {
    let date = new Date();
    date = new Date(date.getTime() - maxRegistrationAge * 1000);
    await Registration.deleteOutdated(date);

    if (!uuidv4Regex.test(req.params.token)) {
      return res.redirect(301, FRONTENDORIGIN);
    }

    const user = await User.findByRegistrationToken(req.params.token);

    if (process.env.DEV) console.log(user);

    if (!user) return res.redirect(301, FRONTENDORIGIN);

    if (user.registered) return res.redirect(301, FRONTENDORIGIN);

    await Registration.deleteById(user.rid);

    await User.updateById(user.id, { registered: true });

    res.json({ niquel: "michel" });
  } catch (err) {
    console.error(err);
    res.redirect(301, FRONTENDORIGIN);
  }
};

export const confirmPwdReset = async (req, res) => {
  // on créé une session de reset (id, uid)
  // on envoie l'id
  const { email, username, id } = req.user;
  try {
    const newPwd = await ResetPassword.create(id);
    const link = backendBasename("/pwdreset/") + newPwd.id;

    await sendMail({
      to: email,
      subject: "password reset confirmartion",
      html: `<h2>Hi ${username}</h2><p>Please confirm your password reset by clicking on this link: <a href=${link} target='blank'>link</a></p>`,
    });

    return res.json({
      auth: true,
      msg: "Check your mail to reset your password",
    });
  } catch (err) {
    console.error(err);
    return res.json({ auth: false, msg: "faillllll" });
  }
};

export const pwdReset = async (req, res) => {
  try {
    const { rows } = await db.query("SELECT gen_random_uuid() AS id");

    let newPwd = await bcrypt.hash(rows[0].id, 1);
    newPwd = newPwd.slice(8, 26);

    const hash = await bcrypt.hash(newPwd, saltRounds);

    await User.updateById(req.user.id, { password: hash });

    await sendMail({
      to: req.user.email,
      subject: "new password",
      html: `<h2>Hi ${req.user.username}</h2><p>Your new password is: ${newPwd}</p>`,
    });

    await Auth.deleteSessionByUserId(req.user.id);

    await ResetPassword.deleteById(req.user.pwd_id);

    res.json({ auth: true, msg: "Check your mail to get your new password" });
  } catch (err) {
    console.error(err);
    res.json({ auth: false, msg: "An error occured, try again" });
  }
};

export const logout = async (req, res) => {
  if (!req.session) res.status(401).end();

  const { sid, id } = req.session;

  await Auth.deleteSessionByUserId(id, sid);

  res.end();
};

export const mailUpdate = async (req, res) => {
  try {
    await User.updateById(req.session.id, { email: req.session.newEmail });
    return res.json({ auth: true, msg: "email has been updated !" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "internal error" });
  }
};
