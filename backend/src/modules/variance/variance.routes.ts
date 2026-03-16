import { Router } from "express";
import { fetchEmployeeVarianceController, fetchVarianceController, fetchVarianceControllerEmp } from "./variance.controller";



const router = Router();


router.get("/fetch-variance", fetchVarianceController);
router.get("/fetch-employee-variance",fetchEmployeeVarianceController);

router.get("/fetch-variance-emp", fetchVarianceControllerEmp);

export default router;