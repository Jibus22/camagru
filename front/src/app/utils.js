export const createElement = (elem, arr = []) => {
  const newElem = document.createElement(elem);
  for (let className of arr) newElem.classList.add(className);
  return newElem;
};
