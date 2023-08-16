import { createElement } from "../../utils";
import { data_user } from "../data/home";

export const post__author = (item) => {
  const author = createElement("div", ["post__author"]);
  author.innerHTML = `
    <div class="post__author__id">
      <div>
        <img src=${data_user[parseInt(item.user_id)].pp} />
      </div>
      <p>${data_user[parseInt(item.user_id)].name}</p>
    </div>
    <p>${item.date}</p>
    `;
  return author;
};
