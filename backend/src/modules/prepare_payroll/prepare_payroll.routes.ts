import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { getComputedPayrollController, getEmployeesByCycle, InitializeComputePayrollController, InitializeEmployeesbyCycleController, saveEmployeePayrollController, searchEmployeeController, updateDeductionController, ViewDeductionController } from "./prepare_payroll.controller";
import { requirePermission } from "../../middleware/permission.middleware";

const router = Router();

router.get("/employee-category-cycle",getEmployeesByCycle);
router.patch('/edit-payroll',authenticateToken,saveEmployeePayrollController);
router.get('/employees/search',searchEmployeeController);
router.get('/computed-payroll', getComputedPayrollController);
router.get('/initialize-payroll',InitializeEmployeesbyCycleController);
router.get('/initialize-computed-payroll',InitializeComputePayrollController);
router.get('/get-deductions-only',ViewDeductionController);
router.put("/payroll-override", updateDeductionController);

export default router;
