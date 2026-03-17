import { Router } from "express";
import {  displayCompletePayrollController, savePayrollController,saveComputedFinalPayrollController,displayForApprovalController,reCheckPayrollController, getTotalPayrollController, getEmployeeArchivedController, ViewEmployeeBankAccountsController, GenerateBankFileController, printEmployeeArchivedController, saveWtaxOverrideController, SaveToApproverPayrollController, getPayrollArchiveReportController, reCheckPayrollToCheckerController } from "./payroll_archive.controller";
import { authenticateToken } from "../../middleware/authMiddleware";

const router = Router();

// router.post("/archive-payroll",archivePayrollController);
router.get("/display-all",displayCompletePayrollController);
router.post("/payroll-save",savePayrollController);
router.post("/archived-final-payroll",authenticateToken,saveComputedFinalPayrollController);
router.get("/for-approval",displayForApprovalController);
router.post("/recheck-payroll",reCheckPayrollController);
router.get("/total-payroll", getTotalPayrollController)
router.get("/employee-archived", getEmployeeArchivedController)
router.get("/employee-bank-list",ViewEmployeeBankAccountsController);
router.post("/generate-bank-file",GenerateBankFileController);
router.get("/employee-archived/print", printEmployeeArchivedController);
router.post("/wtax-override",saveWtaxOverrideController);
router.post('/save-to-approver',authenticateToken,SaveToApproverPayrollController);
router.get( "/payroll-archive-report/:id",getPayrollArchiveReportController);
router.post("/recheck-back-to-checker",authenticateToken,reCheckPayrollToCheckerController);


export default router;
