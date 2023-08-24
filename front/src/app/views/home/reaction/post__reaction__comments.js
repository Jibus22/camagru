import { basename, createElement } from "../../../utils";
import { data_comments, data_post, data_user } from "../../data/home";

export const post__reaction__comments = (reaction, post) => {
  const reaction__comments = createElement("div", [
    "post__reaction__comments",
    "div_hide",
  ]);
  reaction__comments.innerHTML = `
          <div class="post__reaction__comments__all">
          </div>
          <div class="post__reaction__comments__write">
            <div class="post__reaction__comments__write__pp">
              <img src=${basename("/images/pp/monica.jpg")}/>
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

  const com_btn = reaction.querySelector(".post__reaction__open-comments");

  com_btn.addEventListener("click", () => {
    const div_com = reaction.querySelector(".post__reaction__comments");
    const comments_all = reaction.querySelector(
      ".post__reaction__comments__all"
    );

    // Do this rendering only on the first click
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
                    <img src=${basename(data_user[parseInt(item.user_id)].pp)}/>
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
