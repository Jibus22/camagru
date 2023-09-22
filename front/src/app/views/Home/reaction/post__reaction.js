import { createElement } from "../../../utils/utils.js";
import { setCommentSection } from "./comments.js";
import { setReactionSection } from "./post__reaction__count.js";

export const post__reaction = (id) => {
  const reaction = createElement("div", ["post__reaction"]);

  setReactionSection(reaction, id);
  setCommentSection(reaction, id);

  return reaction;
};
