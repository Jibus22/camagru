import * as db from "../db/index.js";

export const findAll = async () => {
  const { rows } = await db.query(
    "SELECT id, email, username FROM users LIMIT 50"
  );
  return rows;
};
