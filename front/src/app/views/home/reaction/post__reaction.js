import { createElement } from "../../../utils";
import { post__reaction__comments } from "./post__reaction__comments";
import { post__reaction__count } from "./post__reaction__count";

export const post__reaction = (item, post) => {
  const reaction = createElement("div", ["post__reaction"]);

  reaction.append(post__reaction__count(item));
  reaction.append(post__reaction__comments(reaction, post));

  return reaction;
};
