import { Router } from "express";
import { getEmployees,getEmployeeByEmpCode, updateEmployeePayrollByEmpCode } from "./emp.controller";

const router = Router();

router.get("/employee", getEmployees);
router.get("/employee/:empCode", getEmployeeByEmpCode)


router.put("/employee/:empCode/payroll", updateEmployeePayrollByEmpCode);

export default router;
