import { createElement } from "../../utils.js";
import AbstractView from "../AbstractView.js";
import { edit__main } from "./edit__main.js";
import { edit__side } from "./edit__side.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Edit");
  }

  async render(id) {
    let divs = [];
    for (let item of ["page-container__edit", "page-content", "edit"]) {
      divs.push(createElement("div", [item]));
    }
    for (let i = 0; i < divs.length; i++) {
      if (i + 1 < divs.length) divs[i].append(divs[i + 1]);
    }

    document.querySelector(id).innerHTML = "";
    document.querySelector(id).append(divs[0]);

    divs[divs.length - 1].append(edit__side());
    divs[divs.length - 1].prepend(edit__main());
  }
}
