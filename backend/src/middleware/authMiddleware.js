import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}
export function authenticateToken(req, res, next) {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({
            message: "Unauthorized: No token provided"
        });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded.id) {
            return res.status(401).json({
                message: "Invalid token payload"
            });
        }
        req.user = {
            id: decoded.id,
            username: decoded.username
        };
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Unauthorized: Invalid token"
        });
    }
}
