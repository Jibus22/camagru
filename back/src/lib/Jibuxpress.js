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
      OPTION: {},
      TRACE: {},
      CONNECT: {},
    };
  }

  use(route, ...callback) {
    return this.router.use(route, ...callback);
  }

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

  option(route, ...callback) {
    return this.router.option(route, ...callback);
  }

  _processIncomingHttpMessage(req, res) {
    const fn = this.routeHandler[req.method][req.url];

    if (fn == undefined) {
      console.log("App fn undefined");
      res
        .writeHead(501, { "Content-Type": "application/json" })
        .end(JSON.stringify({ message: "not implemented" }));
      return;
    }
    try {
      fn(req, res);
    } catch (err) {
      console.log("App err catch:\n" + err);
      res
        .writeHead(501, { "Content-Type": "application/json" })
        .end(JSON.stringify({ message: "not implemented" }));
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
