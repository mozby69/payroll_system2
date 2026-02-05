import { Router } from "express";
import { getCompanyDetailsController } from "./general.controller";


const router = Router();



router.get("/company-details", getCompanyDetailsController)


export default router;