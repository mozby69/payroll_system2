import { Router } from "express";
//import { authenticateToken } from "../../../src/middleware/authMiddleware";
import { authenticateToken } from "../auth/auth.middleware";
import { getEmployees,getEmployeeByEmpCode, updateEmployeePayrollByEmpCode, getEmployeesByCompany, bulkIncreaseEmployeeSalary } from "./emp.controller";

const router = Router();

router.get("/employee", getEmployees);
router.get("/employee/:empCode", getEmployeeByEmpCode)


router.put("/employee/:empCode/payroll", updateEmployeePayrollByEmpCode);
router.get(
  "/employees/company/:companyCode",
  getEmployeesByCompany
);

router.put(
  "/employees/bulk-increase",authenticateToken,
  bulkIncreaseEmployeeSalary
);


export default router;
