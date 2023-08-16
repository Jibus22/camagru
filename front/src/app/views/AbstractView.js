export default class {
  constructor(params) {
    this.params = params;
  }

  setTitle(title) {
    document.title = `${title} • camagru`;
  }

  createElement(elem, arr = []) {
    const newElem = document.createElement(elem);
    for (let className of arr) newElem.classList.add(className);
    return newElem;
  }

  async render(id) {}
}
