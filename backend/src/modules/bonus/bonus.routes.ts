import { Router } from "express";
import { approveBonusController, creataBonusRuleController, createBonusRuleCompanyController, deleteBonusCompanyRuleController, deleteBonusRuleController, generateBonusController, getAllBonusRulesController, getBonusRuleCompanyController, getBonusSummaryController, getEmployeeBonusBySummaryIdController, getEmployeeBonusController, releaseBonusController, resetBonusController, submitBonusController, updateBonusRuleController } from "./bonus.controller";
import { authenticateToken } from "../../middleware/authMiddleware";


const router = Router();

// Bonus Rules Route 
router.post("/create-bonus-rules", creataBonusRuleController)
router.put("/bonus-rules/:id", updateBonusRuleController)
router.get("/bonus-rules", getAllBonusRulesController)
router.delete("/bonus-rules/:id", deleteBonusRuleController)

// Company Rules 

router.post("/company-rules", createBonusRuleCompanyController)
router.delete("/company-rules/:id", deleteBonusCompanyRuleController)
router.get("/company-rules/:bonusRuleId", getBonusRuleCompanyController)

// Generate Bonus
router.post("/generate-bonus", generateBonusController)
router.get("/employee-bonus", getEmployeeBonusController)
router.post("/reset-bonus", resetBonusController)
router.post("/submit-bonus", submitBonusController)
router.get("/get-summary", getBonusSummaryController)
router.get("/get-summary/:id", getEmployeeBonusBySummaryIdController)
router.post("/approve/:id", authenticateToken, approveBonusController)
router.post("/release/:id", authenticateToken, releaseBonusController)
  

export default router;