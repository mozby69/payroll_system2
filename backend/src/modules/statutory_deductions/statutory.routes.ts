import { Router } from "express";
import { displayPagibigContributionsController, displayPhilhealthContributionController, displaySSSContributionsController, displayWtaxController, displayWTaxController, DisplayWtaxPaidController, saveWtaxMonthlyController, updatePagibigContributionController, updatePhilhealthController, updateSSSContributionController, updateWTaxController, wtaxComputationListController, WtaxFetchDataController } from "./statutory.controller";


const router = Router();

router.get("/display-sss-contributions",displaySSSContributionsController);
router.put("/sss-contributions/:id",updateSSSContributionController);
router.get("/pagibig-list",displayPagibigContributionsController);
router.put("/pagibig-edit/:id",updatePagibigContributionController);
router.get("/philhealth-list",displayPhilhealthContributionController);
router.put("/philhealth-edit/:id",updatePhilhealthController);
router.get("/display-wtax",displayWTaxController);
router.put("/wtax-edit/:id",updateWTaxController);
router.get("/get-wtax-computation-list",wtaxComputationListController);
router.post("/save-monthly-tax",saveWtaxMonthlyController);
router.get('/display-wtax-monthly/:empCodeId',displayWtaxController);
router.get("/display-tax-paid/:empCodeId",DisplayWtaxPaidController);
router.get("/wtax-fetch",WtaxFetchDataController);

export default router;
