import { Router } from "express";
import { creataBonusRuleController, createBonusRuleCompanyController, deleteBonusCompanyRuleController, deleteBonusRuleController, generateBonusController, getAllBonusRulesController, getBonusRuleCompanyController, getEmployeeBonusController, resetBonusController, submitBonusController, updateBonusRuleController } from "./bonus.controller";


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


export default router;