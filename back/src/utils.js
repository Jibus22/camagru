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

export const httpPost = async (opts, data = {}) => {
  data = JSON.stringify(data);
  opts = {
    port: 4000,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
    ...opts,
  };

  const req = http.request(opts);

  req.write(data);
  req.end();

  const response = await getResponse(req);
  return response;
};
