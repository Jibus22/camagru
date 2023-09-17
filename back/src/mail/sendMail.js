import nodemailer from "nodemailer";
import fs from "fs";

const mailUserPath = "/run/secrets/mailUser";
const mailPassPath = "/run/secrets/mailPass";
let laposte = {};

try {
  laposte.user = fs.readFileSync(mailUserPath, "utf8");
  laposte.pass = fs.readFileSync(mailPassPath, "utf8");
} catch (err) {
  console.error(err);
}

const laposteTransport = {
  host: "smtp.laposte.net",
  secure: true,
  port: 465,
  auth: {
    user: laposte.user,
    pass: laposte.pass,
  },
};

const transporter = nodemailer.createTransport(laposteTransport);

/**
 * Send pre-formated email for registration confirmation
 */
export const sendConfirmationMail = async (recipient, username, link) => {
  const payload = {
    from: laposte.user,
    to: recipient,
    subject: "camagru-noreply - registration confirmation",
    html: `<h2>Hi ${username}</h2><p>Please confirm your registration to camagru by clicking on this link: <a href=${link} target='blank'>link</a></p>`,
  };

  try {
    const info = await transporter.sendMail(payload);
    console.log(info.response);
  } catch (err) {
    throw err;
  }
};

export const sendPasswordResetConfirmation = async (
  recipient,
  username,
  link
) => {
  const payload = {
    from: laposte.user,
    to: recipient,
    subject: "camagru-noreply - password reset confirmartion",
    html: `<h2>Hi ${username}</h2><p>Please confirm your password reset by clicking on this link: <a href=${link} target='blank'>link</a></p>`,
  };

  try {
    const info = await transporter.sendMail(payload);
    console.log(info.response);
  } catch (err) {
    throw err;
  }
};

/**
 * Send pre-formated email for password reset
 */
export const sendNewPwd = async (recipient, username, newpwd) => {
  const payload = {
    from: laposte.user,
    to: recipient,
    subject: "camagru-noreply - new password",
    html: `<h2>Hi ${username}</h2><p>Your new password is: ${newpwd}.</p>`,
  };

  try {
    const info = await transporter.sendMail(payload);
    console.log(info.response);
  } catch (err) {
    throw err;
  }
};
