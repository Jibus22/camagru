import { getBody } from "../utils.js";
import formidable, { errors as formidableErrors } from "formidable";

// Authorize for the whole server any request from my front (CORS).
export const allowCors = (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  next();
};

export const logRequest = (req, res, next) => {
  console.log("[ " + req.method + " " + req.url + " ]");
  next();
};

export const bodyParser = async (req, res, next) => {
  if (!req.headers["content-type"]) return next();

  if (req.headers["content-type"] === "application/json") {
    let body = await getBody(req);
    req.body = JSON.parse(body);
  } else if (
    req.method.toLowerCase() === "post" &&
    req.headers["content-type"].startsWith("multipart/form-data; boundary=")
  ) {
    const form = formidable({});
    let fields;
    let files;
    try {
      [fields, files] = await form.parse(req);
      req.fields = fields;
      req.files = files;
    } catch (err) {
      console.error(err);
      return res.status(err.httpCode || 400).json({ msg: String(err) });
    }
  }

  next();
};
