import * as db from "../db/index.js";

export const createSession = async (id) => {
  const { rows } = await db.query(
    "INSERT INTO sessions(uid) VALUES($1) returning *",
    [id]
  );
  return !rows.length ? null : rows[0];
};

export const findOneSession = async (uid, sid) => {
  const { rows } = await db.query(
    "SELECT uid, sid, created_date FROM sessions WHERE uid=$1 AND sid=$2",
    [uid, sid]
  );

  return !rows.length ? null : rows[0];
};

// Delete expired sessions of uid.
export const deleteSessionByDate = async (uid, date) => {
  const { rows } = await db.query(
    "DELETE FROM sessions WHERE uid=$1 AND created_date < $2 returning *",
    [uid, date]
  );

  return !rows.length ? null : rows;
};
