import { Router } from "express";
import {  displayCompletePayrollController, savePayrollController,saveComputedFinalPayrollController,displayForApprovalController,reCheckPayrollController, getTotalPayrollController, getEmployeeArchivedController } from "./payroll_archive.controller";

const router = Router();

// router.post("/archive-payroll",archivePayrollController);
router.get("/display-all",displayCompletePayrollController);
router.post("/payroll-save",savePayrollController);
router.post("/archived-final-payroll",saveComputedFinalPayrollController);
router.get("/for-approval",displayForApprovalController);
router.post("/recheck-payroll",reCheckPayrollController);
router.get("/total-payroll", getTotalPayrollController)
router.get("/employee-archived", getEmployeeArchivedController)



export default router;
