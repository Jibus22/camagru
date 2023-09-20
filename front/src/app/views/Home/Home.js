import { createElement, postHttpRequest } from "../../utils/utils.js";
import AbstractView from "../AbstractView.js";
import { data_post } from "../data/home.js";
import { post__author } from "./post__author.js";
import { post__image } from "./post__image.js";
import { post__reaction } from "./reaction/post__reaction.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Home");
    this.pageIndex = 0;
    this.itemPerPage = 5;
    this.pageNb = 1;
  }

  displayPagination(home, pageContent) {
    const pagination = createElement("div", ["pagination"]);

    for (let i = 0; i < data_post.length / this.itemPerPage; i++) {
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
        btn.classList.remove("null-btn");

        window.scrollTo({
          top: 0,
          left: 0,
        });
        this.pageIndex = btnId;
        this.displayHome(home, pageContent);
      });

      pagination.append(btn);
    }
    return pagination;
  }

  async displayHome(home) {
    home.innerHTML = "";

    const response = await postHttpRequest(
      "http://localhost:4000/gallery",
      { "Content-Type": "application/json" },
      { page: 1, limit: 5 }
    );

    response.forEach((item) => {
      console.log(item);
      const post = createElement("div", ["post"]);
      post.dataset.postId = item.id;
      post.append(post__author(item));
      post.append(post__image(item, post));
      post.append(post__reaction(item.id, post));

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
    if (!pagination)
      pageContent.append(this.displayPagination(home, pageContent));

    this.displayHome(home, pageContent);
  }
}
