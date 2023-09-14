import * as db from "../db/index.js";
import { DBError } from "../errors/DBError.js";

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

export const createUser = async (email, username, hash) => {
  try {
    const { rows } = await db.query(
      "INSERT INTO users(email, username, password) VALUES($1, $2, $3) returning *",
      [email, username, hash]
    );
    return rows[0];
  } catch (err) {
    throw new DBError("Create error", "User", err);
  }
};

export const deleteUserById = async (id) => {
  try {
    const { rows } = await db.query(
      "DELETE FROM users WHERE id=$1 returning *",
      [id]
    );
    return rows[0];
  } catch (err) {
    throw new DBError("Delete error", "User", err);
  }
};
