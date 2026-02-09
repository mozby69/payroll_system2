import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { fetchAllowanceController, saveAllowanceController,fetchAllowanceSummaryController,fetchAllowanceSummary2Controller, fetchArchiveAllowanceByMonthController } from "./allowance.controller";

const router = Router();

router.get("/fetch-allowance",fetchAllowanceController);
router.post("/save-allowance",saveAllowanceController);
router.get("/summary",fetchAllowanceSummaryController);
router.get("/grand-total",fetchAllowanceSummary2Controller);
router.get('/archive-allowance/:selectedMonth',fetchArchiveAllowanceByMonthController);
  


export default router;
