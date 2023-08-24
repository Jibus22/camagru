import { basename, createElement } from "../../utils";

export const post__image = (item, post) => {
  const image = createElement("div", ["post__image"]);
  image.innerHTML = `<img src=${basename(item.img)} />`;
  const img = image.querySelector("img");
  img.addEventListener("click", () => {
    image.classList.toggle("enlarge_img");
    post.classList.toggle("hide_this");
  });

  return image;
};
