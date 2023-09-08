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
  if (req.session) {
    // Maybe rediriger vers '/'
    return res.end(
      JSON.stringify({ authenticated: true, msg: "Already authenticated!" })
    );
  }

  const body = await getBody(req);
  const { username, password } = JSON.parse(body);
  let user = await User.findOne(username);

  // User not found or wrong password
  if (!user || user?.password != password)
    return res.end(JSON.stringify({ authenticated: false }));

  // Take advantage of signin to check wether we store deprecated sessions of
  // user or not and delete them.
  cleanUserSessions(user);

  const session = await Auth.createSession(user.id);

  res.setHeader("Set-Cookie", [
    `camagru_sid=${session.sid}; samesite=Lax; path=/; max-age=${maxAge}; httpOnly`,
    `camagru_uid=${session.uid}; samesite=Lax; path=/; max-age=${maxAge}; httpOnly`,
  ]);
  return res.end(JSON.stringify({ authenticated: true }));
};
