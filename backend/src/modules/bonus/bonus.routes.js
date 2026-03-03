import { Router } from "express";
import { approveBonusController, checkPayroll, creataBonusRuleController, createBonusRuleCompanyController, deleteBonusCompanyRuleController, deleteBonusRuleController, generateBonusController, getAllBonusRulesController, getBonusRuleCompanyController, getBonusSummaryController, getEmployeeBonusBySummaryIdController, getEmployeeBonusController, getEmployeesByBonusSummaryController, rejectBonusController, releaseBonusController, resetBonusController, submitBonusController, updateBonusController, updateBonusRuleController } from "./bonus.controller";
import { authenticateToken } from "../../middleware/authMiddleware";
const router = Router();
// Bonus Rules Route 
router.post("/create-bonus-rules", creataBonusRuleController);
router.put("/bonus-rules/:id", updateBonusRuleController);
router.get("/bonus-rules", getAllBonusRulesController);
router.delete("/bonus-rules/:id", deleteBonusRuleController);
// Company Rules 
router.post("/company-rules", createBonusRuleCompanyController);
router.delete("/company-rules/:id", deleteBonusCompanyRuleController);
router.get("/company-rules/:bonusRuleId", getBonusRuleCompanyController);
// Generate Bonus
router.post("/generate-bonus", generateBonusController);
router.get("/employee-bonus", getEmployeeBonusController);
router.post("/reset-bonus", resetBonusController);
router.post("/submit-bonus", submitBonusController);
router.get("/get-summary", getBonusSummaryController);
router.get("/get-summary/:id", getEmployeeBonusBySummaryIdController);
router.post("/approve/:id", authenticateToken, approveBonusController);
router.post("/release/:id", authenticateToken, releaseBonusController);
router.post("/reject/:id", authenticateToken, rejectBonusController);
router.put("/update-bonus/:id", authenticateToken, updateBonusController);
router.get("/employee-bonuses/", getEmployeesByBonusSummaryController);
router.get("/test", checkPayroll);
export default router;
