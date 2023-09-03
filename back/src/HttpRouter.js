export class HttpRouter {
  constructor() {
    this.routes = {
      HEAD: {},
      GET: {},
      POST: {},
      PUT: {},
      DELETE: {},
      PATCH: {},
      OPTION: {},
      TRACE: {},
      CONNECT: {},
    };
    this.url = "/";
  }

  // Wrap middlewares passed as parameters to router method so they call each
  // other with next()
  _mergeMiddlewares(middlewares) {
    const middlewareArray = [middlewares[middlewares.length - 1]];

    for (let i = middlewares.length - 2; i >= 0; i--) {
      const currentCb = middlewares[i];
      const nextCb = middlewareArray[0];
      const middlewareCb = (req, res) => {
        const next = () => nextCb(req, res);
        currentCb(req, res, next);
      };
      middlewareArray.unshift(middlewareCb);
    }

    return middlewareArray;
  }

  // record a new key-value ["route" - [cb]] according to the given method.
  _routeRecord(method, route, ...callbacks) {
    let middlewares;
    let url;
    if (typeof route == "function") {
      middlewares = [route, ...callbacks];
      url = this.url;
    } else {
      middlewares = callbacks;
      url = route;
    }

    if (typeof method == "object") {
      // Add middlewares after any existing one to a specific method and route.
      // if (method[url] != undefined) {
      //   console.log(method[url]);
      //   middlewares.unshift(method[url]);
      // }
      const middlewareArray = this._mergeMiddlewares(middlewares);
      method[url] = middlewareArray[0];
    } else if (typeof method == "string" && method === "use") {
      // record middlewares with or without route.
      if (typeof route == "string") {
        // Pour toutes les méthodes, trouver ou rajouter la route en question.
        // Si la route existe il faut merge les middleware avec les route handler
        // Sinon on la crée. Mais ce qui veut dire que si on rajoute une route
        // handler après il faut merge l'array et merge les cb.
      } else {
        // Add middlewares before any existing one in every methods and routes
        middlewares.push(this.routes.GET["/caca"]);
        const middlewareArray = this._mergeMiddlewares(middlewares);

        this.routes.GET["/caca"] = middlewareArray[0];
      }
    }
    return this;
  }

  use(route, ...callback) {
    return this._routeRecord("use", route, ...callback);
  }

  route(url) {
    this.url = url;
    return this;
  }

  all(route, callback) {}

  head(route, ...callback) {
    return this._routeRecord(this.routes.HEAD, route, ...callback);
  }

  get(route, ...callbacks) {
    return this._routeRecord(this.routes.GET, route, ...callbacks);
  }

  post(route, ...callback) {
    return this._routeRecord(this.routes.POST, route, ...callback);
  }

  put(route, ...callback) {
    return this._routeRecord(this.routes.PUT, route, ...callback);
  }

  delete(route, ...callback) {
    return this._routeRecord(this.routes.DELETE, route, ...callback);
  }

  patch(route, ...callback) {
    return this._routeRecord(this.routes.PATCH, route, ...callback);
  }

  option(route, ...callback) {
    return this._routeRecord(this.routes.OPTION, route, ...callback);
  }

  processIncomingHttpMessage(req, res) {
    const fn = this.routes[req.method][req.url];

    if (fn == undefined) return;
    fn(req, res);
  }
}
