import { connectDB } from "../db/connect.js";
import { getTokenFromCookie, verifyToken } from "../middleware/auth.js";

export async function getRooms(req, res) {
  try {
    const token = getTokenFromCookie(req);
    const user = verifyToken(token);

    if (!user) {
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Unauthorized" }));
    }

    const db = await connectDB();
    const rooms = db.collection("rooms");

    let roomList = await rooms.find({}).toArray();

    if (roomList.length === 0) {
      roomList = [
        { roomId: "general", name: "General" },
        { roomId: "tech", name: "Tech Talk" },
        { roomId: "random", name: "Random" },
      ];
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(roomList));
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}
