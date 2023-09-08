import * as Auth from "../models/authModel.js";
import * as User from "../models/userModel.js";
import { getBody } from "../utils.js";

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

  console.log(user);

  if (!user || user?.password != password)
    return res.end(JSON.stringify({ authenticated: false }));

  const session = await Auth.createSession(user.id);
  console.log(session);

  res.setHeader("Set-Cookie", [
    `camagru_sid=${session.sid}; samesite=Lax; path=/; max-age=8; httpOnly`,
    `camagru_uid=${session.uid}; samesite=Lax; path=/; max-age=8; httpOnly`,
  ]);
  return res.end(JSON.stringify({ authenticated: true }));
};
