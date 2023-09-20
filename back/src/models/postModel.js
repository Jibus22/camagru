import * as db from "../db/index.js";
import { DBError } from "../errors/DBError.js";

export const findSome = async (page, limit) => {
  try {
    const { rows } = await db.query(
      `SELECT posts.created_date, posts.id, posts.photo, users.photo AS avatar, users.username
       FROM posts INNER JOIN users
       ON posts.user_id = users.id
       ORDER BY posts.created_date DESC
       LIMIT $1 OFFSET $2`,
      [limit, page]
    );
    return !rows.length ? null : rows;
  } catch (err) {
    throw new DBError("Find error", "Post", err);
  }
};

export const getReactions = async (id) => {
  try {
    const { rows } = await db.query(
      `SELECT COALESCE(l.cnt, 0) AS like_cnt, COALESCE(c.cnt, 0) AS comment_cnt
       FROM posts p
       LEFT JOIN
         (SELECT post_id, COUNT(*) AS cnt FROM likes WHERE post_id=$1 GROUP BY post_id) l
       ON p.id = l.post_id
       LEFT JOIN
         (SELECT post_id, COUNT(*) AS cnt FROM comments WHERE post_id=$1 GROUP BY post_id) c
       ON p.id = c.post_id
       WHERE p.id=$1
       ORDER BY p.id
      `,
      [id]
    );
    return !rows.length ? null : rows[0];
  } catch (err) {
    throw new DBError("Find error", "Post", err);
  }
};

export const isLiked = async (uid, id) => {
  try {
    const { rows } = await db.query(
      `SELECT CASE WHEN EXISTS
         (SELECT 1 FROM likes WHERE likes.user_id=$1 AND likes.post_id=$2)
       THEN true
       ELSE false
       END`,
      [uid, id]
    );
    return !rows.length ? null : rows[0];
  } catch (err) {
    throw new DBError("Find error", "Post", err);
  }
};

export const like = async (uid, pid) => {
  try {
    const { rows } = await db.query(
      `INSERT INTO likes(user_id, post_id) VALUES($1, $2) returning *`,
      [uid, pid]
    );
    return !rows.length ? null : rows[0];
  } catch (err) {
    throw new DBError("Insert error", "Post", err);
  }
};

export const dislike = async (uid, pid) => {
  try {
    const { rows } = await db.query(
      `DELETE FROM likes WHERE user_id=$1 AND post_id=$2 returning *`,
      [uid, pid]
    );
    return !rows.length ? null : rows[0];
  } catch (err) {
    throw new DBError("Delete error", "Post", err);
  }
};
