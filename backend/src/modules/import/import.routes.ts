import { Router} from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { importSQLHandler } from "./import.controller";
import multer from 'multer';

const router = Router();
const upload = multer({ dest:'uploads/'});


router.post('/import-data',upload.single('sqlfile'),importSQLHandler);


export default router;