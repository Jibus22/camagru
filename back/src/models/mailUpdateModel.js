import * as db from "../db/index.js";
import { DBError } from "../errors/DBError.js";

export const create = async (uid, mail) => {
  try {
    const { rows } = await db.query(
      "INSERT INTO mail_update(uid, new_email) VALUES($1, $2) returning *",
      [uid, mail]
    );
    return !rows.length ? null : rows[0];
  } catch (err) {
    throw new DBError("Create error", "Auth", err);
  }
};

export const deleteOutdated = async (date) => {
  try {
    const { rows } = await db.query(
      "DELETE FROM mail_update WHERE created_date < $1 returning *",
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
      "DELETE FROM mail_update WHERE id=$1 returning *",
      [id]
    );
    return !rows.length ? null : rows[0];
  } catch (err) {
    throw new DBError("Delete error", "Auth", err);
  }
};

export const find = async (id, uid) => {
  try {
    const { rows } = await db.query(
      "SELECT new_email FROM mail_update WHERE id=$1 AND uid=$2",
      [id, uid]
    );

    return !rows.length ? null : rows[0];
  } catch (err) {
    throw new DBError("Find error", "User", err);
  }
};
