import AbstractView from "../AbstractView.js";
import { createElement } from "../../utils/utils.js";
import { displayAuthResponse, submitForm } from "../../utils/submitForm.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Sign up");
  }

  renderSignup(profile) {
    profile.innerHTML = `
        <h1>Edit profile</h1>
        <p>Fullfill any field you want to edit</p>
        <form class="sign__form" action="">
          <label for="email_field">Change email</label>
          <input id="email_field" type="text" name="email"/>
          <label for="password_field">Change password</label>
          <input id="password_field" type="password" name="password"/>
          <label for="username_field">Change username</label>
          <input id="username_field" type="text" name="username"/>
          <button type="submit" >Edit</button>
        </form>
      `;

    const form = profile.querySelector(".sign__form");

    form.addEventListener("submit", (e) => {
      submitForm(e, form, "http://localhost:4000/edit", (res, btn) => {
        if (res.auth == true) {
          displayAuthResponse(form, res.msg, "valid-msg");
          return;
        } else {
          if (btn) btn.trigger();
          displayAuthResponse(form, res.msg, "invalid-msg");
        }
      });
    });
  }

  async render(id) {
    const pageContainer = createElement("div", ["page-container"]);
    const pageContent = createElement("div", ["page-content"]);
    const profile = createElement("div", ["signup"]);

    pageContainer.append(pageContent);
    pageContent.append(profile);
    this.renderSignup(profile);

    document.querySelector(id).innerHTML = "";
    document.querySelector(id).append(pageContainer);
  }
}