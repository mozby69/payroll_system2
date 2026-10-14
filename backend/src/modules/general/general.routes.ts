import { Router } from "express";
import { generatePdfController, getCompaniesByCodeController,getCompaniesController, getCompaniesByCycleController, getCompanyDetailsController, getUniqueLoanController, fetchCompanyCyclesController, getBranchesDetailsController, reorderBranchesController, getBranchController, getGroups, createGroup, deleteGroup, assignBranch, getLocalModeController, updateLocalModeController } from "./general.controller";



const router = Router();


router.get("/company-details", getCompanyDetailsController)
router.get("/companies-by-cycle", getCompaniesByCycleController);
router.get("/companies-by-code/:CompanyCode", getCompaniesByCodeController);
router.get("/print",generatePdfController);
router.get("/companies", getCompaniesController);
router.get("/loan-types", getUniqueLoanController);
router.get("/fetch-company-cycle",fetchCompanyCyclesController);
router.get("/branches", getBranchesDetailsController)
router.put("/branches-reorder", reorderBranchesController);
router.get('/branch-list',getBranchController);

router.get("/branch-groups", getGroups);
router.post("/branch-groups", createGroup);
router.delete("/branch-groups/:id", deleteGroup);
router.patch("/branch-groups/:branchCode/assign", assignBranch);
router.get("/local-mode",getLocalModeController);
router.put("/local-mode",updateLocalModeController);


export default router;