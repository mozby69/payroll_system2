import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { fetchAllowanceController, saveAllowanceController,fetchAllowanceSummaryController,fetchAllowanceSummary2Controller,
fetchArchiveAllowanceByMonthController, allowancePrintController, 
getBranchesByCompanyController,
fetchAllowancePrintDataController,
fetchViewAllListController,
updateAllowanceBranchController,
getTotalPerCompanyController,
sendBulkAllowanceServiceController,
updateEmergencyAllowanceController,
displayEmergencyAllowanceController,
updateAbsentOverrideController,
getVarianceEmployeesController,
exportAllowanceExcelController,
} from "./allowance.controller";

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
router.post("/update-branch", updateAllowanceBranchController);
router.post("/send-allowance-email",sendBulkAllowanceServiceController);
router.put("/emergency-allowance-edit/:allowance_id",updateEmergencyAllowanceController);
router.get("/display-emergency-allowance",displayEmergencyAllowanceController);
router.post("/update-absent",updateAbsentOverrideController);
router.get("/test",getTotalPerCompanyController);
router.get("/get-employee-variance",getVarianceEmployeesController);
router.get("/export-allowance",exportAllowanceExcelController);

export default router;
