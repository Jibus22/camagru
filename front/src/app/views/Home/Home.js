import { createElement } from "../../utils.js";
import AbstractView from "../AbstractView.js";
import { data_post } from "../data/home.js";
import { post__author } from "./post__author.js";
import { post__image } from "./post__image.js";
import { post__reaction } from "./reaction/post__reaction.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Home");
    this.index = 0;
    this.pages = [];
  }

  // paginate(data) {
  //   const items_per_page = 5;
  //   const number_of_pages = Math.ceil(data.length / items_per_page);

  //   const new_data = Array.from({ length: number_of_pages }, (_, index) => {
  //     const start = index * items_per_page;
  //     return data.slice(start, start + items_per_page);
  //   });
  //   return new_data;
  // }

  // display_pagination() {
  //   let page_btn =
  //     this.index == 0
  //       ? ""
  //       : '<button class="pagination__prev"><span class="icon-navigate_before"></span></button>';
  //   page_btn += this.pages
  //     .map((_, idx) => {
  //       return `
  //       <button class="pagination-btn ${
  //         this.index == idx ? "active-btn" : "null"
  //       }" data-index=${idx}>${idx + 1}</button>
  //     `;
  //     })
  //     .join("");

  //   page_btn +=
  //     this.index == this.pages.length - 1
  //       ? ""
  //       : '<button class="pagination__next"><span class="icon-navigate_next"></span></button>';

  //   return '<div class="pagination">' + page_btn + "</div>";
  // }

  async render(id) {
    // this.pages = this.paginate(data_post);
    // const posts = data_post //this.pages[this.index].map (...)

    let divs = [];
    for (let item of ["page-container", "page-content", "home"]) {
      divs.push(createElement("div", [item]));
    }

    for (let i = 0; i < divs.length; i++) {
      if (i + 1 < divs.length) divs[i].append(divs[i + 1]);
    }

    for (let item of data_post) {
      const post = createElement("div", ["post"]);
      post.dataset.postId = item.id;
      post.append(post__author(item));
      post.append(post__image(item, post));
      post.append(post__reaction(item, post));
      divs[divs.length - 1].append(post);
    }

    document.querySelector(id).innerHTML = "";
    document.querySelector(id).append(divs[0]);
  }
}
