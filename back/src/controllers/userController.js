import * as User from "../models/userModel.js";

export const me = async (req, res) => {
  if (req.session) {
    const { username } = req.session;
    return res.json({
      auth: true,
      msg: "You are not authenticated",
      user: username,
    });
  } else {
    return res.status(401).json({
      auth: false,
      msg: "You are not authenticated",
    });
  }
};
