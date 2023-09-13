import bcrypt from "bcrypt";
import { sendConfirmationMail } from "../mail/sendMail.js";
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

const signUpErr = async (user) => {
  if (user.password.length < 7) return "password must be 7 characters minimum";

  if (user.username.length < 4) return "username must be 4 characters minimum";

  if (user.username.length > 15)
    return "username can't be longer than 15 characters";

  let usr = await User.findByUsername(username);
  if (usr?.username) return "This username is already used.";

  usr = await User.findByEmail(email);
  if (usr?.email) return "This email is already used.";
  return null;
};

const generateRegistrationLink = () => {
  // 1
  // générer un token
  // le rajouter à une route
  // ex: http://localhost:4000/register/QJyMTwVhVvm7IBta4p4WCIuJjidM6
  // On enregistre ce token dans une table avec timestamp
  // 2
  // On envoie ce lien.
  // 3
  // Quand on reçoit cette requête, on check si il y a une table qui possède
  // ce token, si non: redirection homepage. Si oui: On check si le timestamp
  // est trop vieux puis si le user relié est déjà enregistré ou pas.
};

export const signUp = async (req, res) => {
  if (req.session)
    return res
      .status(401)
      .json({ signedUp: false, msg: "Already authenticated!" });

  const body = await getBody(req);
  const { email, username, password } = JSON.parse(body);

  const err = await signUpErr({ email, username, password });
  if (err) return res.status(401).json({ signedUp: false, msg: err });

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
      // generate link
      sendConfirmationMail(email, username);
      return res.status(201).json({
        signedUp: true,
        msg: `Welcome to Camagru, <strong>${newUser.username}</strong>. Please check your email to confirm your registration.`,
      });
    } else {
      return res.status(401).json({
        signedUp: false,
        msg: "Registration failed, try again.",
      });
    }
  });
};
