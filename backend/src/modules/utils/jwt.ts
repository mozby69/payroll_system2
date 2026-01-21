import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("JWT_SECRET missing");

export const signToken = (payload: object) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

export const verifyToken = (token: string) =>
  jwt.verify(token, JWT_SECRET);
