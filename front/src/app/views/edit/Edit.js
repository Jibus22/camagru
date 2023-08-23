import AbstractView from "../AbstractView.js";
import { createElement } from "../../utils.js";
import { camera } from "./camera";
import { superposable } from "./superposable";

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
    const edit = divs[divs.length - 1];

    document.querySelector(id).innerHTML = "";
    document.querySelector(id).append(divs[0]);

    const edit__side = createElement("div", ["edit__side"]);
    edit.append(edit__side);

    const edit__main = createElement("div", ["edit__main"]);
    edit__main.append(camera(edit));
    edit__main.prepend(superposable(edit__main));

    edit.prepend(edit__main);
  }
}
