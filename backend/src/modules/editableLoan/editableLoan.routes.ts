// routes/auth.routes.ts
import express from "express";
import { verifyPasswordController, fetchLoanLedgerController, saveOverrideLoanController } from "../editableLoan/editableLoan.controller";
import { authenticateToken } from "../auth/auth.middleware";

const router = express.Router();

router.post("/verify-password", authenticateToken, verifyPasswordController);
router.post("/loan-ledger", fetchLoanLedgerController);
router.post("/loan_override", saveOverrideLoanController)


export default router;