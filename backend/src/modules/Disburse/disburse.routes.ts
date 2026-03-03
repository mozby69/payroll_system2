import { Router } from "express";
import { getMainDisburseController, saveEmployeeSetupController,approveDisburseController, getMainDisburseDetailsController } from "./disburse.controller";


const router = Router();

router.post("/save-employee-setup", saveEmployeeSetupController);
router.get("/main-disburse", getMainDisburseController);
router.patch("/approve/:id",approveDisburseController);
router.get("/details/:id",getMainDisburseDetailsController);
export default router;