import { Router } from "express";
import { generatePdfController, getCompaniesByCodeController, getCompaniesByCycleController, getCompanyDetailsController } from "./general.controller";
const router = Router();
router.get("/company-details", getCompanyDetailsController);
router.get("/companies-by-cycle", getCompaniesByCycleController);
router.get("/companies-by-code/:CompanyCode", getCompaniesByCodeController);
router.get("/print", generatePdfController);
export default router;
