"use strict";

import { migrate } from "./db/migration.js";
import { Jibuxpress } from "./lib/Jibuxpress.js";
import {
  confirmPwdReset,
  confirmRegistration,
  logout,
  mailUpdate,
  pwdReset,
  signIn,
  signUp,
} from "./controllers/authController.js";
import {
  authGuard,
  authSession,
  confirmPwdResetSanitize,
  editSanitize,
  mailUpdateSanitize,
  pwdResetSanitize,
  signInSanitize,
  signUpSanitize,
} from "./middlewares/authMiddleware.js";
import { editProfile, me, updateAvatar } from "./controllers/userController.js";
import {
  allowCors,
  bodyParser,
  logRequest,
} from "./middlewares/appMiddleware.js";
import {
  comment,
  deletePost,
  getComments,
  getCreations,
  getPhotoCreation,
  getPosts,
  getPostsNb,
  getReactions,
  likePost,
  newPost,
  postPublish,
} from "./controllers/galleryController.js";
import { dbConnection } from "./db/index.js";

try {
  dbConnection();
  await migrate();
} catch (err) {
  process.exit(1);
}

const app = new Jibuxpress();

app.use(logRequest, allowCors, authSession, bodyParser);

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

// PATCH
app
  .route("/edit")
  .post(editSanitize, editProfile)
  .options((req, res) => res.end());

// PATCH
app
  .route("/edit/avatar")
  .post(authGuard, updateAvatar)
  .options((req, res) => res.end());

app.route("/registration/:token").get(confirmRegistration);

app.route("/pwdreset/:token").get(pwdResetSanitize, pwdReset);

app.route("/mailupdate/:token").get(mailUpdateSanitize, mailUpdate);

app
  .route("/gallery")
  .post(getPosts)
  .options((req, res) => res.end());

app
  .route("/gallery/postreactions")
  .post(getReactions)
  .options((req, res) => res.end());

app
  .route("/gallery/postreactions/like")
  .post(likePost)
  .options((req, res) => res.end());

app
  .route("/comment")
  .post(authGuard, comment)
  .options((req, res) => res.end());

app
  .route("/gallery/postreactions/getcomments")
  .post(getComments)
  .options((req, res) => res.end());

app.get("/gallery/postnb", getPostsNb);

app
  .route("/newpost")
  .post(authGuard, newPost)
  .options((req, res) => res.end());

app
  .route("/post/new")
  .post(authGuard, postPublish)
  .options((req, res) => res.end());

app.get("/gallery/creations", authGuard, getCreations);

app
  .route("/gallery/creations/photo")
  .post(authGuard, getPhotoCreation)
  .options((req, res) => res.end());

app
  .route("/gallery/creations/delete")
  .delete(authGuard, deletePost)
  .options((req, res) => {
    res.setHeader("Access-Control-Allow-Methods", "DELETE");
    res.end();
  });

app.listen(4000, () => {
  console.log("Listening for request");
});
