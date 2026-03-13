import { Router } from "express";
import { generatePdfController, getCompaniesByCodeController,getCompaniesController, getCompaniesByCycleController, getCompanyDetailsController, getUniqueLoanController, fetchCompanyCyclesController } from "./general.controller";



const router = Router();


router.get("/company-details", getCompanyDetailsController)
router.get("/companies-by-cycle", getCompaniesByCycleController);
router.get("/companies-by-code/:CompanyCode", getCompaniesByCodeController);
router.get("/print",generatePdfController);
router.get("/companies", getCompaniesController);
router.get("/loan-types", getUniqueLoanController);
router.get("/fetch-company-cycle",fetchCompanyCyclesController);

export default router;