import { Router } from "express";
import { getMainDisburseController, saveEmployeeSetupController,approveDisburseController, getMainDisburseDetailsController, getDisburseCompaniesByCycle, updateCompanyDisburse } from "./disburse.controller";


const router = Router();

router.post("/save-employee-setup", saveEmployeeSetupController);
router.get("/main-disburse", getMainDisburseController);
router.patch("/approve/:id",approveDisburseController);
router.get("/details/:id",getMainDisburseDetailsController);
router.get("/disburse/companies", getDisburseCompaniesByCycle);
router.post("/companies/update", updateCompanyDisburse);
export default router;