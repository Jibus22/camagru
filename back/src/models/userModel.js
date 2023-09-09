import * as db from "../db/index.js";

export const findAll = async () => {
  const { rows } = await db.query(
    "SELECT id, email, username FROM users LIMIT 50"
  );
  return rows;
};

export const findByUsername = async (username) => {
  const { rows } = await db.query(
    "SELECT id, username, password FROM users WHERE username=$1",
    [username]
  );

  if (!rows.length) return null;
  return rows[0];
};

export const findByEmail = async (email) => {
  const { rows } = await db.query(
    "SELECT id, username, password, email FROM users WHERE email=$1",
    [email]
  );

  if (!rows.length) return null;
  return rows[0];
};
