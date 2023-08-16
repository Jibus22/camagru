import AbstractView from "./AbstractView.js";
import { data_user, data_comments, data_post } from "./data/home.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Home");
    this.index = 0;
    this.pages = [];
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
    // this.pages = this.paginate(data_post);
    // const posts = data_post //this.pages[this.index].map (...)

    let divs = [];
    for (let item of ["page-container", "page-content", "home"]) {
      divs.push(this.createElement("div", [item]));
    }

    for (let i = 0; i < divs.length; i++) {
      if (i + 1 < divs.length) divs[i].append(divs[i + 1]);
    }

    const post__author = (item) => {
      const author = this.createElement("div", ["post__author"]);
      author.innerHTML = `
        <div class="post__author__id">
          <div>
            <img src=${data_user[parseInt(item.user_id)].pp} />
          </div>
          <p>${data_user[parseInt(item.user_id)].name}</p>
        </div>
        <p>${item.date}</p>
        `;
      return author;
    };

    const post__image = (item, post) => {
      const image = this.createElement("div", ["post__image"]);
      image.innerHTML = `<img src=${item.img} />`;
      const img = image.querySelector("img");
      img.addEventListener("click", () => {
        image.classList.toggle("enlarge_img");
        post.classList.toggle("hide_this");
      });

      return image;
    };

    const post__reaction = (item, post) => {
      const reaction = this.createElement("div", ["post__reaction"]);

      const post__reaction__count = () => {
        const reaction__count = this.createElement("div", [
          "post__reaction__count",
        ]);
        let com_count = 0;

        if (item.com_id)
          com_count = data_comments[parseInt(item.com_id)].comments.length;

        reaction__count.innerHTML = `
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
        `;

        const likes_cnt = reaction__count
          .querySelector(".post__reaction__count__likes")
          .querySelector("p")
          .querySelector("span");
        const like_btn = reaction__count.querySelector(
          ".post__reaction__count__likes-btn"
        );
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

        return reaction__count;
      };

      const post__reaction__comments = () => {
        const reaction__comments = this.createElement("div", [
          "post__reaction__comments",
          "div_hide",
        ]);
        reaction__comments.innerHTML = `
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
        `;

        const com_btn = reaction.querySelector(
          ".post__reaction__open-comments"
        );

        com_btn.addEventListener("click", () => {
          const div_com = reaction.querySelector(".post__reaction__comments");
          const comments_all = reaction.querySelector(
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

        return reaction__comments;
      };

      reaction.append(post__reaction__count());
      reaction.append(post__reaction__comments());

      return reaction;
    };

    for (let item of data_post) {
      const post = this.createElement("div", ["post"]);
      post.dataset.postId = item.id;
      post.append(post__author(item));
      post.append(post__image(item, post));
      post.append(post__reaction(item, post));
      divs[divs.length - 1].append(post);
    }

    document.querySelector(id).innerHTML = "";
    document.querySelector(id).append(divs[0]);
    // this.addEvents(".home");
  }
}
