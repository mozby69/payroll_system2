import { Router } from "express";
import { displayPagibigContributionsController, displaySSSContributionsController, updatePagibigContributionController, updateSSSContributionController } from "./statutory.controller";


const router = Router();

router.get("/display-sss-contributions",displaySSSContributionsController);
router.put("/sss-contributions/:id",updateSSSContributionController);
router.get("/pagibig-list",displayPagibigContributionsController);
router.put("/pagibig-edit/:id",updatePagibigContributionController);

export default router;
