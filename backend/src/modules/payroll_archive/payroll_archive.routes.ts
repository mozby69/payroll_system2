import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import {  displayCompletePayrollController, savePayrollController,saveComputedFinalPayrollController,displayForApprovalController,reCheckPayrollController } from "./payroll_archive.controller";

const router = Router();

// router.post("/archive-payroll",archivePayrollController);
router.get("/display-all",displayCompletePayrollController);
router.post("/payroll-save",savePayrollController);
router.post("/archived-final-payroll",saveComputedFinalPayrollController);
router.get("/for-approval",displayForApprovalController);
router.post("/recheck-payroll",reCheckPayrollController);



export default router;
