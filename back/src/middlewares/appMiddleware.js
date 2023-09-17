import { getBody } from "../utils.js";

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
  if (req.method === "POST") {
    let body = await getBody(req);
    req.body = JSON.parse(body);
  }
  next();
};
