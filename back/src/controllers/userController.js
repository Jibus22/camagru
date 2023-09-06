import * as User from "../models/userModel.js";

export const getUsers = async (req, res) => {
  const users = await User.findAll();

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(users);
};
