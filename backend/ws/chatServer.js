import { WebSocketServer } from "ws";
import { verifyToken, getTokenFromCookie } from "../middleware/auth.js";

export function initializeWebSocket(httpServer) {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (ws, req) => {
    const token = getTokenFromCookie(req);
    const user = verifyToken(token);

    if (!user) {
      ws.close(1008, "Unauthorized");
      console.log("❌ Unauthorized WebSocket connection rejected");
      return;
    }

    ws.user = user;
    console.log(`✅ User connected via WebSocket: ${user.username}`);
  });

  console.log("📡 WebSocket Server Initialized");
}
