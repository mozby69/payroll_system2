import { Router } from "express";
import { fetchVarianceController } from "./variance.controller";



const router = Router();


router.get("/fetch-variance", fetchVarianceController);



export default router;