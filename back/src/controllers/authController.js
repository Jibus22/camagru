import * as Auth from "../models/authModel.js";
import * as User from "../models/userModel.js";
import { getBody } from "../utils.js";

export const signIn = async (req, res) => {
  const body = await getBody(req);
  const { username, password } = JSON.parse(body);
  let user = await User.findOne(username);

  console.log(user);

  if (!user || user?.password != password)
    return res.end(JSON.stringify({ authenticated: false }));

  const session = await Auth.createSession(user.id);
  console.log(session);

  res.setHeader("Set-Cookie", [
    `camagru_sid=${session.sid}; samesite=None; secure; path=/; max-age=10000; httpOnly`,
    `camagru_uid=${session.uid}; samesite=None; secure; path=/; max-age=10000; httpOnly`,
  ]);
  return res.end(JSON.stringify({ authenticated: true }));
};
