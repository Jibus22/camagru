import * as db from "../db/index.js";

export const createSession = async (id) => {
  const { rows } = await db.query(
    "INSERT INTO sessions(uid) VALUES($1) returning *",
    [id]
  );
  return !rows.length ? null : rows[0];
};

export const findSession = async (uid, sid) => {
  const { rows } = await db.query(
    "SELECT uid, sid, created_date FROM sessions WHERE uid=$1 AND sid=$2",
    [uid, sid]
  );

  return !rows.length ? null : rows[0];
};

export const findSessionById = async (id) => {
  const { rows } = await db.query(
    "SELECT uid, sid, created_date FROM sessions WHERE uid=$1",
    [id]
  );

  return !rows.length ? null : rows;
};
