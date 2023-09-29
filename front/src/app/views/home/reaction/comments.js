import { submitForm } from "../../../utils/submitForm.js";
import { me, createElement, postHttpRequest } from "../../../utils/utils.js";

const setCommentForm = (reaction, commentSection, id, allComments) => {
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

  const submitBtn = commentForm.querySelector("button");
  submitBtn.disabled = true;

  const input = commentForm.querySelector("input");
  input.addEventListener("keyup", () => {
    if (input.value.length) {
      submitBtn.disabled = false;
    } else {
      submitBtn.disabled = true;
    }
  });

  const form = commentForm.querySelector(
    ".post__reaction__comments__write__form"
  );

  const commentCnt = reaction
    .querySelector(".post__reaction__count__comments")
    .querySelector("p")
    .querySelector("span");

  form.addEventListener("submit", (e) => {
    submitForm(
      e,
      form,
      "http://localhost:4000/comment",
      (res, btn) => {
        if (res.sent == true) {
          displayComments(id, allComments);
          form.reset();
          commentCnt.innerText = parseInt(commentCnt.innerText) + 1;
          return;
        } else {
          if (btn) btn.trigger();
        }
      },
      id
    );
  });
};

const displayComments = async (id, allComments) => {
  let coms;
  try {
    coms = await postHttpRequest(
      "http://localhost:4000/gallery/postreactions/getcomments",
      { "Content-Type": "application/json" },
      { id }
    );
  } catch (err) {
    return;
  }

  if (!coms || !coms.length) {
    coms = [];
    return;
  }

  allComments.innerHTML = "";

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
  commentBtn.addEventListener("click", async () => {
    commentSection.classList.toggle("div_hide");

    if (!allComments.children.length) {
      displayComments(id, allComments);
    }
  });

  setCommentForm(reaction, commentSection, id, allComments);
};
