export class HttpRouter {
  constructor() {
    this.routes = {
      HEAD: {
        middlewares: [],
        routes: {
          // "/": {
          //   middlewares: [mw1, mw2, mw3...],
          //   handlers: [mw1, mw2, mw3... handler],
          // },
          // "/path": {
          //   middlewares: [mw1, mw2, mw3...],
          //   handlers: [mw1, mw2, mw3... handler],
          // },
        },
      },
      GET: {
        middlewares: [],
        routes: {},
      },
      POST: {
        middlewares: [],
        routes: {},
      },
      PUT: {
        middlewares: [],
        routes: {},
      },
      DELETE: {
        middlewares: [],
        routes: {},
      },
      PATCH: {
        middlewares: [],
        routes: {},
      },
      OPTION: {
        middlewares: [],
        routes: {},
      },
      TRACE: {
        middlewares: [],
        routes: {},
      },
      CONNECT: {
        middlewares: [],
        routes: {},
      },
    };
    this.middlewares = [];
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

  _middlewareRecord(method, route, ...callbacks) {
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
      if (method.routes[url] == undefined)
        method.routes[url] = {
          middlewares: [],
          handlers: [],
        };
      method.routes[url].handlers = [
        ...method.routes[url].handlers,
        ...middlewares,
      ];
    } else if (typeof method == "string" && method === "use") {
      if (typeof route == "string") {
        // Record middlewares in every methods and a specific route
        for (const _method of Object.values(this.routes)) {
          if (_method.routes[url] == undefined)
            _method.routes[url] = {
              middlewares: [],
              handlers: [],
            };
          _method.routes[url].middlewares = [
            ..._method.routes[url].middlewares,
            ...middlewares,
          ];
        }
      } else {
        // Record middlewares in every methods and routes
        this.middlewares = [...this.middlewares, ...middlewares];
      }
    }
    return this;
  }

  use(route, ...callback) {
    return this._middlewareRecord("use", route, ...callback);
  }

  route(url) {
    this.url = url;
    return this;
  }

  all(route, callback) {}

  head(route, ...callback) {
    return this._middlewareRecord(this.routes.HEAD, route, ...callback);
  }

  get(route, ...callback) {
    return this._middlewareRecord(this.routes.GET, route, ...callback);
  }

  post(route, ...callback) {
    return this._middlewareRecord(this.routes.POST, route, ...callback);
  }

  put(route, ...callback) {
    return this._middlewareRecord(this.routes.PUT, route, ...callback);
  }

  delete(route, ...callback) {
    return this._middlewareRecord(this.routes.DELETE, route, ...callback);
  }

  patch(route, ...callback) {
    return this._middlewareRecord(this.routes.PATCH, route, ...callback);
  }

  option(route, ...callback) {
    return this._middlewareRecord(this.routes.OPTION, route, ...callback);
  }

  // Create a middleware stack for each route then merge them to create a unique
  // function per route, then delete this.routes now useless.
  start(routeHandler) {
    if (!this.routes) return null;
    for (let [routeMethod, routeObj] of Object.entries(this.routes)) {
      for (let [routeUrl, routeHandlers] of Object.entries(routeObj.routes)) {
        const middlewareStack = [
          ...this.middlewares,
          ...routeObj.middlewares,
          ...routeHandlers.middlewares,
          ...routeHandlers.handlers,
        ];
        routeHandler[routeMethod][routeUrl] =
          this._mergeMiddlewares(middlewareStack)[0];
      }
    }
    this.routes = null;
    return this;
  }
}
