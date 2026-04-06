import { Router } from "express";
import { fetchEmployeeVarianceController, fetchVarianceController, fetchVarianceControllerEmp } from "./variance.controller";
import { authenticateToken } from "../../middleware/authMiddleware";



const router = Router();


router.get("/fetch-variance", authenticateToken, fetchVarianceController);
router.get("/fetch-employee-variance",fetchEmployeeVarianceController);

router.get("/fetch-variance-emp", authenticateToken, fetchVarianceControllerEmp);

export default router;