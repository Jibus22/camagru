import { navigateTo } from "../router.js";
import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Signin");
  }

  async addEvents(id) {
    const links = document.querySelector(id).querySelectorAll("a");
    for (let link of links.values()) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo(link.pathname);
      });
    }
  }

  async render(id) {
    const view = `
      <div class="page-container">
        <div class="page-content">
          <div class="signin">
            <h1>Sign in to Camagru</h1>
            <form class="sign__form" method="post" action="/session">
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
          </div>
        </div>
      </div>
  `;
    document.querySelector(id).innerHTML = view;

    this.addEvents(".signin");
  }
}
