import { navigateTo } from "./router";

const addNavbarEvents = () => {
  const navigate = document.querySelectorAll(".header__nav");

  navigate.forEach((navlink) => {
    navlink.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(navlink.pathname);
    });
  });
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
          <button>
            <i class="icon-light-up"></i>
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
