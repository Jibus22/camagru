import { displayFooter, displayNavbar } from "./structure";
import "../styles/style.scss";
import { router } from "./router";
import { getMe } from "./utils/utils";

// update the content of the route according to the navigator back/forward button
window.addEventListener("popstate", router);

window.addEventListener("DOMContentLoaded", async () => {
  document.querySelector("#app").innerHTML = `
    <div id="navbar"></div>
    <div id="content"></div>
    <div id="footer"></div>
    `;

  await getMe();

  displayNavbar("#navbar");
  displayFooter("#footer");

  // find the view corresponding to the url and load it into #content div
  router();
});
