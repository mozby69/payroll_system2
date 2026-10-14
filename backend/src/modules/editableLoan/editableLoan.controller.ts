// controllers/auth.controller.ts
import { Request, Response } from "express";
import { verifyPasswordService,fetchLoanLedger, saveOverrideLoan } from "../editableLoan/editableLoan.service";

export const verifyPasswordController = async (
  req: Request,
  res: Response
) => {
  try {
    const { password } = req.body;

    const result = await verifyPasswordService(password);

    return res.json(result); // ✅ include user_id
  } catch (error: any) {
    return res.status(401).json({
      message: error.message || "Unauthorized",
    });
  }
};


export const fetchLoanLedgerController = async (
  req: Request,
  res: Response
) => {
  try {
    const { loanType, EmpCode, PayPeriod, PayCode } = req.body;

    if (!loanType || !EmpCode || !PayPeriod || !PayCode) {
      return res.status(400).json({
        message: "Missing required parameters",
      });
    }

    const result = await fetchLoanLedger(
      loanType,
      EmpCode,
      PayPeriod,
      PayCode
    );

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Failed to fetch loan ledger",
    });
  }
};

export const saveOverrideLoanController = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await saveOverrideLoan(req.body);
    return res.json(result);
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Failed to save override",
    });
  }
};