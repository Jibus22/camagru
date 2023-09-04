import * as User from "../models/userModel.js";

export const getUsers = async (req, res) => {
  const users = await User.findAll();

  const filter = users.map((elem) => {
    const { id, username } = elem;
    return { id, username };
  });

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(filter));
};
