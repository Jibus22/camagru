import http from "http";
import fs from "fs";

export const mailRegex = /^[-.\w]+@([\w-]+\.)+[\w-]+$/;
export const passwordRegex = /^([\w.,#!?$%^&*;:"'{}\/\\=`~()-]{7,60})$/;
export const usernameRegex = /^([\w-]{4,15})$/;
export const uuidv4Regex =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

/**
 * Promisify the mean to receive the request body from http.IncomingMessage
 */
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

/**
 * Promisify the mean to receive a response from http.ClientRequest which
 * extends http.OutgoingMessage
 */
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

/**
 * Send HTTP POST request.
 *
 * ex: const response = await httpPost({
 *       url: "http://localhost/users",
 *       data: { msg: "coucou depuis test" },
 *       options: { port: 4000 },
 *     });
 * @param {obj} config configuration to be sent {url, data, options}
 * @return {httpResponse} response to the sent request
 */
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

export const removeFiles = (files) => {
  files.forEach((file) => {
    fs.unlink(file, (err) => {
      if (err) console.error(err);
      if (process.env.DEV) console.log(`File ${file} is deleted.`);
    });
  });
};
