import { Router } from "express";
import { creataBonusRuleController, deleteBonusRuleController, generateBonusController, getAllBonusRulesController, getEmployeeBonusController, updateBonusRuleController } from "./bonus.controller";


const router = Router();

// Bonus Rules Route 
router.post("/create-bonus-rules", creataBonusRuleController)
router.put("/bonus-rules/:id", updateBonusRuleController)
router.get("/bonus-rules", getAllBonusRulesController)
router.delete("/bonus-rules/:id", deleteBonusRuleController)

// Generate Bonus
router.post("/generate-bonus", generateBonusController)
router.get("/employee-bonus", getEmployeeBonusController)


export default router;