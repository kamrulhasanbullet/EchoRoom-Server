import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

const client = new MongoClient(uri);
let db = null;

export async function connectDB() {
  if (db) return db;

  try {
    await client.connect();
    db = client.db(dbName);
    console.log(`✅ MongoDB Connected Successfully to database: ${dbName}`);
    return db;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    throw error;
  }
}

// Optional: Graceful shutdown
process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});
