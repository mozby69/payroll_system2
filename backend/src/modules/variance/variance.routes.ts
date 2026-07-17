import { Router } from "express";
import {  CompleteVarianceController, FetchEmployeeVarianceController, fetchVarianceController } from "./variance.controller";
import { authenticateToken } from "../../middleware/authMiddleware";



const router = Router();

router.get("/fetch-variance",authenticateToken,fetchVarianceController);
router.get("/fetch-emp-variance",authenticateToken,FetchEmployeeVarianceController);
router.get("/complete-variance",authenticateToken,CompleteVarianceController);

export default router;