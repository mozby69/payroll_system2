import { Router } from "express";
import { generatePdfController, getCompaniesByCycleController, getCompanyDetailsController } from "./general.controller";


const router = Router();



router.get("/company-details", getCompanyDetailsController)
router.get("/companies-by-cycle", getCompaniesByCycleController);
router.get("/print",generatePdfController);


export default router;