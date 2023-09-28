import AbstractView from "../AbstractView.js";
import { createElement } from "../../utils/utils.js";
import { camera } from "./camera";
import { superposable } from "./superposable";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Edit");
  }

  async render(id) {
    const pageContainer = createElement("div", ["page-container__edit"]);
    const pageContent = createElement("div", ["page-content"]);
    const edit = createElement("div", ["edit"]);

    pageContainer.append(pageContent);
    pageContent.append(edit);

    document.querySelector(id).innerHTML = "";
    document.querySelector(id).append(pageContainer);

    const edit__side = createElement("div", ["edit__side"]);
    edit.append(edit__side);

    const edit__main = createElement("div", ["edit__main"]);
    edit__main.append(camera(edit));
    edit__main.prepend(superposable(edit__main));

    edit.prepend(edit__main);
  }
}
