import AbstractView from "./AbstractView.js";
import { data_user, data_comments, data_post } from "./data/home.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Home");
    this.index = 0;
    this.pages = [];
  }

  async addEvents(id) {
    const posts = document.querySelector(id).querySelectorAll(".post");

    if (!posts) {
      return;
    }

    for (let post of posts) {
      // First, handle image enlarging by clicking
      const post_image = post.querySelector(".post__image");
      const image = post_image.querySelector("img");

      image.addEventListener("click", () => {
        post_image.classList.toggle("enlarge_img");
        post.classList.toggle("hide_this");
      });

      // Then, handle comment section toggling
      const com_btn = post.querySelector(".post__reaction__open-comments");

      com_btn.addEventListener("click", () => {
        const div_com = post.querySelector(".post__reaction__comments");
        const comments_all = post.querySelector(
          ".post__reaction__comments__all"
        );

        if (comments_all.childElementCount == 0) {
          const post_id = parseInt(post.dataset.postId);
          const com_id = data_post[post_id].com_id;
          let coms = "";

          if (com_id) {
            coms = data_comments[parseInt(com_id)].comments
              .map((item) => {
                return `
                <div class="post__reaction__comments__all__com">
                  <div class="post__reaction__comments__all__com__pp">
                    <img src=${data_user[parseInt(item.user_id)].pp}/>
                  </div>
                  <div class="post__reaction__comments__all__com__text">
                    <p class="post__reaction__comments__all__com__text-author">
                      ${data_user[parseInt(item.user_id)].name}
                    </p>
                    <p class="post__reaction__comments__all__com__text-comment">
                      ${item.comment}
                    </p>
                  </div>
                </div>
              `;
              })
              .join("");
          }

          comments_all.innerHTML = coms;
        }

        div_com.classList.toggle("div_hide");
      });

      // Finally, handle like button
      const likes_cnt = post
        .querySelector(".post__reaction__count__likes")
        .querySelector("p")
        .querySelector("span");
      const like_btn = post.querySelector(".post__reaction__count__likes-btn");
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
    }
  }

  paginate(data) {
    const items_per_page = 5;
    const number_of_pages = Math.ceil(data.length / items_per_page);

    const new_data = Array.from({ length: number_of_pages }, (_, index) => {
      const start = index * items_per_page;
      return data.slice(start, start + items_per_page);
    });
    return new_data;
  }

  display_reactions(item) {
    let com_count = 0;

    if (item.com_id) {
      com_count = data_comments[parseInt(item.com_id)].comments.length;
    }
    return `
      <div class="post__reaction">
        <div class="post__reaction__count">
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
        </div>
        <div class="post__reaction__comments div_hide">
          <div class="post__reaction__comments__all">
          </div>
          <div class="post__reaction__comments__write">
            <div class="post__reaction__comments__write__pp">
              <img src="/images/pp/monica.jpg"/>
            </div>
            <form class="post__reaction__comments__write__form" method="post" action="/comment_post">
              <input id="comment_field" type="text" name="comment" placeholder="Write a public comment..."/>
              <div>
                <div>
                </div>
                <button type="submit"><span class="icon-send-o"></span></button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  display_pagination() {
    let page_btn =
      this.index == 0
        ? ""
        : '<button class="pagination__prev"><span class="icon-navigate_before"></span></button>';
    page_btn += this.pages
      .map((_, idx) => {
        return `
        <button class="pagination-btn ${
          this.index == idx ? "active-btn" : "null"
        }" data-index=${idx}>${idx + 1}</button>
      `;
      })
      .join("");

    page_btn +=
      this.index == this.pages.length - 1
        ? ""
        : '<button class="pagination__next"><span class="icon-navigate_next"></span></button>';

    return '<div class="pagination">' + page_btn + "</div>";
  }

  async render(id) {
    this.pages = this.paginate(data_post);

    const posts = data_post //this.pages[this.index]
      .map((item) => {
        const reactions = this.display_reactions(item);
        return `
      <div class="post" data-post-id=${item.id}>
        <div class="post__author">
          <div class="post__author__id">
            <div>
              <img src=${data_user[parseInt(item.user_id)].pp} />
            </div>
            <p>${data_user[parseInt(item.user_id)].name}</p>
          </div>
          <p>${item.date}</p>
        </div>
        <div class="post__image">
          <img src=${item.img} />
        </div>
        ${reactions}
      </div>
      `;
      })
      .join("");

    const view = `
      <div class="page-container">
        <div class="page-content">
          <div class="home">
            ${posts}
            ${this.display_pagination()}
          </div>
        </div>
      </div>
  `;
    document.querySelector(id).innerHTML = view;

    this.addEvents(".home");
  }
}
