import { Router } from "express";
import { getCompaniesByCycleController, getCompanyDetailsController } from "./general.controller";


const router = Router();



router.get("/company-details", getCompanyDetailsController)
router.get("/companies-by-cycle", getCompaniesByCycleController);

export default router;