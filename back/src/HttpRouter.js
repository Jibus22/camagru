export class HttpRouter {
  constructor() {
    this.middlewares = [];
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

  _mergeMiddlewares(middlewares, callbackArray) {
    if (!middlewares.length || !callbackArray.length) return;

    const currentCb = middlewares.pop();
    const nextCb = callbackArray[0];
    const middlewareCb = (req, res) => {
      const next = () => nextCb(req, res);
      currentCb(req, res, next);
    };
    middlewares.push(middlewareCb);
  }

  // record a new key-value ["route" - [cb]] according to the given method.
  _routeRecord(method, route, ...callbacks) {
    if (typeof route == "function") {
      callbacks = [route, ...callbacks];
      route = this.url;
    }

    const callbackArray = [];

    for (let i = callbacks.length - 1; i >= 0; i--) {
      const currentCb = callbacks[i];
      if (i + 1 == callbacks.length) {
        callbackArray.unshift(currentCb);
      } else {
        // if many callback are given, that means they are middleware with the
        // 3 parameters signature ending with 'next'. So we wrap them up to
        // make them call each other in order
        const nextCb = callbackArray[0];
        const middlewareCb = (req, res) => {
          const next = () => nextCb(req, res);
          currentCb(req, res, next);
        };
        callbackArray.unshift(middlewareCb);
      }
    }

    console.log(typeof method);
    if (typeof method == "object") {
      // record standard methods with route.
      method[route] = callbackArray;
    } else if (typeof method == "string" && method === "use") {
      // record middlewares with or without route.
      if (typeof route == "string") {
        // Pour toutes les méthodes, trouver ou rajouter la route en question.
        // Si la route existe il faut merge les middleware avec les route handler
        // Sinon on la crée. Mais ce qui veut dire que si on rajoute une route
        // handler après il faut merge l'array et merge les cb.
      } else {
        // On rajoute ces middleware à toutes les méthodes et à toutes les routes.
        // == On merge les arrays + merge les cb.
        // DO WE REALLY NEED ARRAYS ? COULD WE INSTEAD JUST MERGE CB ?
        this._mergeMiddlewares(this.middlewares, callbackArray);
        this.middlewares = [...this.middlewares, ...callbackArray];
        console.log("MIDDLEWARES:");
        console.log(this.middlewares);
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
    fn[0](req, res);
  }
}
