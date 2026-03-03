import { Router } from "express";
import { authenticateToken } from "./auth.middleware";
import { me, logout } from "./auth.controller";
const router = Router();
router.get("/me", authenticateToken, me);
router.post("/logout", authenticateToken, logout);
export default router;
