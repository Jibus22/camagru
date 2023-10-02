import { navigateTo } from "./router";
import { me, createElement } from "./utils/utils";

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

const leftNavBar = () => {
  const elem = createElement("div");
  const home = addNavButton(
    "a",
    ["header__nav", "homelogo"],
    "/",
    `<img src="/favicon.svg" alt="home logo" />`
  );
  elem.append(home);

  if (!me.auth) return elem;

  const edit = addNavButton("a", ["navtxt", "header__nav"], "/edit", `Edit`);
  elem.append(edit);

  const creations = addNavButton(
    "a",
    ["navtxt", "header__nav"],
    "/creations",
    `Creations`
  );
  elem.append(creations);

  return elem;
};

const rightNavBar = () => {
  const elem = createElement("div");
  const themeToggleBtn = createElement("button", ["theme_toggle"]);
  themeToggleBtn.innerHTML = `<i class="icon-theme"></i>`;

  themeEvent(themeToggleBtn);
  elem.append(themeToggleBtn);

  if (!me.auth) {
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
      `<img src=${me.avatar} />`
    );
    elem.prepend(profile);

    const logout = createElement("a", ["navtxt", "header__nav"]);
    logout.href = "/logout";
    logout.innerHTML = `Log&nbsp;out`;
    logout.addEventListener("click", async (e) => {
      e.preventDefault();
      let response;

      try {
        response = await fetch("http://localhost:4000/logout", {
          credentials: "include",
        });
      } catch (err) {
        if (import.meta.env.DEV) console.error(`Error at logout: ${err}`);
        return;
      }

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

  navbar.append(leftNavBar());
  navbar.append(rightNavBar());

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
