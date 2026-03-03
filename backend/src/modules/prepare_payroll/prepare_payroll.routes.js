import { Router } from "express";
import { getComputedPayrollController, getEmployeesByCycle, saveEmployeePayrollController, searchEmployeeController } from "./prepare_payroll.controller";
const router = Router();
router.get("/employee-category-cycle", getEmployeesByCycle);
router.patch('/edit-payroll', saveEmployeePayrollController);
router.get('/employees/search', searchEmployeeController);
router.get('/computed-payroll', getComputedPayrollController);
export default router;
