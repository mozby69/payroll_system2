import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
export const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '10h' });
export const verifyToken = (token) => jwt.verify(token, JWT_SECRET);
