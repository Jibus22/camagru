import { createElement } from "../utils.js";
import AbstractView from "./AbstractView.js";

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

    const coucou = createElement("div");
    coucou.innerHTML = `
      <div class="edit-main">
        <div class="superposable">
          <!-- This part must be automatically generated -->
          <div class="superposable__img-ctnr">
            <img src="" />
          </div>
          <div class="superposable__img-ctnr">
            <img src="" />
          </div>
          <div class="superposable__img-ctnr">
            <img src="" />
          </div>
        </div>
        <div class="camera">
          <div class="camera__preview">
            <!-- We should have some html which permits to preview the webcam here -->
          </div>
          <div class="camera__options">
            <!-- button to capture image -->
            <button><span class="icon-circle-o"></span></button>
            <!-- button to upload an image in case webcam is not used -->
            <button><span class="icon-file_upload"></span></button>
          </div>
        </div>
      </div>
      
      <div class="edit-side">
        <div class="thumbnail-ctnr">
          <div class="thumbnail-ctnr__underlayer">
            <!-- remove button, must be positioned at top right. Visible on hover -->
            <button><span class="icon-remove"></span></button>
            <!-- publish/share button, must be positioned at bottom right. Visible on hover -->
            <button><span class="icon-share"></span></button>
            <img src="" />
          </div>
        </div>
      </div>
    `;
    divs[divs.length - 1].append(coucou);
  }
}
