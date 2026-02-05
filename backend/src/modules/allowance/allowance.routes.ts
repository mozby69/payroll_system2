import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { fetchAllowanceController, saveAllowanceController,fetchAllowanceSummaryController,fetchArchiveAllowanceController } from "./allowance.controller";

const router = Router();

router.get("/fetch-allowance",fetchAllowanceController);
router.post("/save-allowance",saveAllowanceController);
router.get("/summary",fetchAllowanceSummaryController);
router.get("/allowance-group",fetchArchiveAllowanceController);

export default router;
