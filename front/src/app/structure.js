import { navigateTo } from "./router";

const themeEvent = () => {
  const currentTheme = localStorage.getItem("theme");
  const themeToggleBtn = document.querySelector(".theme-toggle");
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

const addNavbarEvents = () => {
  const navigate = document.querySelectorAll(".header__nav");

  navigate.forEach((navlink) => {
    navlink.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(navlink.pathname);
    });
  });

  themeEvent();
};

export const displayNavbar = (id) => {
  const navbar = `
    <div class="header">
      <nav class="navbar">
        <div>
          <a class="header__nav homelogo" href="/">
            <img src="/favicon.svg" alt="home logo" />
          </a>
          <a class="navtxt header__nav" href="/edit">Edit</a>
        </div>
        <div>
          <a class="navtxt header__nav" href="/signin">Sign&nbsp;in</a>
          <button class="theme-toggle">
            <i class="icon-theme"></i>
          </button>
          <div class="div_hide user_id">
            <img src="/images/pp/robert.jpg"/>
          </div>
        </div>
      </nav>
    </div>
  `;

  document.querySelector(id).innerHTML = navbar;

  addNavbarEvents();
};

export const displayFooter = (id) => {
  const date = new Date().getFullYear();
  const footer = `
    <footer class="footer">
      <p><span>&#169;</span> ${date} Jean-Baptiste Le Corre</p>
    </footer>
  `;

  document.querySelector(id).innerHTML = footer;
};
