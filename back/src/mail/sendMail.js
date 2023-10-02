import nodemailer from "nodemailer";
import fs from "fs";

const mailUserPath = "/run/secrets/mailUser";
const mailPassPath = "/run/secrets/mailPass";
let laposte = {};

try {
  laposte.user = fs.readFileSync(mailUserPath, "utf8");
  laposte.pass = fs.readFileSync(mailPassPath, "utf8");
} catch (err) {
  if (process.env.USERMAIL && process.env.PWDMAIL) {
    laposte.user = process.env.USERMAIL;
    laposte.pass = process.env.PWDMAIL;
  } else {
    console.error("Mail transporter auth error\n" + error);
    process.exit(1);
  }
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

// verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Mail transporter error\n" + error);
    process.exit(1);
  } else {
    if (process.env.DEV)
      console.log(
        "Mail server is ready to take our messages. (" + success + ")"
      );
  }
});

export const sendMail = async (payload) => {
  payload.from = laposte.user;
  try {
    const info = await transporter.sendMail(payload);
    if (process.env.DEV) console.log(info.response);
  } catch (err) {
    throw err;
  }
};
