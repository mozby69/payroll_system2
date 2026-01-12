import { Router } from "express";
import { SaveOneYearOldDataSummary,SaveOneYearOldDataArchive } from "./data_archive.controller";
import { authenticateToken } from "../../middleware/authMiddleware";


const router = Router();


router.post('data-summary',authenticateToken,SaveOneYearOldDataSummary);
router.post('data-archive',authenticateToken,SaveOneYearOldDataArchive);



export default router;