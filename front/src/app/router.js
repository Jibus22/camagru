import Edit from "./views/edit/Edit";
import Home from "./views/home/Home";
import PasswordReset from "./views/PasswordReset";
import Signin from "./views/Signin";
import Signup from "./views/Signup";

// To deploy static front version on page, as a demo.
const PROJECT_TITLE = "camagru";
// If vite is ran in dev mode, don't add basename else add it to url router.
const basename = (url) =>
  `${import.meta.env.DEV ? url : `/${PROJECT_TITLE}${url}`}`;

const pathToRegex = (path) =>
  new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = (match) => {
  const values = match.result.slice(1);

  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(
    (result) => result[1]
  );

  return Object.fromEntries(
    keys.map((key, i) => {
      return [key, values[i]];
    })
  );
};

export const navigateTo = (url) => {
  if (url !== location.pathname) {
    // When navigating from Edit view to another one, disable webcam stream.
    if (window.localStream) {
      window.localStream.getVideoTracks().forEach((track) => track.stop());
      delete window.localStream;
    }
    history.pushState(null, null, url);
    router();
  }
};

export const router = async () => {
  const routes = [
    { path: basename("/"), view: Home },
    { path: basename("/signin"), view: Signin },
    { path: basename("/signup"), view: Signup },
    { path: basename("/password_reset"), view: PasswordReset },
    { path: basename("/edit"), view: Edit },
  ];

  console.table(routes);

  // Test each route for a potential match.
  const potentialMatches = routes.map((route) => {
    return {
      route: route,
      result: location.pathname.match(pathToRegex(route.path)),
    };
  });

  let match = potentialMatches.find(
    (potentialMatch) => potentialMatch.result !== null
  );

  if (!match) {
    match = {
      route: routes[0],
      result: [location.pathname],
    };
  }

  const view = new match.route.view(getParams(match));

  await view.render("#content");
};
