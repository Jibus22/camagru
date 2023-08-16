import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Sign up");
  }

  async render(id) {
    const view = `
      <div class="page-container">
        <div class="page-content">
          <div class="signup">
            <h1>Create an account</h1>
            <form class="sign__form" method="post" action="/signup">
              <label for="email_field">Enter your email</label>
              <input id="email_field" type="text" name="email"/>
              <label for="password_field">Create a password</label>
              <input id="password_field" type="password" name="password"/>
              <label for="username_field">Enter a username</label>
              <input id="username_field" type="text" name="username"/>
              <button type="submit" >Sign up</button>
            </form>
          </div>
        </div>
      </div>
      `;
    document.querySelector(id).innerHTML = view;
  }
}
