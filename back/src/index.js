"use strict";

import http from "http";
import * as db from "./db/index.js";

const server = http.createServer(async (req, res) => {
  const urlPath = req.url;
  if (urlPath === "/overview") {
    res.end('Welcome to the "overview page" of the nginX project');
  } else if (urlPath === "/api") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        product_id: "xyz12u4",
        product_name: "NginX injector",
      })
    );
  } else {
    try {
      const { rows } = await db.query("SELECT * FROM table_test");
      console.log(rows);
    } catch (err) {
      console.error(err);
    }
    res.end("Successfully started a server");
  }
});

server.listen(4000, () => {
  console.log("Listening for request");
});
