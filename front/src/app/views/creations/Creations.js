import { createElement, me, postHttpRequest } from "../../utils/utils";
import AbstractView from "../AbstractView";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Creations");
  }

  async myCreationReactionsSet(myCreation, { id }) {
    let reactions;

    try {
      reactions = await postHttpRequest(
        "http://localhost:4000/gallery/postreactions",
        { "Content-Type": "application/json" },
        { id }
      );
    } catch (err) {
      return;
    }

    const like = myCreation.querySelector(".like");
    const comment = myCreation.querySelector(".comment");
    const likeNb = createElement("span");
    const commentNb = createElement("span");

    likeNb.innerHTML = reactions.like_cnt;
    commentNb.innerHTML = reactions.comment_cnt;

    like.prepend(likeNb);
    comment.prepend(commentNb);
  }

  async myCreationPhotoSet(myCreation, { id }) {
    let response;

    try {
      response = await fetch("http://localhost:4000/gallery/creations/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      if (import.meta.env.DEV) console.error(`Error at fetch: ${err}`);
      return;
    }

    if (!response.ok) return;

    const photo = await response.blob();
    const url = URL.createObjectURL(photo);

    const imgCreation = myCreation.querySelector(".creation-img");
    imgCreation.src = url;
  }

  async displayCreations(creations) {
    creations.innerHTML = "";

    let response;

    try {
      response = await fetch("http://localhost:4000/gallery/creations", {
        credentials: "include",
      });
    } catch (err) {
      if (import.meta.env.DEV) console.error(`Error at get creations: ${err}`);
      return;
    }

    const myCreations = await response.json();

    if (!myCreations.ok || !myCreations.creations) return;

    myCreations.creations.forEach((item) => {
      const myCreation = createElement("div", ["mycreation"]);
      myCreation.dataset.postId = item.id;

      const date = new Date(item.created_date);

      myCreation.innerHTML = `
        <div class="mycreation__header">
          <button class="remove-btn">
            <span class="icon-clear"></span>
          </button>
          <p>${date.toLocaleString()}</p>
        </div>
        <div class="mycreation__photo">
          <img class="creation-img" src="" />
        </div>
        <div class="mycreation__reactions">
          <p class="like">
            <span class="icon-thumbs-o-up"></span>
          </p>
          <p class="comment">
            <span class="icon-chat_bubble_outline"></span>
          </p>
        </div>
      `;

      this.myCreationReactionsSet(myCreation, item);
      this.myCreationPhotoSet(myCreation, item);

      const deleteBtn = myCreation.querySelector(".remove-btn");
      deleteBtn.addEventListener("click", async () => {
        let response;

        try {
          response = await fetch(
            "http://localhost:4000/gallery/creations/delete",
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ id: item.id }),
            }
          );
        } catch (err) {
          if (import.meta.env.DEV)
            console.error(`Error at delete creation: ${err}`);
          return;
        }

        if (!response.ok) return;
        myCreation.remove();
      });

      creations.append(myCreation);
    });
  }

  async render(id) {
    if (!me.auth) return;
    const pageContainer = createElement("div", ["page-container__edit"]);
    const pageContent = createElement("div", ["page-content"]);
    const creations = createElement("div", ["creations"]);

    pageContainer.append(pageContent);
    pageContent.append(creations);

    document.querySelector(id).innerHTML = "";
    document.querySelector(id).append(pageContainer);

    this.displayCreations(creations);
  }
}
