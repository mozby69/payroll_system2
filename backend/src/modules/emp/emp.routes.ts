import { Router } from "express";
import { getEmployees } from "./emp.controller";

const router = Router();

router.get("/employee", getEmployees);

export default router;
