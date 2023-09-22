import AbstractView from "../AbstractView.js";
import {
  createElement,
  getMe,
  me,
  postHttpRequest,
} from "../../utils/utils.js";
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

  renderEdit(profile) {
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
      <label for="file-upload">
        <div class="user_id">
          <img class="avatar" src=${me.avatar} />
          <img class="newavatar div_hide"/>
        </div>
      </label>
      <input id="file-upload" type="file" accept="image/*">
      <p class="profile_prez__username" >${me.username}</p>
      <p class="profile_prez__email" >${me.email}</p>
      <hr/>
    `;

    const fileInput = profilePrez.querySelector("input");
    const avatar = profilePrez.querySelector(".avatar");
    const previewUpload = profilePrez.querySelector(".newavatar");

    fileInput.addEventListener("change", () => {
      const fileList = fileInput.files;
      let file = null;

      for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].type.match(/^image\/jpeg$/)) {
          file = fileList[i];
          break;
        }
      }

      if (!file) return; // wrong file format
      if (file.size > 500000) return; // Too heavy

      previewUpload.classList.remove("div_hide");
      avatar.classList.add("div_hide");

      previewUpload.addEventListener("load", () => {
        URL.revokeObjectURL(previewUpload.src); // no longer needed, free memory
      });

      previewUpload.src = URL.createObjectURL(file);

      const submitBtn = createElement("button", ["green_msg"]);
      const cancelBtn = createElement("button", ["red_msg"]);
      submitBtn.innerHTML = "Change avatar";
      cancelBtn.innerHTML = "Cancel";
      fileInput.after(submitBtn);
      submitBtn.after(cancelBtn);

      cancelBtn.addEventListener("click", () => {
        submitBtn.remove();
        cancelBtn.remove();
        previewUpload.classList.add("div_hide");
        avatar.classList.remove("div_hide");
      });

      submitBtn.addEventListener("click", () => {
        const username = profilePrez.querySelector(".profile_prez__username");
        const fr = new FileReader();

        // These manipulations are done to send data as an array in a json body.
        // I probably shouldn't do that and just send data through a
        // multipart form data but my backend don't handle this now, maybe later
        fr.readAsArrayBuffer(file);
        fr.onload = async () => {
          let result = new Uint8Array(fr.result);
          result = Array.from(result);

          try {
            const response = await postHttpRequest(
              "http://localhost:4000/edit/avatar",
              { "Content-Type": "application/json" },
              result
            );

            const okMsg = createElement("div", ["green_msg"]);
            okMsg.innerHTML = "Photo has been updated";
            username.before(okMsg);

            setTimeout(() => okMsg.remove(), 2200);

            await getMe(); // Update my global user data

            const navAvatar = document
              .querySelector("nav")
              .querySelector(".user_id")
              .querySelector("img");

            navAvatar.src = me.avatar; // Update navbar user avatar
          } catch (err) {
            console.error(err);
            const notOkMsg = createElement("div", ["red_msg"]);
            notOkMsg.innerHTML = "An error occured, photo isn't updated";
            username.before(notOkMsg);
            setTimeout(() => notOkMsg.remove(), 2200);
          }
        };

        cancelBtn.remove();
        submitBtn.remove();
      });
    });
  }

  async render(id) {
    if (!me.auth) return;
    const pageContainer = createElement("div", ["page-container"]);
    const pageContent = createElement("div", ["page-content"]);
    const profile = createElement("div", ["signup"]);

    pageContainer.append(pageContent);
    pageContent.append(profile);
    this.renderEdit(profile);
    this.renderProfile(profile);

    document.querySelector(id).innerHTML = "";
    document.querySelector(id).append(pageContainer);
  }
}
