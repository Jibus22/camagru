import * as db from "../db/index.js";
import { DBError } from "../errors/DBError.js";

export const findAll = async () => {
  try {
    const { rows } = await db.query(
      "SELECT id, email, username FROM users LIMIT 50"
    );
    return rows;
  } catch (err) {
    throw new DBError("Find error", "User", err);
  }
};

export const findByUsername = async (username) => {
  try {
    const { rows } = await db.query(
      "SELECT id, username, password FROM users WHERE username=$1",
      [username]
    );

    return !rows.length ? null : rows[0];
  } catch (err) {
    throw new DBError("Find error", "User", err);
  }
};

export const findByEmail = async (email) => {
  try {
    const { rows } = await db.query(
      "SELECT id, username, password, email FROM users WHERE email=$1",
      [email]
    );
    return !rows.length ? null : rows[0];
  } catch (err) {
    throw new DBError("Find error", "User", err);
  }
};

export const create = async (email, username, hash) => {
  try {
    const { rows } = await db.query(
      "INSERT INTO users(email, username, password) VALUES($1, $2, $3) returning *",
      [email, username, hash]
    );
    return !rows.length ? null : rows[0];
  } catch (err) {
    throw new DBError("Create error", "User", err);
  }
};

export const deleteById = async (id) => {
  try {
    const { rows } = await db.query(
      "DELETE FROM users WHERE id=$1 returning *",
      [id]
    );
    return !rows.length ? null : rows[0];
  } catch (err) {
    throw new DBError("Delete error", "User", err);
  }
};

/**
 * Finds a registration table
 * @return user user and registration id
 */
export const findByRegistrationToken = async (token) => {
  try {
    const { rows } = await db.query(
      "SELECT registrations.rid, users.id, users.username, users.registered FROM registrations INNER JOIN users ON registrations.uid = users.id WHERE registrations.rid=$1",
      [token]
    );
    return !rows.length ? null : rows[0];
  } catch (err) {
    throw new DBError("Delete error", "User", err);
  }
};

export const updateById = async (id, obj) => {
  let query = "";
  let values = [];
  let i = 2;
  for (let [k, v] of Object.entries(obj)) {
    query = `${query}${k}=$${i}, `;
    values.push(v);
    i++;
  }
  query = query.replace(/, $/, "");

  try {
    const { rows } = await db.query(
      `UPDATE users SET ${query} WHERE id=$1 returning *`,
      [id, ...values]
    );
    return !rows.length ? null : rows[0];
  } catch (err) {
    throw new DBError("Delete error", "User", err);
  }
};
