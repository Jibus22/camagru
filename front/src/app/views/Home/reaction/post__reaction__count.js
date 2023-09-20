import { createElement, postHttpRequest } from "../../../utils/utils";

export const reactionCount = () => {
  const reaction__count = createElement("div", ["post__reaction__count"]);

  reaction__count.innerHTML = `
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

  return reaction__count;
};

export const reactionCountData = async (reactionCount, id) => {
  const reactions = await postHttpRequest(
    "http://localhost:4000/gallery/postreactions",
    { "Content-Type": "application/json" },
    { id }
  );

  console.log(reactions);

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

  likeBtn.addEventListener("click", async () => {
    // TODO: Ajouter une requete pour envoyer un +1/-1 sur le post en question
    //       Et qui renvoie {clicked / like_cnt} ? Comme ça on n'appelle pas
    //       l'autre requete

    const reactions = await postHttpRequest(
      "http://localhost:4000/gallery/postreactions",
      { "Content-Type": "application/json" },
      { id }
    );

    likes.innerHTML = reactions.like_cnt;
    if (reactions.liked) {
      likeBtn.classList.add("like_color");
    } else {
      likeBtn.classList.remove("like_color");
    }
  });
};
