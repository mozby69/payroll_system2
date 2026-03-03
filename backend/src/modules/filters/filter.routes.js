import { Router } from "express";
import { getEmployeeFilters } from "./filter.controller";
const router = Router();
router.get("/filters", getEmployeeFilters);
export default router;
