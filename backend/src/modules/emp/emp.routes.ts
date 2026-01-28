import { Router } from "express";
import { getEmployees,getEmployeeByEmpCode } from "./emp.controller";

const router = Router();

router.get("/employee", getEmployees);
router.get("/employee/:empCode", getEmployeeByEmpCode)

export default router;
