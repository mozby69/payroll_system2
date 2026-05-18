import { Router } from "express";
import { displayPagibigContributionsController, displayPhilhealthContributionController, displaySSSContributionsController, displayWTaxController, updatePagibigContributionController, updatePhilhealthController, updateSSSContributionController, updateWTaxController, wtaxComputationListController } from "./statutory.controller";


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




export default router;
