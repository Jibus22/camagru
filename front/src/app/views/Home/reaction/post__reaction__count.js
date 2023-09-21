import { createElement, postHttpRequest } from "../../../utils/utils";

const setReactionData = async (reactionCount, id) => {
  const reactions = await postHttpRequest(
    "http://localhost:4000/gallery/postreactions",
    { "Content-Type": "application/json" },
    { id }
  );

  const likes = reactionCount
    .querySelector(".post__reaction__count__likes")
    .querySelector("span");
  likes.innerHTML = reactions.like_cnt;

  const likeBtn = reactionCount.querySelector(
    ".post__reaction__count__likes-btn"
  );

  if (reactions.liked) likeBtn.classList.toggle("like_color");

  const comments = reactionCount
    .querySelector(".post__reaction__count__comments")
    .querySelector("span");
  comments.innerHTML = reactions.comment_cnt;

  let isLiked = reactions.liked;
  let likeCnt = parseInt(reactions.like_cnt);
  likeBtn.addEventListener("click", async () => {
    const response = await postHttpRequest(
      "http://localhost:4000/gallery/postreactions/like",
      { "Content-Type": "application/json" },
      { id, isLiked }
    );

    if (!response.ok) return;

    isLiked = !isLiked;
    likeCnt = isLiked ? likeCnt + 1 : likeCnt - 1;
    likes.innerHTML = likeCnt;
    if (isLiked) {
      likeBtn.classList.add("like_color");
    } else {
      likeBtn.classList.remove("like_color");
    }
  });
};

export const setReactionSection = (reaction, id) => {
  const reactionCount = createElement("div", ["post__reaction__count"]);

  reactionCount.innerHTML = `
          <div class="post__reaction__count__likes">
            <p><span></span></p>
            <button class="post__reaction__count__likes-btn">
              <span class="icon-thumbs-o-up"></span>
            </button>
          </div>
          <div class="post__reaction__count__comments">
            <p>
              <span></span> comments
            </p>
            <button class="post__reaction__open-comments">
              <span class="icon-chat_bubble_outline"></span>
            </button>
          </div>
        `;

  reaction.append(reactionCount);

  setReactionData(reactionCount, id);
};
