import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { fetchAllowanceController, saveAllowanceController } from "./allowance.controller";

const router = Router();

router.get("/fetch-allowance",fetchAllowanceController);
router.post("/save-allowance",saveAllowanceController);

export default router;
