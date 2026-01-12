import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { savePayrollToArchiveController } from "./prepare_payroll.controller";

const router = Router();

router.get("/employee-summary",savePayrollToArchiveController);

export default router;
