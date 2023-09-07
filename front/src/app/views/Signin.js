import { navigateTo } from "../router.js";
import { createElement, postHttpRequest } from "../utils.js";
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

  async submitForm(e, form) {
    e.preventDefault();

    const btnSubmit = form.querySelector("button");
    btnSubmit.disabled = true;
    const style = document.createElement("style");
    style.appendChild(
      document.createTextNode("button:hover{cursor: not-allowed}")
    );
    btnSubmit.append(style);
    setTimeout(() => {
      btnSubmit.disabled = false;
      style.remove();
    }, 2000);

    const jsonFormData = this.buildJsonFormData(form);
    const headers = {
      "Content-Type": "application/json",
    };

    try {
      const response = await postHttpRequest(
        "http://localhost:4000/session",
        headers,
        jsonFormData
      );
      console.log(response);
      // processer la réponse:
      // si le serveur me dit ok je te reconnais bébé, je prend le token de
      // connexion qu'il me donne et je me fais rediriger vers la page d'accueil
      // avec la possibilté de voir la barre de nav en mode connecté et de faire
      // les trucs de gens connectés (pouvoir commenter etc)
      //
      // sinon je reste sur la page mais j'affiche une petite fenêtre qui dit
      // "identifiants incorrects, rééssayez"
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
