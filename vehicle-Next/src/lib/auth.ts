import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

type AuthPayload = {
  userId: string;
  email: string;
};

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAuthToken(payload: AuthPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "30d",
  });
}

export function verifyAuthToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization");

  if (!auth || !auth.startsWith("Bearer ")) {
    return null;
  }

  return auth.slice(7);
}

export function getAuthUser(req: Request) {
  const token = getBearerToken(req);

  if (!token) return null;

  return verifyAuthToken(token);
}
