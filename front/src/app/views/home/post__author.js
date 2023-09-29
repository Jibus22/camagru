import { createElement } from "../../utils/utils.js";

export const post__author = ({ avatar, username, created_date }) => {
  const author = createElement("div", ["post__author"]);
  avatar = new Uint8Array(avatar.data);
  const blob = new Blob([avatar], { type: "image/png" });
  const date = new Date(created_date);

  author.innerHTML = `
    <div class="post__author__id">
      <div>
        <img src=${URL.createObjectURL(blob)} />
      </div>
      <p>${username}</p>
    </div>
    <p>${date.toDateString()}</p>
    `;
  return author;
};
