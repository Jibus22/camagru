import { createElement } from "../../../utils/utils.js";
import { post__reaction__comments } from "./post__reaction__comments";
import { reactionCount, reactionCountData } from "./post__reaction__count.js";

const reactionComments = async () => {
  const reaction__comments = createElement("div", [
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

  return reactionComments;
};

const reactionCommentsData = async (reactionCount, id) => {};

export const post__reaction = (id, post) => {
  const reaction = createElement("div", ["post__reaction"]);
  const reactCount = reactionCount();
  const comments = reactionComments();

  reaction.append(reactCount);
  reaction.append(comments);
  // reaction.append(post__reaction__comments(reaction, post));

  reactionCountData(reactCount, id);
  reactionCommentsData(comments, id);

  return reaction;
};
