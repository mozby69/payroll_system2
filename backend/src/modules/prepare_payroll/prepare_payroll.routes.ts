import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { addEmployeeLoanController, getEmployeesByCycle, saveEmployeePayrollController, searchEmployeeController } from "./prepare_payroll.controller";

const router = Router();

router.get("/employee-category-cycle",getEmployeesByCycle);
router.patch('/edit-payroll',saveEmployeePayrollController);
router.post('/loans-add',addEmployeeLoanController);
router.get('/employees/search',searchEmployeeController);

export default router;
