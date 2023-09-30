"use strict";

import fs from "fs";
import pg from "pg";

const { Pool } = pg;

let db_conn = {
  host: "postgresql_db",
  port: 5432,
};

let pool;

export const dbConnection = () => {
  const path_to_password = "/run/secrets/db-password";

  try {
    db_conn.database = process.env.POSTGRES_DB;
    db_conn.user = process.env.POSTGRES_USER;
    db_conn.password = fs.readFileSync(path_to_password, "utf8");
    pool = new Pool(db_conn);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.DEV)
    console.log("executed query", { text, duration, rows: res.rowCount });
  return res;
};

export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  // set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error("A client has been checked out for more than 5 seconds!");
    console.error(
      `The last executed query on this client was: ${client.lastQuery}`
    );
  }, 5000);
  // monkey patch the query method to keep track of the last query executed
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };
  client.release = () => {
    // clear our timeout
    clearTimeout(timeout);
    // set the methods back to their old un-monkey-patched version
    client.query = query;
    client.release = release;
    return release.apply(client);
  };
  return client;
};
