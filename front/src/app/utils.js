// To deploy static front version on page, as a demo.
const PROJECT_TITLE = "camagru";
// If vite is ran in dev mode, don't add basename else add it to url router.
export const basename = (url) =>
  `${import.meta.env.DEV ? url : `/${PROJECT_TITLE}${url}`}`;

export const createElement = (elem, arr = []) => {
  const newElem = document.createElement(elem);
  for (let className of arr) newElem.classList.add(className);
  return newElem;
};

// Returns new dimension of userImg so it can fit in containerImg (like
// object-fit: contain would do in css), and returns the offsets to position it
export const imageFit = (userImg, containerImg) => {
  let w = userImg.w;
  let h = userImg.h;
  let topOffset = 0;
  let leftOffset = 0;
  const imgRatio = w / h;
  const ctnrRatio = containerImg.w / containerImg.h;

  if (imgRatio >= ctnrRatio) {
    w = containerImg.w;
    h = (containerImg.w / userImg.w) * userImg.h;
    topOffset = (containerImg.h - h) / 2;
  } else {
    h = containerImg.h;
    w = (containerImg.h / userImg.h) * userImg.w;
    leftOffset = (containerImg.w - w) / 2;
  }

  return { w: w, h: h, lOff: leftOffset, tOff: topOffset };
};
