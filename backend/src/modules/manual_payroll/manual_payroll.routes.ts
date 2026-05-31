import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { createPayrollController, DisplayManualPayrollController, ExistingPaycodeController } from "./manual_payroll.controller";

const router = Router();


router.get("/fetch-existing-paycode",ExistingPaycodeController);
router.post("/create-payroll",createPayrollController);
router.get("/display-manual-payroll",DisplayManualPayrollController);


export default router;
