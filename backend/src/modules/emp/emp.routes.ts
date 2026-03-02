import { Router } from "express";
import { getEmployees,getEmployeeByEmpCode, updateEmployeePayrollByEmpCode, getCompanies, getEmployeesByCompany, bulkIncreaseEmployeeSalary } from "./emp.controller";

const router = Router();

router.get("/employee", getEmployees);
router.get("/employee/:empCode", getEmployeeByEmpCode)


router.put("/employee/:empCode/payroll", updateEmployeePayrollByEmpCode);
router.get("/companies", getCompanies);
router.get(
  "/employees/company/:companyCode",
  getEmployeesByCompany
);

router.put(
  "/employees/bulk-increase",
  bulkIncreaseEmployeeSalary
);


export default router;
