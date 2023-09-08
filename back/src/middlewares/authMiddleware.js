import { parse } from "cookie";
import * as Auth from "../models/authModel.js";
import * as User from "../models/userModel.js";

// Verify user and session id in cookies to check if the user is already
// authenticated and add session to the request object for the following logic
export const authGuard = async (req, res, next) => {
  if (!req.headers.cookie) return next();

  const { camagru_sid, camagru_uid } = parse(req.headers.cookie);

  const session = await Auth.findSession(camagru_uid, camagru_sid);

  console.log(session);

  req.session = session;

  next();
};
