import { submitForm } from "../../../utils/submitForm.js";
import { me, createElement, postHttpRequest } from "../../../utils/utils.js";

const setCommentForm = (commentSection, id) => {
  if (!me.auth) return;

  const commentForm = createElement("div", ["post__reaction__comments__write"]);
  commentForm.innerHTML = `
    <div class="post__reaction__comments__write__pp">
      <img src=${me.avatar} />
    </div>
    <form class="post__reaction__comments__write__form" action="">
      <input id="comment_field" type="text" name="comment" placeholder="Write a public comment..."/>
      <div>
        <div>
        </div>
        <button type="submit"><span class="icon-send-o"></span></button>
      </div>
    </form>
  `;
  commentSection.append(commentForm);

  // TODO Ajouter la logique pour envoyer un com via le form

  const form = commentForm.querySelector(
    ".post__reaction__comments__write__form"
  );

  form.addEventListener("submit", (e) => {
    submitForm(
      e,
      form,
      "http://localhost:4000/comment",
      (res, btn) => {
        if (res.sent == true) {
          // dispay un truc pour dire que ça a pas été envoyé
          return;
        } else {
          if (btn) btn.trigger();
          // dispay un truc pour dire que ça a pas été envoyé
        }
      },
      id
    );
  });
};

export const setCommentSection = (reaction, id) => {
  const commentSection = createElement("div", [
    "post__reaction__comments",
    "div_hide",
  ]);

  const allComments = createElement("div", ["post__reaction__comments__all"]);
  commentSection.append(allComments);
  reaction.append(commentSection);

  const commentBtn = reaction.querySelector(".post__reaction__open-comments");
  let coms;
  commentBtn.addEventListener("click", async () => {
    commentSection.classList.toggle("div_hide");

    if (!coms) {
      coms = await postHttpRequest(
        "http://localhost:4000/gallery/postreactions/getcomments",
        { "Content-Type": "application/json" },
        { id }
      );

      if (!coms || !coms.length) {
        coms = [];
        return;
      }

      coms.forEach((item) => {
        const oneComment = createElement("div", [
          "post__reaction__comments__all__com",
        ]);

        const avatar = new Uint8Array(item.avatar.data);
        const blob = new Blob([avatar], { type: "image/jpeg" });

        oneComment.innerHTML = `
        <div class="post__reaction__comments__all__com__pp">
          <img src=${URL.createObjectURL(blob)} />
        </div>
        <div class="post__reaction__comments__all__com__text">
          <p class="post__reaction__comments__all__com__text-author">
            ${item.username}
          </p>
          <p class="post__reaction__comments__all__com__text-comment">
            ${item.body}
          </p>
        </div>
      `;

        allComments.append(oneComment);
      });
    }
  });

  setCommentForm(commentSection, id);
};
