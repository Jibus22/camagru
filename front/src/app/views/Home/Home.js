import { createElement } from "../../utils.js";
import AbstractView from "../AbstractView.js";
import { data_post } from "../data/home.js";
import { post__author } from "./post__author.js";
import { post__image } from "./post__image.js";
import { post__reaction } from "./reaction/post__reaction.js";

export class Home extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Home");
    this.pageIndex = 0;
    this.itemPerPage = 5;
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

  displayHome(home, pageContent) {
    home.innerHTML = "";
    for (
      let i = this.pageIndex * this.itemPerPage;
      i < this.pageIndex * this.itemPerPage + this.itemPerPage;
      i++
    ) {
      if (i == data_post.length) break;
      const item = data_post[i];
      const post = createElement("div", ["post"]);
      post.dataset.postId = item.id;
      post.append(post__author(item));
      post.append(post__image(item, post));
      post.append(post__reaction(item, post));
      home.append(post);
    }

    const pagination = pageContent.querySelector(".pagination");
    // render pagination only once
    if (!pagination)
      pageContent.append(this.displayPagination(home, pageContent));
  }

  async render(id) {
    let divs = [];
    for (let item of ["page-container", "page-content", "home"]) {
      divs.push(createElement("div", [item]));
    }
    for (let i = 0; i < divs.length; i++) {
      if (i + 1 < divs.length) divs[i].append(divs[i + 1]);
    }

    document.querySelector(id).innerHTML = "";
    document.querySelector(id).append(divs[0]);

    this.displayHome(divs[divs.length - 1], divs[1]);
  }
}
