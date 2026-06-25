import { Router } from "express";
import { approveRequest, getAttendance, getDisabledPayrollDatesController } from "./api.controller";


const router = Router();


router.post("/employee-attendance", getAttendance);
router.get("/disabled-dates",getDisabledPayrollDatesController);
router.post("/sms",approveRequest);


export default router;




