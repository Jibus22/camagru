import { navigateTo } from "../router.js";
import { createElement, newTimeout, postHttpRequest } from "../utils.js";
import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Signin");
  }

  buildJsonFormData(form) {
    const jsonFormData = {};
    const formData = new FormData(form);
    for (const pair of formData) jsonFormData[pair[0]] = pair[1];
    return jsonFormData;
  }

  displayValidAuth(form) {
    const msg = createElement("div", ["sign__form__valid-msg"]);
    const invalid = form.querySelector(".sign__form__invalid-msg");
    if (invalid) invalid.remove();
    msg.innerHTML = "You are authenticated ! Welcome.";
    form.append(msg);
  }

  displayInvalidAuth(form) {
    const msg = createElement("div", ["sign__form__invalid-msg"]);
    msg.innerHTML = "Authentication error. Please try again.";
    form.append(msg);
  }

  async submitForm(e, form) {
    e.preventDefault();

    const btnSubmit = form.querySelector("button");
    const style = document.createElement("style");
    style.appendChild(
      document.createTextNode("button:hover{cursor: not-allowed}")
    );

    const btnTimeout = newTimeout(() => {
      btnSubmit.disabled = false;
      style.remove();
    }, 2000);

    btnSubmit.disabled = true;
    btnSubmit.append(style);

    const jsonFormData = this.buildJsonFormData(form);

    try {
      const response = await postHttpRequest(
        "http://localhost:4000/session",
        { "Content-Type": "application/json" },
        jsonFormData
      );

      if (response.authenticated == true) {
        this.displayValidAuth(form);
        setTimeout(() => {
          navigateTo("/");
        }, 1000);
        return;
      } else {
        btnTimeout.trigger();
        this.displayInvalidAuth(form);
      }
    } catch (err) {
      console.error("Signin error: " + err);
      // display something to say it din't worked, try again.
    }
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
      this.submitForm(e, form);
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
