import * as db from "../db/index.js";
import { DBError } from "../errors/DBError.js";

export const create = async (id) => {
  const { rows } = await db.query(
    "INSERT INTO password_reset(uid) VALUES($1) returning *",
    [id]
  );
  return !rows.length ? null : rows[0];
};

export const deleteOutdated = async (date) => {
  try {
    const { rows } = await db.query(
      "DELETE FROM password_reset WHERE created_date < $1 returning *",
      [date]
    );
    return !rows.length ? null : rows;
  } catch (err) {
    throw new DBError("Create error", "PasswordReset", err);
  }
};

export const deleteById = async (id) => {
  try {
    const { rows } = await db.query(
      "DELETE FROM password_reset WHERE id=$1 returning *",
      [id]
    );
    return !rows.length ? null : rows[0];
  } catch (err) {
    throw new DBError("Delete error", "User", err);
  }
};
