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

    method[route] = callbackArray;
    return this;
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
