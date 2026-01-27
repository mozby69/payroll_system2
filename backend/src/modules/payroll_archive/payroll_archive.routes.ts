import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { archivePayrollController } from "./payroll_archive.controller";

const router = Router();

router.post("/archive-payroll",archivePayrollController);


export default router;
