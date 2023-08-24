import { displayFooter, displayNavbar } from "./structure.js";
import "../styles/style.scss";
import { router } from "./router.js";

// update the content of the route according to the navigator back/forward button
window.addEventListener("popstate", router);

window.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#app").innerHTML = `
    <div id="navbar"></div>
    <div id="content"></div>
    <div id="footer"></div>
    `;

  displayNavbar("#navbar");
  displayFooter("#footer");

  // find the view corresponding to the url and load it into #content div
  router();
});
