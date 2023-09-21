import { displayFooter, displayNavbar } from "./structure";
import "../styles/style.scss";
import { router } from "./router";
import { me } from "./utils/utils";

// update the content of the route according to the navigator back/forward button
window.addEventListener("popstate", router);

window.addEventListener("DOMContentLoaded", async () => {
  document.querySelector("#app").innerHTML = `
    <div id="navbar"></div>
    <div id="content"></div>
    <div id="footer"></div>
    `;

  const response = await fetch("http://localhost:4000/me", {
    credentials: "include",
  });

  const body = await response.json();

  if (body.avatar?.data) {
    const avatar = new Uint8Array(body.avatar.data);
    const blob = new Blob([avatar], { type: "image/jpeg" });
    const url = URL.createObjectURL(blob);
    me.avatar = url;
  } else {
    me.avatar = body.avatar;
  }

  me.auth = body.auth;
  me.username = body.username;

  displayNavbar("#navbar");
  displayFooter("#footer");

  // find the view corresponding to the url and load it into #content div
  router();
});
