import { verifyToken } from "../utils/jwt";
export function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthenticated" });
    }
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ message: "Invalid token" });
    }
}
