import { register, login } from "./controllers/authController.js";
import { getRooms, createRoom } from "./controllers/roomController.js";

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(JSON.parse(body || "{}")));
  });
}

export async function handleRoutes(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/auth/register" && req.method === "POST") {
    req.body = await parseBody(req);
    return register(req, res);
  }

  if (url.pathname === "/api/auth/login" && req.method === "POST") {
    req.body = await parseBody(req);
    return login(req, res);
  }

  if (url.pathname === "/api/rooms" && req.method === "GET") {
    return getRooms(req, res);
  }

  if (url.pathname === "/api/rooms" && req.method === "POST") {
    req.body = await parseBody(req);
    return createRoom(req, res);
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Route not found" }));
}
