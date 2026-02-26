import { Router } from "express";
import { printPayrollController } from "./print.controller";


const router = Router();
router.post("/print-payroll", printPayrollController)



export default router;
