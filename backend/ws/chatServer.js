import { WebSocketServer } from "ws";
import { verifyToken, getTokenFromCookie } from "../middleware/auth.js";
import { connectDB } from "../db/connect.js";

export function initializeWebSocket(httpServer) {
  const wss = new WebSocketServer({ server: httpServer });
  const rooms = new Map();

  wss.on("connection", async (ws, req) => {
    const url = new URL(req.url, "http://localhost");
    const token = url.searchParams.get("token") || getTokenFromCookie(req);
    const user = verifyToken(token);

    if (!user) {
      ws.close(1008, "Unauthorized");
      console.log("❌ Unauthorized WebSocket connection rejected");
      return;
    }

    ws.user = user;
    ws.roomId = "general";

    if (!rooms.has(ws.roomId)) rooms.set(ws.roomId, new Set());
    rooms.get(ws.roomId).add(ws);

    console.log(`✅ ${user.username} connected via WebSocket`);

    ws.on("message", async (rawData) => {
      try {
        const data = JSON.parse(rawData);

        if (data.type === "join") {
          rooms.get(ws.roomId)?.delete(ws);

          ws.roomId = data.roomId;
          if (!rooms.has(ws.roomId)) rooms.set(ws.roomId, new Set());
          rooms.get(ws.roomId).add(ws);

          const db = await connectDB();
          const messages = await db
            .collection("messages")
            .find({ roomId: ws.roomId })
            .sort({ createdAt: 1 })
            .limit(50)
            .toArray();

          ws.send(JSON.stringify({ type: "history", messages }));
          return;
        }

        if (data.type === "message" && data.message?.trim()) {
          const msgObj = {
            type: "message",
            roomId: ws.roomId,
            username: ws.user.username,
            message: data.message.trim(),
            createdAt: new Date(),
          };

          const db = await connectDB();
          await db.collection("messages").insertOne({ ...msgObj });

          rooms.get(ws.roomId)?.forEach((client) => {
            if (client.readyState === 1) {
              client.send(JSON.stringify(msgObj));
            }
          });
        }
      } catch (e) {
        console.error("WS message error:", e.message);
      }
    });

    ws.on("close", () => {
      rooms.get(ws.roomId)?.delete(ws);
      console.log(`❌ ${ws.user?.username} disconnected`);
    });
  });

  console.log("📡 WebSocket Server Initialized");
}
