import * as db from "./index.js";

const db_tables = [
  {
    name: "users",
    query: `id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
  email VARCHAR(128) UNIQUE NOT NULL,
  username VARCHAR(128) UNIQUE NOT NULL,
  password VARCHAR(128) NOT NULL,
  photo BYTEA,
  registered BOOL DEFAULT FALSE,
  post_notif BOOL DEFAULT TRUE,
  created_date TIMESTAMP DEFAULT current_timestamp
    `,
  },
  {
    name: "posts",
    query: `id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
  user_id UUID NOT NULL,
  photo BYTEA NOT NULL,
  created_date TIMESTAMP DEFAULT current_timestamp,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `,
  },
  {
    name: "comments",
    query: `id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
  body TEXT,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  created_date TIMESTAMP DEFAULT current_timestamp,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `,
  },
  {
    name: "likes",
    query: `id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `,
  },
  {
    name: "sessions",
    query: `sid UUID DEFAULT gen_random_uuid () PRIMARY KEY,
  uid UUID NOT NULL,
  created_date TIMESTAMP DEFAULT current_timestamp,
  FOREIGN KEY (uid) REFERENCES users(id) ON DELETE CASCADE
    `,
  },
  {
    name: "registrations",
    query: `rid UUID DEFAULT gen_random_uuid () PRIMARY KEY,
  uid UUID NOT NULL,
  created_date TIMESTAMP DEFAULT current_timestamp,
  FOREIGN KEY (uid) REFERENCES users(id) ON DELETE CASCADE
    `,
  },
  {
    name: "password_reset",
    query: `id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
  uid UUID NOT NULL,
  created_date TIMESTAMP DEFAULT current_timestamp,
  FOREIGN KEY (uid) REFERENCES users(id) ON DELETE CASCADE
    `,
  },
  {
    name: "mail_update",
    query: `id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
  uid UUID NOT NULL,
  new_email VARCHAR(128) NOT NULL,
  created_date TIMESTAMP DEFAULT current_timestamp,
  FOREIGN KEY (uid) REFERENCES users(id) ON DELETE CASCADE
    `,
  },
];

/**
 * Creates tables if they don't exist, within a transaction. Useful when starting
 * the project with a blank database, for development.
 */
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
    console.error("Migration error: " + e);
    throw e;
  } finally {
    client.release();
  }
};
