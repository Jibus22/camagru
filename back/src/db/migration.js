import * as db from "./index.js";

const db_tables = [
  {
    name: "users",
    query: `id UUID PRIMARY KEY,
  email VARCHAR(128) UNIQUE NOT NULL,
  username VARCHAR(128) UNIQUE NOT NULL,
  password VARCHAR(128),
  photo BYTEA,
  created_date TIMESTAMP
    `,
  },
  {
    name: "posts",
    query: `id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  photo BYTEA NOT NULL,
  created_date TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
    `,
  },
  {
    name: "comments",
    query: `id UUID PRIMARY KEY,
  body TEXT,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  created_date TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
    `,
  },
  {
    name: "likes",
    query: `id INT PRIMARY KEY NOT NULL,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
    `,
  },
];

// Creates tables if they don't exist, within a transaction
export const migrate = async () => {
  const client = await db.getClient();

  try {
    await client.query("BEGIN");

    db_tables.forEach(async (table) => {
      const queryText = `CREATE TABLE IF NOT EXISTS ${table.name}(${table.query})`;
      try {
        await client.query(queryText);
      } catch (e) {
        throw e;
      }
    });

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};
