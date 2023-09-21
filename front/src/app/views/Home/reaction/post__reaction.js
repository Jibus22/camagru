import { createElement } from "../../../utils/utils.js";
import { setCommentSection } from "./comments.js";
import { reactionCount, reactionCountData } from "./post__reaction__count.js";

export const post__reaction = (id) => {
  const reaction = createElement("div", ["post__reaction"]);
  const reactCount = reactionCount();

  reaction.append(reactCount);
  setCommentSection(reaction, id);

  reactionCountData(reactCount, id);

  return reaction;
};
