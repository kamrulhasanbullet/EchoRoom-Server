import http from "http";
import { handleRoutes } from "./router.js";
import { initializeWebSocket } from "./ws/chatServer.js";

const PORT = 3000;

const server = http.createServer((req, res) => {
  console.log(`→ ${req.method} ${req.url}`);

  // CORS for Live Server (Frontend)
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Cookie");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  handleRoutes(req, res);
});

// WebSocket Initialize
initializeWebSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 EchoRoom Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket is ready`);
});
