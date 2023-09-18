import { createElement, newTimeout, postHttpRequest } from "./utils.js";

const buildJsonFormData = (form) => {
  const jsonFormData = {};
  const formData = new FormData(form);
  for (const pair of formData) jsonFormData[pair[0]] = pair[1];
  return jsonFormData;
};

export const displayAuthResponse = (form, message, classname) => {
  const msg = createElement("div", [`sign__form__${classname}`]);
  const invalid = form.querySelector(`.sign__form__invalid-msg`);
  const valid = form.querySelector(`.sign__form__valid-msg`);

  if (invalid) invalid.remove();
  if (valid) valid.remove();

  msg.innerText = message;
  form.append(msg);
};

export const submitForm = async (e, form, url, cb) => {
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

  const jsonFormData = buildJsonFormData(form);

  try {
    const response = await postHttpRequest(
      url,
      { "Content-Type": "application/json" },
      jsonFormData
    );

    cb(response, btnTimeout);
  } catch (err) {
    console.error("form error: " + err);
    // display something to say it din't worked, try again.
  }
};
