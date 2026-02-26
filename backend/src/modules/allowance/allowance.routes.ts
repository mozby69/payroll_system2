import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { fetchAllowanceController, saveAllowanceController,fetchAllowanceSummaryController,fetchAllowanceSummary2Controller,
fetchArchiveAllowanceByMonthController, allowancePrintController, 
getBranchesByCompanyController,
fetchAllowancePrintDataController,
fetchViewAllListController} from "./allowance.controller";

const router = Router();

router.get("/fetch-allowance",fetchAllowanceController);
router.post("/save-allowance",saveAllowanceController);
router.get("/summary",fetchAllowanceSummaryController);
router.get("/grand-total",fetchAllowanceSummary2Controller);
router.get('/archive-allowance/:selectedMonth',fetchArchiveAllowanceByMonthController);
router.get('/print-branch',allowancePrintController);
router.get("/branches-by-company",getBranchesByCompanyController);
router.get("/print-data", fetchAllowancePrintDataController);
router.get("/view-all",fetchViewAllListController);


export default router;
