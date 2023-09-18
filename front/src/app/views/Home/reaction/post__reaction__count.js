import { createElement } from "../../../utils/utils.js";
import { data_comments } from "../../data/home";

export const post__reaction__count = (item) => {
  const reaction__count = createElement("div", ["post__reaction__count"]);
  let com_count = 0;

  if (item.com_id)
    com_count = data_comments[parseInt(item.com_id)].comments.length;

  reaction__count.innerHTML = `
          <div class="post__reaction__count__likes">
            <p><span>${item.likes}</span></p>
            <button class="post__reaction__count__likes-btn">
              <span class="icon-thumbs-o-up"></span>
            </button>
          </div>
          <div class="post__reaction__count__comments">
            <p>
              <span>${com_count}</span> comment${com_count > 1 ? "s" : ""}
            </p>
            <button class="post__reaction__open-comments">
              <span class="icon-chat_bubble_outline"></span>
            </button>
          </div>
        `;

  const likes_cnt = reaction__count
    .querySelector(".post__reaction__count__likes")
    .querySelector("p")
    .querySelector("span");
  const like_btn = reaction__count.querySelector(
    ".post__reaction__count__likes-btn"
  );
  like_btn.addEventListener("click", () => {
    // temporary solution before developing backend which will return if
    // the user already like this post or not.
    if (like_btn.classList.contains("like_color")) {
      likes_cnt.innerText = parseInt(likes_cnt.innerText) - 1;
    } else {
      likes_cnt.innerText = parseInt(likes_cnt.innerText) + 1;
    }
    like_btn.classList.toggle("like_color");
  });

  return reaction__count;
};
