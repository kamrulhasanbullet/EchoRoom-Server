import { connectDB } from "../db/connect.js";
import crypto from "crypto";
import { createToken } from "../middleware/auth.js";

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "All fields are required" }));
    }

    const db = await connectDB();
    const users = db.collection("users");

    const existing = await users.findOne({ email });
    if (existing) {
      res.writeHead(409);
      return res.end(JSON.stringify({ error: "User already exists" }));
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, "sha512")
      .toString("hex");
    const hashedPassword = `${salt}:${hash}`;

    await users.insertOne({
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "User registered successfully" }));
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.writeHead(400);
      return res.end(JSON.stringify({ error: "Email and password required" }));
    }

    const db = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne({ email });
    if (!user) {
      res.writeHead(401);
      return res.end(JSON.stringify({ error: "Invalid credentials" }));
    }

    const [salt, storedHash] = user.password.split(":");
    const hash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, "sha512")
      .toString("hex");

    if (hash !== storedHash) {
      res.writeHead(401);
      return res.end(JSON.stringify({ error: "Invalid credentials" }));
    }

    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    });

    res.writeHead(200, {
      "Set-Cookie": `token=${token}; HttpOnly; Path=/; Max-Age=7200; SameSite=Strict`,
      "Content-Type": "application/json",
    });

    res.end(
      JSON.stringify({
        message: "Login successful",
        username: user.username,
      }),
    );
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}
