import AbstractView from "../AbstractView.js";
import { createElement } from "../../utils.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Sign up");
  }

  renderSignup(signup) {
    signup.innerHTML = `
        <h1>Create an account</h1>
        <form class="sign__form" action="">
          <label for="email_field">Enter your email</label>
          <input id="email_field" type="text" name="email"/>
          <label for="password_field">Create a password</label>
          <input id="password_field" type="password" name="password"/>
          <label for="username_field">Enter a username</label>
          <input id="username_field" type="text" name="username"/>
          <button type="submit" >Sign up</button>
        </form>
      `;

    const form = signup.querySelector(".sign__form");
    form.addEventListener("submit", (e) => {
      submitForm(e, form, "http://localhost:4000/signup", (res, btn) => {
        if (res.authenticated == true) {
          displayValidAuth(form, "Signed up, check your mail");
          setTimeout(() => {
            navigateTo("/");
          }, 1000);
          return;
        } else {
          if (btn) btn.trigger();
          displayInvalidAuth(form, "sign up error, please try again");
        }
      });
    });
  }

  async render(id) {
    const pageContainer = createElement("div", ["page-container"]);
    const pageContent = createElement("div", ["page-content"]);
    const signup = createElement("div", ["signup"]);

    pageContainer.append(pageContent);
    pageContent.append(signup);
    this.renderSignup(signup);

    document.querySelector(id).innerHTML = "";
    document.querySelector(id).append(pageContainer);
  }
}
