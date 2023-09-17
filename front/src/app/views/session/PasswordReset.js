import { createElement } from "../../utils.js";
import AbstractView from "../AbstractView.js";
import { displayAuthResponse, submitForm } from "./submitForm.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Reset password");
  }

  renderPwdReset(pwdReset) {
    pwdReset.innerHTML = `
        <h1>Reset your password</h1>
        <form class="sign__form" method="post" action="/password_reset">
          <label for="email_field">Enter your user account's verified email address and we will send you a password reset link.</label>
          <input id="email_field" type="text" name="email" placeholder="Enter your email address" />
          <button type="submit" >Send password reset email</button>
        </form>
      `;

    const form = pwdReset.querySelector(".sign__form");

    form.addEventListener("submit", (e) => {
      submitForm(
        e,
        form,
        "http://localhost:4000/confirmpwdreset",
        (res, btn) => {
          if (res.auth == true) {
            displayAuthResponse(form, res.msg, "valid-msg");
            return;
          } else {
            if (btn) btn.trigger();
            displayAuthResponse(form, res.msg, "invalid-msg");
          }
        }
      );
    });
  }

  async render(id) {
    const pageContainer = createElement("div", ["page-container"]);
    const pageContent = createElement("div", ["page-content"]);
    const pwdReset = createElement("div", ["password_reset"]);

    pageContainer.append(pageContent);
    pageContent.append(pwdReset);
    this.renderPwdReset(pwdReset);

    document.querySelector(id).innerHTML = "";
    document.querySelector(id).append(pageContainer);
  }
}
