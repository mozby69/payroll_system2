import { Router } from "express";
import { getAttendance } from "./api.controller";


const router = Router();


router.post("/employee-attendance", getAttendance )


export default router;