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

export const sendMail = async (payload) => {
  payload.from = laposte.user;
  try {
    const info = await transporter.sendMail(payload);
    console.log(info.response);
  } catch (err) {
    throw err;
  }
};
