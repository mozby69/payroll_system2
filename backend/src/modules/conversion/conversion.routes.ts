import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { getAttendanceCountController, updateVacationLeaveController } from "./conversion.controller";


const router = Router();

router.get("/fetch-conversion-list",getAttendanceCountController);
router.put("/vacation-leave-edit/:id",updateVacationLeaveController);


export default router;