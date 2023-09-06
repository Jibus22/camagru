import http from "http";
import { HttpRouter } from "./HttpRouter.js";

// Main api of my nodejs framework
export class Jibuxpress {
  constructor() {
    this.router = new HttpRouter();
    this.routeHandler = {
      HEAD: {},
      GET: {},
      POST: {},
      PUT: {},
      DELETE: {},
      PATCH: {},
      OPTIONS: {},
      TRACE: {},
      CONNECT: {},
    };
  }

  // Add callback middlewares at route level or app level if no route is given
  use(route, ...callback) {
    return this.router.use(route, ...callback);
  }

  // Utility to declare all method handlers chained to one route.
  route(url) {
    return this.router.route(url);
  }

  all(route, callback) {}

  head(route, ...callback) {
    return this.router.head(route, ...callback);
  }

  get(route, ...callback) {
    return this.router.get(route, ...callback);
  }

  post(route, ...callback) {
    return this.router.post(route, ...callback);
  }

  put(route, ...callback) {
    return this.router.put(route, ...callback);
  }

  delete(route, ...callback) {
    return this.router.delete(route, ...callback);
  }

  patch(route, ...callback) {
    return this.router.patch(route, ...callback);
  }

  options(route, ...callback) {
    return this.router.options(route, ...callback);
  }

  _notImplementedError(res, errMsg) {
    console.log(errMsg);
    res
      .writeHead(501, { "Content-Type": "application/json" })
      .end(JSON.stringify({ message: "not implemented" }));
    return;
  }

  _processIncomingHttpMessage(req, res) {
    const method = this.routeHandler[req.method];

    if (method == undefined)
      return this._notImplementedError(
        res,
        `App fn for ${req.method} undefined`
      );

    const fn = method[req.url];
    if (fn == undefined)
      return this._notImplementedError(
        res,
        `App fn for ${req.method} ${req.url} undefined`
      );

    try {
      fn(req, res);
    } catch (err) {
      this._notImplementedError(res, "App err catch:\n" + err);
    }
  }

  listen(port, cb) {
    const server = http.createServer(async (req, res) => {
      this._processIncomingHttpMessage(req, res);
    });

    this.router.start(this.routeHandler);
    server.listen(port, cb);
  }
}
