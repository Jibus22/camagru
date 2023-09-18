import { navigateTo } from "./router";
import { createElement } from "./utils/utils";

const themeEvent = (themeToggleBtn) => {
  const currentTheme = localStorage.getItem("theme");
  const iconTheme = themeToggleBtn.querySelector(".icon-theme");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const root = document.documentElement;

  if (currentTheme == "dark") {
    root.classList.add("dark-theme");
    iconTheme.classList.add("dark-theme");
  } else if (currentTheme == "light") {
    root.classList.add("light-theme");
    iconTheme.classList.add("light-theme");
  }

  themeToggleBtn.addEventListener("click", () => {
    let theme;

    if (prefersDarkScheme.matches) {
      theme = root.classList.toggle("light-theme") ? "light" : "dark";
      iconTheme.classList.toggle("light-theme");
    } else {
      theme = root.classList.toggle("dark-theme") ? "dark" : "light";
      iconTheme.classList.toggle("dark-theme");
    }
    localStorage.setItem("theme", theme);
  });
};

const addNavButton = (elem, classList, href, html) => {
  const item = createElement(elem, classList);
  item.href = href;
  item.innerHTML = html;
  item.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo(href);
  });

  return item;
};

const leftNavBar = (status) => {
  const elem = createElement("div");
  const home = addNavButton(
    "a",
    ["header__nav", "homelogo"],
    "/",
    `<img src="/favicon.svg" alt="home logo" />`
  );
  elem.append(home);

  if (status == 401) return elem;

  const edit = addNavButton("a", ["navtxt", "header__nav"], "/edit", `Edit`);
  elem.append(edit);

  return elem;
};

const rightNavBar = (status) => {
  const elem = createElement("div");
  const themeToggleBtn = createElement("button", ["theme_toggle"]);
  themeToggleBtn.innerHTML = `<i class="icon-theme"></i>`;

  themeEvent(themeToggleBtn);
  elem.append(themeToggleBtn);

  if (status == 401) {
    const signin = addNavButton(
      "a",
      ["navtxt", "header__nav"],
      "/signin",
      `Sign&nbsp;in`
    );
    elem.prepend(signin);
    return elem;
  } else {
    const profile = addNavButton(
      "a",
      ["user_id"],
      "/profile",
      `<img src="/images/pp/robert.jpg"/>`
    );
    elem.prepend(profile);

    const logout = createElement("a", ["navtxt", "header__nav"]);
    logout.href = "/logout";
    logout.innerHTML = `Log&nbsp;out`;
    logout.addEventListener("click", async (e) => {
      e.preventDefault();
      const response = await fetch("http://localhost:4000/logout", {
        credentials: "include",
      });

      if (response.status == 200) location.href = "/";
    });

    elem.prepend(logout);
  }

  return elem;
};

export const displayNavbar = async (id) => {
  const header = createElement("div", ["header"]);
  const navbar = createElement("nav", ["navbar"]);

  header.append(navbar);

  const response = await fetch("http://localhost:4000/me", {
    credentials: "include",
  });

  navbar.append(leftNavBar(response.status));
  navbar.append(rightNavBar(response.status));

  document.querySelector(id).innerHTML = "";
  document.querySelector(id).append(header);
};

export const displayFooter = (id) => {
  const date = new Date().getFullYear();
  const footer = `
    <footer class="footer">
      <p><span>&#169;</span> ${date} Camagru</p>
    </footer>
  `;

  document.querySelector(id).innerHTML = footer;
};
