import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { getAttendanceCountController } from "./conversion.controller";


const router = Router();

router.get("/fetch-conversion-list",getAttendanceCountController);



export default router;