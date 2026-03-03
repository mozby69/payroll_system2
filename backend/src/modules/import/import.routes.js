// modules/import/import.routes.ts
import { Router } from "express";
import { importAttendanceCount, importBranches } from "./import.controller";
import { authenticateToken } from "../auth/auth.middleware";
const router = Router();
router.post("/branches", authenticateToken, importBranches);
router.post("/attendance-count", authenticateToken, importAttendanceCount);
export default router;
