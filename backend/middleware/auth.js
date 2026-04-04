import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ Error: JWT_SECRET is not defined in .env file");
  process.exit(1);
}

export function createToken(payload) {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${payloadB64}`)
    .digest("base64url");

  return `${header}.${payloadB64}.${signature}`;
}

export function verifyToken(token) {
  if (!token) return null;
  try {
    const [header, payload, signature] = token.split(".");
    const expectedSig = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64url");

    if (signature !== expectedSig) return null;

    return JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return null;
  }
}

export function getTokenFromCookie(req) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {});

  return cookies.token || null;
}


export function getTokenFromRequest(req) {
  const authHeader = req.headers["authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return getTokenFromCookie(req);
}
