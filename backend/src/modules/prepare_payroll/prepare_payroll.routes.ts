import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { getEmployeesByCycle, saveEmployeePayrollController } from "./prepare_payroll.controller";

const router = Router();

router.get("/employee-category-cycle",getEmployeesByCycle);
router.patch('/edit-payroll',saveEmployeePayrollController);

export default router;
