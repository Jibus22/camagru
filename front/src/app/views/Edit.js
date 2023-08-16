import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Edit");
  }

  async render(id) {
    const view = `
      <div class="page-container">
        <div class="page-content">
          <div class="edit">
            <p>COUCOU EDIT</p>
          </div>
        </div>
      </div>
  `;
    document.querySelector(id).innerHTML = view;
  }
}
