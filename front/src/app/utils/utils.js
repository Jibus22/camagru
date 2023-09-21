export var me = {};

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

export const postHttpRequest = async (fetchLink, headers, body) => {
  if (!fetchLink || !headers || !body) {
    throw new Error("One or more POST request parameters was not passed.");
  }
  try {
    const rawResponse = await fetch(fetchLink, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
      credentials: "include",
    });
    const content = await rawResponse.json();
    return content;
  } catch (err) {
    console.error(`Error at fetch POST: ${err}`);
    throw err;
  }
};

// Wrap setTimeout to be able to return an object with a trigger handler which
// cancel the timeout but still triggers its handler.
export const newTimeout = (handler, delay) => {
  const id = setTimeout(handler, delay),
    clear = clearTimeout.bind(null, id);
  return { id, clear, trigger: () => (clear(), handler()) };
};
