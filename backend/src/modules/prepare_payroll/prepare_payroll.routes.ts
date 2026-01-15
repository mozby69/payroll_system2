import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { getEmployeesByCycle } from "./prepare_payroll.controller";

const router = Router();

router.get("/employee-category-cycle",getEmployeesByCycle);

export default router;
