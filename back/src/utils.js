import http from "http";

// Promisify the mean to receive the request body from http.IncomingMessage
export const getBody = (req) => {
  return new Promise((resolve, reject) => {
    try {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        resolve(body);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Promisify the mean to receive a response from
// http.ClientRequest (which extends http.OutgoingMessage)
export const getResponse = (req) => {
  return new Promise((resolve, reject) => {
    try {
      req.on("response", async (res) => {
        const body = await getBody(res);
        resolve(body);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Send HTTP POST request. config signature must be {url, data, options}
// ex:  const response = await httpPost({
//        url: "http://localhost/users",
//        data: { msg: "coucou depuis test" },
//        options: { port: 4000 },
//      });
export const httpPost = async (config) => {
  let contentType, contentLength;
  let { url, data, options, headers } = config;
  const myURL = new URL(url);

  if (typeof data == "object") {
    contentType = "application/json";
    data = JSON.stringify(data);
  } else {
    contentType = "application/x-www-form-urlencoded";
  }

  contentLength = data.length;

  const opts = {
    method: "POST",
    host: myURL.hostname,
    path: myURL.pathname,
    headers: {
      "Content-Type": contentType,
      "Content-Length": contentLength,
      ...headers,
    },
    ...options,
  };

  const req = http.request(opts);

  req.write(data);
  req.end();

  const response = await getResponse(req);
  return response;
};
