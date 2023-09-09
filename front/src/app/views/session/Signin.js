import { navigateTo } from "../../router.js";
import { createElement } from "../../utils.js";
import AbstractView from "../AbstractView.js";
import {
  displayInvalidAuth,
  displayValidAuth,
  submitForm,
} from "./submitForm.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Signin");
  }

  async renderSignin(signin) {
    signin.innerHTML = `
      <h1>Sign in to Camagru</h1>
      <form class="sign__form" action="">
        <label for="login_field">Username</label>
        <input id="login_field" type="text" name="username" />
        <div>
          <label for="password_field">Password</label>
          <input id="password_field" type="password" name="password" />
          <button type="submit">Sign in</button>
          <a href="/password_reset">Forgot password ?</a>
        </div>
      </form>
      <p>No user account ? <a href="/signup">Sign up</a>.</p>
    `;

    const links = signin.querySelectorAll("a");
    for (let link of links.values()) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo(link.pathname);
      });
    }

    const form = signin.querySelector(".sign__form");

    form.addEventListener("submit", (e) => {
      submitForm(e, form, "http://localhost:4000/signin", (res, btn) => {
        if (res.authenticated == true) {
          displayValidAuth(form, "You are authenticated ! Welcome.");
          setTimeout(() => {
            navigateTo("/");
          }, 1000);
          return;
        } else {
          if (btn) btn.trigger();
          displayInvalidAuth(form, "Authentication error. Please try again.");
        }
      });
    });
  }

  async render(id) {
    const pageContainer = createElement("div", ["page-container"]);
    const pageContent = createElement("div", ["page-content"]);
    const signin = createElement("div", ["signin"]);

    pageContainer.append(pageContent);
    pageContent.append(signin);
    this.renderSignin(signin);

    document.querySelector(id).innerHTML = "";
    document.querySelector(id).append(pageContainer);
  }
}
