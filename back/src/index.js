"use strict";

import { migrate } from "./db/migration.js";
import { Jibuxpress } from "./lib/Jibuxpress.js";
import {
  confirmPwdReset,
  confirmRegistration,
  logout,
  pwdReset,
  signIn,
  signUp,
} from "./controllers/authController.js";
import {
  authGuard,
  confirmPwdResetSanitize,
  pwdResetSanitize,
  signInSanitize,
  signUpSanitize,
} from "./middlewares/authMiddleware.js";
import { me } from "./controllers/userController.js";
import {
  allowCors,
  bodyParser,
  logRequest,
} from "./middlewares/appMiddleware.js";

try {
  await migrate();
} catch (err) {
  console.log("database migration error:");
  console.log(err);
}

const app = new Jibuxpress();

app.use(logRequest, allowCors, authGuard, bodyParser);

app.route("/me").get(me);

app.route("/logout").get(logout);

app
  .route("/signin")
  .post(signInSanitize, signIn)
  .options((req, res) => res.end());

app
  .route("/signup")
  .post(signUpSanitize, signUp)
  .options((req, res) => res.end());

app
  .route("/pwdreset")
  .post(confirmPwdResetSanitize, confirmPwdReset)
  .options((req, res) => res.end());

app.route("/registration/:token").get(confirmRegistration);

app.route("/pwdreset/:token").get(pwdResetSanitize, pwdReset);

app.listen(4000, () => {
  console.log("Listening for request");
});

// response interceptor middleware to filter outgoing data (exclude password)

// app.use("/users", (req, res, next) => {
//   const end = res.end;
//   res.end = (data) => {
//     if (data && typeof data === "object") {
//       let filter = data.map((elem) => {
//         const { id, username } = elem;
//         return { id, username };
//       });

//       data = JSON.stringify(filter);
//     }

//     res.end = end;
//     end.call(res, data);
//   };
//   next();
// });
