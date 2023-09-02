"use strict";

import http from "http";
import * as db from "./db/index.js";
import { migrate } from "./db/migration.js";
import { getBody } from "./utils.js";

try {
  await migrate();
} catch (err) {
  console.log("____ oopsie:");
  console.log(err);
}

// const server = http.createServer(async (req, res) => {
//   if (req.url === "/session") {
//     res.writeHead(200, {
//       "Access-Control-Allow-Origin": "http://localhost:5173",
//       "Access-Control-Allow-Headers": "Content-Type",
//       "Access-Control-Allow-Credentials": true,
//       "Content-Type": "application/json",
//     });
//     if (req.method === "OPTION") {
//       res.end(JSON.stringify({ message: "niquel michel" }));
//     } else {
//       let body = await getBody(req);

//       res.end(JSON.stringify(body));
//     }
//   } else if (req.url == "/blablabla") {
//     try {
//       const { rows } = await db.query("SELECT * FROM table_test");
//       console.log(rows);
//     } catch (err) {
//       console.error(err);
//     }
//     res.end("Successfully started a server");
//   } else {
//     res
//       .writeHead(404, { "Content-Type": "application/json" })
//       .end(JSON.stringify({ message: "route not found" }));
//   }
// });

const bla = {
  GET: {
    "/": () => console.log("get /"),
    "/caca": () => console.log("get caca"),
  },
  POST: {
    "/": () => console.log("post /"),
    "/caca": () => console.log("post caca"),
  },
};

class HttpRouter {
  constructor() {
    this.routes = {
      HEAD: {},
      GET: {},
      POST: {},
      PUT: {},
      DELETE: {},
      PATCH: {},
      OPTION: {},
      TRACE: {},
      CONNECT: {},
    };
  }

  head(route, callback) {
    this.routes.POST[route] = callback;
  }

  get(route, callback) {
    this.routes.GET[route] = callback;
  }

  post(route, callback) {
    this.routes.POST[route] = callback;
  }

  put(route, callback) {
    this.routes.POST[route] = callback;
  }

  delete(route, callback) {
    this.routes.POST[route] = callback;
  }

  patch(route, callback) {
    this.routes.POST[route] = callback;
  }

  option(route, callback) {
    this.routes.POST[route] = callback;
  }

  processIncomingHttpMessage(req, res) {
    const fn = this.routes[req.method][req.url];
    if (fn == undefined) return;
    fn(req, res);
  }
}

const router = new HttpRouter();

router.get("/", (req, res) => {
  console.log("yo");
  res
    .writeHead(200, { "Content-Type": "application/json" })
    .end(JSON.stringify({ message: "caca", url: req.url, method: req.method }));
});

router.post("/", (req, res) => {
  console.log("yo");
  res
    .writeHead(200, { "Content-Type": "application/json" })
    .end(JSON.stringify({ message: "caca", url: req.url, method: req.method }));
});

console.log(router.routes);

const server = http.createServer(async (req, res) => {
  router.processIncomingHttpMessage(req, res);
});

server.listen(4000, () => {
  console.log("Listening for request");
});
