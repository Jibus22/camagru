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

// Send payload of signature {to, subject, html}
export const sendMail = (payload) => {
  payload.from = laposte.user;

  transporter.sendMail(payload, (error, info) => {
    if (error) console.log(error);
    else console.log("Mail sent" + info.response);
  });
};

export const sendConfirmationMail = (recipient, username, link) => {
  sendMail({
    to: recipient,
    subject: "camagru-noreply - registration confirmation",
    html: `<h2>Hi ${username}</h2><p>Please confirm your registration to camagru by clicking on this link: <a href=${link} target='blank'>link</a></p>`,
  });
};
