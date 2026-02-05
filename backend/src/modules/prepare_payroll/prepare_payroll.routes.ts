import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { getComputedPayrollController, getEmployeesByCycle, saveEmployeePayrollController, searchEmployeeController } from "./prepare_payroll.controller";

const router = Router();

router.get("/employee-category-cycle",getEmployeesByCycle);
router.patch('/edit-payroll',saveEmployeePayrollController);
router.get('/employees/search',searchEmployeeController);
router.get('/computed-payroll',getComputedPayrollController);

export default router;
