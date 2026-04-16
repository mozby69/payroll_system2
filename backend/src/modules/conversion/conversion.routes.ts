import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { conversionReportController, DisplayConversionArchiveController, getAttendanceCountController, saveConversionArchiveController, updateVacationLeaveController } from "./conversion.controller";


const router = Router();

router.get("/fetch-conversion-list",getAttendanceCountController);
router.put("/vacation-leave-edit/:id",updateVacationLeaveController);
router.get("/fetch-reports",conversionReportController);
router.post("/save-conversion",saveConversionArchiveController);
router.get("/display-conversion-archive",DisplayConversionArchiveController);


export default router;