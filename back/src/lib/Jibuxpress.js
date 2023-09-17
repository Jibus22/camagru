import http from "http";
import { HttpRouter } from "./HttpRouter.js";

http.ServerResponse.prototype.status = function (code) {
  this.statusCode = code;
  return this;
};

http.ServerResponse.prototype.redirect = function (code, path = "") {
  let url;
  if (typeof code === "number") {
    this.statusCode = code;
    url = path;
  } else {
    this.statusCode = 302;
    url = code;
  }
  this.setHeader("Location", url);
  this.end();
};

http.ServerResponse.prototype.json = function (item) {
  if (typeof item === "object") item = JSON.stringify(item);
  this.setHeader("Content-Type", "application/json");
  this.end(item);
};

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

  // Looks for a regex url match and extends the handler with params if match
  _regexSearch(method, reqUrl) {
    for (let [url, fn] of Object.entries(method)) {
      // Dynamically build a regex adapted to the url - detects ':id' notation
      // '/path/:id' regex will be '/^\/path\/([^/]+)\/?$/'
      const regex = new RegExp(
        "^" + url.replace(/\//g, "\\/").replace(/:\w+/g, "([^/]+)") + "/?$"
      );
      const res = reqUrl.match(regex);

      if (!res) continue;

      const values = res.slice(1); // keep only matchs from capture groups

      // Create an array of keys. '/path/:id/:token' => keys are 'id' & 'token'
      let keys = url.matchAll(/:(\w+)/g);
      keys = Array.from(keys);
      keys = keys.map((item) => item[1]);

      // Create an array of entries, ex: [[ 'id', 'val' ], [ 'token', 'val2' ]]
      const entries = keys.map((k, i) => {
        return [k, values[i]];
      });

      // Create an object with key-value pairs from entries
      const params = Object.fromEntries(entries);

      // Wrap the main handler to extend its request object with params
      const newFunc = (req, res) => {
        req.params = params;
        fn(req, res);
      };

      return newFunc;
    }
    return null;
  }

  _processIncomingHttpMessage(req, res) {
    const method = this.routeHandler[req.method];

    if (method == undefined)
      return this._notImplementedError(
        res,
        `App fn for ${req.method} undefined`
      );

    let fn = method[req.url];
    if (fn == undefined) {
      fn = this._regexSearch(method, req.url);

      if (!fn)
        return this._notImplementedError(
          res,
          `App fn for ${req.method} ${req.url} undefined`
        );
    }

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
