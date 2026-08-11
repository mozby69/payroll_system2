import { Router } from "express";
import {  CompleteVarianceController, displayVarianceArchiveController, FetchEmployeeVarianceController, fetchVarianceController, saveFinalVarianceController, saveVarianceOverrideController } from "./variance.controller";
import { authenticateToken } from "../../middleware/authMiddleware";



const router = Router();

router.get("/fetch-variance",authenticateToken,fetchVarianceController);
router.get("/fetch-emp-variance",authenticateToken,FetchEmployeeVarianceController);
router.get("/complete-variance",authenticateToken,CompleteVarianceController);
router.post("/category-override",saveVarianceOverrideController);
router.post("/save-final-variance",authenticateToken,saveFinalVarianceController);
router.get("/get-main-archive-variance",displayVarianceArchiveController);

export default router;