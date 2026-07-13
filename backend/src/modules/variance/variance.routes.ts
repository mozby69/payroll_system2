import { Router } from "express";
import {  FetchEmployeeVarianceController, fetchVarianceController } from "./variance.controller";
import { authenticateToken } from "../../middleware/authMiddleware";



const router = Router();

router.get("/fetch-variance",authenticateToken,fetchVarianceController);
router.get("/fetch-emp-variance",authenticateToken,FetchEmployeeVarianceController);

export default router;