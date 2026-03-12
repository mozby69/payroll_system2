import { Router } from "express";
import { fetchEmployeeVarianceController, fetchVarianceController } from "./variance.controller";



const router = Router();


router.get("/fetch-variance", fetchVarianceController);
router.get("/fetch-employee-variance",fetchEmployeeVarianceController);


export default router;