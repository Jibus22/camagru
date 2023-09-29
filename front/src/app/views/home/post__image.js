import { createElement } from "../../utils/utils.js";

export const post__image = ({ photo }, post) => {
  photo = new Uint8Array(photo.data);
  photo = new Blob([photo], { type: "image/jpeg" });
  const image = createElement("div", ["post__image"]);

  image.innerHTML = `<img src=${URL.createObjectURL(photo)} />`;

  const img = image.querySelector("img");
  img.addEventListener("click", () => {
    image.classList.toggle("enlarge_img");
    post.classList.toggle("hide_this");
  });

  return image;
};
