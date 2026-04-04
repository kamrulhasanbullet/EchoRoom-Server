import { connectDB } from "../db/connect.js";
import { getTokenFromRequest, verifyToken } from "../middleware/auth.js";

export async function getRooms(req, res) {
  try {
    const token = getTokenFromRequest(req);
    const user = verifyToken(token);

    if (!user) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Unauthorized" }));
    }

    const db = await connectDB();
    let roomList = await db.collection("rooms").find({}).toArray();

    if (roomList.length === 0) {
      const defaults = [
        { roomId: "general", name: "general-chat" },
        { roomId: "tech", name: "tech-talk" },
        { roomId: "random", name: "random" },
      ];
      await db.collection("rooms").insertMany(defaults);
      roomList = defaults;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(roomList));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

export async function createRoom(req, res) {
  try {
    const token = getTokenFromRequest(req);
    const user = verifyToken(token);

    if (!user) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Unauthorized" }));
    }

    const { name } = req.body;
    if (!name?.trim()) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Room name required" }));
    }

    const roomId = name.trim().toLowerCase().replace(/\s+/g, "-");
    const db = await connectDB();

    const existing = await db.collection("rooms").findOne({ roomId });
    if (existing) {
      res.writeHead(409, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Room already exists" }));
    }

    const newRoom = {
      roomId,
      name: roomId,
      createdBy: user.username,
      createdAt: new Date(),
    };
    await db.collection("rooms").insertOne(newRoom);

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify(newRoom));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}
