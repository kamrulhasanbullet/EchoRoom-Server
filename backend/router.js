import { register, login } from "./controllers/authController.js";
import { getRooms } from "./controllers/roomController.js";

export function handleRoutes(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Auth Routes
  if (url.pathname === "/api/auth/register" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      req.body = JSON.parse(body || "{}");
      register(req, res);
    });
    return;
  }

  if (url.pathname === "/api/auth/login" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      req.body = JSON.parse(body || "{}");
      login(req, res);
    });
    return;
  }

  // Protected Route
  if (url.pathname === "/api/rooms" && req.method === "GET") {
    getRooms(req, res);
    return;
  }

  // 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Route not found" }));
}
