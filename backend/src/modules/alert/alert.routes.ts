import { Router } from "express";
import { createAlertConfigurationController, getAlertConfigurationController } from "./alert.controller";

const router = Router();

router.post("/create-alert", createAlertConfigurationController);
router.get("/get-alert", getAlertConfigurationController);

export default router;