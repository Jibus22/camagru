import { createElement } from "../../utils";

export const edit__side = () => {
  const edit__side = createElement("div", ["edit__side"]);

  edit__side.innerHTML = `
    <div class="thumbnail-ctnr">
      <div class="thumbnail-ctnr__underlayer">
        <!-- remove button, must be positioned at top right. Visible on hover -->
        <button class="remove-btn"><span class="icon-remove"></span></button>
        <!-- publish/share button, must be positioned at bottom right. Visible on hover -->
        <button class="share-btn"><span class="icon-share"></span></button>
        <img src="/images/img11.jpg" />
      </div>
    </div>

    <div class="thumbnail-ctnr">
      <div class="thumbnail-ctnr__underlayer">
        <!-- remove button, must be positioned at top right. Visible on hover -->
        <button class="remove-btn"><span class="icon-remove"></span></button>
        <!-- publish/share button, must be positioned at bottom right. Visible on hover -->
        <button class="share-btn"><span class="icon-share"></span></button>
        <img src="/images/img12.jpg" />
      </div>
    </div>

    <div class="thumbnail-ctnr">
      <div class="thumbnail-ctnr__underlayer">
        <!-- remove button, must be positioned at top right. Visible on hover -->
        <button class="remove-btn"><span class="icon-remove"></span></button>
        <!-- publish/share button, must be positioned at bottom right. Visible on hover -->
        <button class="share-btn"><span class="icon-share"></span></button>
        <img src="/images/img1.jpg" />
      </div>
    </div>

    <div class="thumbnail-ctnr">
      <div class="thumbnail-ctnr__underlayer">
        <!-- remove button, must be positioned at top right. Visible on hover -->
        <button class="remove-btn"><span class="icon-remove"></span></button>
        <!-- publish/share button, must be positioned at bottom right. Visible on hover -->
        <button class="share-btn"><span class="icon-share"></span></button>
        <img src="/images/img5.jpg" />
      </div>
    </div>
  `;
  return edit__side;
};
