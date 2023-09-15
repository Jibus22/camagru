"use strict";

import { migrate } from "./db/migration.js";
import { Jibuxpress } from "./lib/Jibuxpress.js";
import { getUsers } from "./controllers/userController.js";
import {
  confirmRegistration,
  signIn,
  signUp,
} from "./controllers/authController.js";
import { authGuard } from "./middlewares/authMiddleware.js";
import { getBody } from "./utils.js";
import { allowCors, logRequest } from "./middlewares/appMiddleware.js";

try {
  await migrate();
} catch (err) {
  console.log("database migration error:");
  console.log(err);
}

const app = new Jibuxpress();

app.use(logRequest, allowCors, authGuard);

// response interceptor middleware to filter outgoing data (exclude password)
app.use("/users", (req, res, next) => {
  const end = res.end;
  res.end = (data) => {
    if (data && typeof data === "object") {
      let filter = data.map((elem) => {
        const { id, username } = elem;
        return { id, username };
      });

      data = JSON.stringify(filter);
    }

    res.end = end;
    end.call(res, data);
  };
  next();
});

app
  .route("/users")
  .get((req, res) => {
    getUsers(req, res);
  })
  .post(async (req, res) => {
    console.log(`url: ${req.url}, method: ${req.method}`);
    const body = await getBody(req);
    res.json({
      msg: "You have requested POST on /users route",
      body: `you sent ${body}`,
    });
  });

app
  .route("/signin")
  .post(signIn)
  .options((req, res) => res.end());

app
  .route("/signup")
  .post(signUp)
  .options((req, res) => res.end());

app.route("/registration/:token").get(confirmRegistration);

app.listen(4000, () => {
  console.log("Listening for request");
});
