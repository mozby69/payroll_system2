// modules/import/import.routes.ts
import { Router } from "express";
import { importBranches } from "./import.controller";



const router = Router();
router.post("/branches", importBranches);

export default router;
