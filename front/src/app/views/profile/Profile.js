import AbstractView from "../AbstractView.js";
import { createElement, getMe, me } from "../../utils/utils.js";
import { displayAuthResponse, submitForm } from "../../utils/submitForm.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Sign up");
  }

  renderForm(form) {
    form.innerHTML = "";
    form.innerHTML = `
      <label for="email_field">Change email</label>
      <input id="email_field" type="email" name="email"/>
      <label for="password_field">Change password</label>
      <input id="password_field" type="password" name="password"/>
      <label for="username_field">Change username</label>
      <input id="username_field" type="text" name="username"/>
      <label for="notif">${
        me.notif ? "Disable" : "Enable"
      } email notification</label>
      <div class="checkbox">
        <input id="notif" type="checkbox" name=${
          me.notif ? "disable" : "enable"
        } value="true" /> 
      </div>
      <button type="submit" >Edit</button>
    `;
  }

  renderSignup(profile) {
    const form = createElement("form", ["sign__form"]);

    this.renderForm(form);
    profile.innerHTML = `
        <h1>Edit profile</h1>
        <p>Fullfill any field you want to edit</p>
      `;
    profile.append(form);

    form.addEventListener("submit", (e) => {
      submitForm(e, form, "http://localhost:4000/edit", async (res, btn) => {
        if (res.auth == true) {
          await getMe();
          this.renderForm(form);
          displayAuthResponse(form, res.msg, "valid-msg");
          return;
        } else {
          if (btn) btn.trigger();
          displayAuthResponse(form, res.msg, "invalid-msg");
        }
      });
    });
  }

  renderProfile(profile) {
    const profilePrez = createElement("div", ["profile_prez"]);
    profile.prepend(profilePrez);

    profilePrez.innerHTML = `
      <div class="user_id"> <img src=${me.avatar} /> </div>
      <p class="profile_prez__username" >${me.username}</p>
      <p class="profile_prez__email" >${me.email}</p>
      <hr/>
    `;
  }

  async render(id) {
    if (!me.auth) return;
    const pageContainer = createElement("div", ["page-container"]);
    const pageContent = createElement("div", ["page-content"]);
    const profile = createElement("div", ["signup"]);

    pageContainer.append(pageContent);
    pageContent.append(profile);
    this.renderSignup(profile);
    this.renderProfile(profile);

    document.querySelector(id).innerHTML = "";
    document.querySelector(id).append(pageContainer);
  }
}
