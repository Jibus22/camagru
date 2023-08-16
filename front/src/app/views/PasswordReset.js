import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Reset password");
  }

  async render(id) {
    const view = `
      <div class="page-container">
        <div class="page-content">
          <div class="password_reset">
            <h1>Reset your password</h1>
            <form class="sign__form" method="post" action="/password_reset">
              <label for="email_field">Enter your user account's verified email address and we will send you a password reset link.</label>
              <input id="email_field" type="text" name="email" placeholder="Enter your email address" />
              <button type="submit" >Send password reset email</button>
            </form>
          </div>
        </div>
      </div>
      `;
    document.querySelector(id).innerHTML = view;
  }
}
