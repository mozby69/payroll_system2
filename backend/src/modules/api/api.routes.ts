import { Router } from "express";
import { getAttendance, getDisabledPayrollDatesController } from "./api.controller";


const router = Router();


router.post("/employee-attendance", getAttendance);
router.get("/disabled-dates",getDisabledPayrollDatesController);


export default router;