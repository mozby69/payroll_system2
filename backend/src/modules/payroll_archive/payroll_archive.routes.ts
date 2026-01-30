import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import {  displayCompletePayrollController, savePayrollController } from "./payroll_archive.controller";

const router = Router();

// router.post("/archive-payroll",archivePayrollController);
router.get("/display-all",displayCompletePayrollController);
router.post("/payroll-save",savePayrollController);


export default router;
