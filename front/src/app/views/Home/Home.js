import { createElement, postHttpRequest } from "../../utils/utils.js";
import AbstractView from "../AbstractView.js";
import { post__author } from "./post__author.js";
import { post__image } from "./post__image.js";
import { post__reaction } from "./reaction/post__reaction.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Home");
    this.pageIndex = 0;
    this.itemPerPage = 5;
  }

  async displayPagination(pageContent, home) {
    const pagination = createElement("div", ["pagination"]);

    pageContent.append(pagination);

    const response = await fetch("http://localhost:4000/gallery/postnb", {
      credentials: "include",
    });

    if (!response.ok) return;

    const body = await response.json();

    const nbPage = parseInt(body.count) / this.itemPerPage;

    for (let i = 0; i < nbPage; i++) {
      const btn = createElement("button", [
        "pagination-btn",
        this.pageIndex == i ? "active-btn" : "null",
      ]);
      btn.dataset.index = i;
      btn.innerText = i + 1;

      btn.addEventListener("click", () => {
        const btnId = parseInt(btn.dataset.index);

        if (btnId == this.pageIndex) return;

        const activeBtn = pagination.querySelector(".active-btn");
        activeBtn.classList.remove("active-btn");
        btn.classList.add("active-btn");
        btn.classList.remove("null-btn"); //TODO cheker l'utilité de ça

        window.scrollTo({
          top: 0,
          left: 0,
        });

        this.pageIndex = btnId;
        this.displayHome(home);
      });

      pagination.append(btn);
    }
  }

  async displayHome(home) {
    home.innerHTML = "";

    const posts = await postHttpRequest(
      "http://localhost:4000/gallery",
      { "Content-Type": "application/json" },
      { page: this.pageIndex * this.itemPerPage + 1, limit: this.itemPerPage }
    );

    posts.forEach((item) => {
      const post = createElement("div", ["post"]);
      post.dataset.postId = item.id;
      post.append(post__author(item));
      post.append(post__image(item, post));
      post.append(post__reaction(item.id));

      home.append(post);
    });
  }

  async render(id) {
    const pageContainer = createElement("div", ["page-container"]);
    const pageContent = createElement("div", ["page-content"]);
    const home = createElement("div", ["home"]);

    pageContainer.append(pageContent);
    pageContent.append(home);

    document.querySelector(id).innerHTML = "";
    document.querySelector(id).append(pageContainer);

    const pagination = pageContent.querySelector(".pagination");

    // render pagination only once
    if (!pagination) this.displayPagination(pageContent, home);

    this.displayHome(home);
  }
}
