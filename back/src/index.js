"use strict";

import { migrate } from "./db/migration.js";
import { Jibuxpress } from "./lib/Jibuxpress.js";
import { getUsers } from "./controllers/userController.js";
import { getBody } from "./utils.js";

try {
  await migrate();
} catch (err) {
  console.log("____ oopsie:");
  console.log(err);
}

const app = new Jibuxpress();

// response interceptor middleware to filter outgoing data
app.use("/users", (req, res, next) => {
  const end = res.end;
  res.end = (data) => {
    let filter = data.map((elem) => {
      const { id, username } = elem;
      return { id, username };
    });

    data = JSON.stringify(filter);

    res.end = end;
    end.call(res, data);
  };
  next();
});

app.route("/users").get((req, res) => {
  getUsers(req, res);
});

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

// app.get("/", (req, res) => {
//   console.log("ya");
//   res
//     .writeHead(200, { "Content-Type": "application/json" })
//     .end(
//       JSON.stringify({ message: "ouech", url: req.url, method: req.method })
//     );
// });

// app.post("/", (req, res) => {
//   console.log("yo");
//   res
//     .writeHead(200, { "Content-Type": "application/json" })
//     .end(JSON.stringify({ message: "caca", url: req.url, method: req.method }));
// });

// app
//   .route("/pouet")
//   .get((req, res) => {
//     console.log("pouet pouet get");
//     res.writeHead(200, { "Content-Type": "application/json" }).end(
//       JSON.stringify({
//         message: "get pouet",
//         url: req.url,
//         method: req.method,
//       })
//     );
//   })
//   .post((req, res) => {
//     console.log("pouet pouet post");
//     res.writeHead(200, { "Content-Type": "application/json" }).end(
//       JSON.stringify({
//         message: "post pouet",
//         url: req.url,
//         method: req.method,
//       })
//     );
//   });

// app.use(
//   "/pouet",
//   (req, res, next) => {
//     console.log("1 Request Type:", req.method);
//     next();
//   },
//   (req, res, next) => {
//     console.log("2 Request url:", req.url);
//     next();
//   }
// );

// app.get(
//   "/caca",
//   (req, res, next) => {
//     console.log("1 YOUHPLAAAA 2EMMMMEMEYOUHPLAAAA 2EMMMMEMEMM");
//     console.log(req.url);
//     next();
//     console.log("oueche heeinn");
//   },
//   (req, res, next) => {
//     console.log("2 YOUHPLAAAA 2EMMMMEMEYOUHPLAAAA 2EMMMMEMEMM");
//     console.log(req.url);
//     next();
//     console.log("oueche OUououuh");
//   },
//   (req, res) => {
//     console.log("yo");
//     res
//       .writeHead(200, { "Content-Type": "application/json" })
//       .end(
//         JSON.stringify({ message: "caca", url: req.url, method: req.method })
//       );
//   }
// );

// app.use(
//   (req, res, next) => {
//     console.log("3 Request Type:", req.method);
//     next();
//   },
//   (req, res, next) => {
//     console.log("4 Request url:", req.url);
//     next();
//   }
// );

// console.dir(app.routeHandler, { depth: null });

app.listen(4000, () => {
  console.log("Listening for request");
});
