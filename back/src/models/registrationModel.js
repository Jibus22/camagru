import * as db from "../db/index.js";
import { DBError } from "../errors/DBError.js";

export const create = async (id) => {
  try {
    const { rows } = await db.query(
      "INSERT INTO registrations(uid) VALUES($1) returning *",
      [id]
    );
    return !rows.length ? null : rows[0];
  } catch (err) {
    throw new DBError("Create error", "Auth", err);
  }
};

export const deleteOutdated = async (date) => {
  try {
    const { rows } = await db.query(
      "DELETE FROM registrations WHERE created_date < $1 returning *",
      [date]
    );
    return !rows.length ? null : rows;
  } catch (err) {
    throw new DBError("Create error", "Auth", err);
  }
};

export const deleteById = async (id) => {
  try {
    const { rows } = await db.query(
      "DELETE FROM registrations WHERE rid=$1 returning *",
      [id]
    );
    return !rows.length ? null : rows[0];
  } catch (err) {
    throw new DBError("Delete error", "Auth", err);
  }
};
