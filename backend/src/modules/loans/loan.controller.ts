import { Request, Response } from "express";
import { saveEmployeeLoan } from "../loans/loan.service";
import * as loanService from "../loans/loan.service"
import { LOAN_ACTION_TYPES, LoanActionType } from "./loan.types";

export const addEmployeeLoanController = async (req: Request, res: Response) => {
  try {
    const { empCode,loan_type,principal,term_value,term_unit,start_date, deduct_allowance } = req.body;

    if (!empCode || !loan_type || !principal || !term_value || !term_unit || !start_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const loan = await saveEmployeeLoan({
      empCode,
      loan_type,
      principal: Number(principal),
      term_value: Number(term_value),
      term_unit,
      start_date: new Date(start_date),
      deduct_allowance: Boolean(deduct_allowance),
    });

    return res.status(201).json(loan);
  } catch (error: any) {
    console.error("LOAN CREATE ERROR:", error);
    return res.status(500).json({
      message: error.message ?? "Loan creation failed",
    });
  }
};


const normalizeArray = (value: unknown): string[] | undefined => {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  return [String(value)];
};

export const getAllLoans = async (req: Request, res: Response) => {
  try {

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const search = String(req.query.search ?? "");

    const department = normalizeArray(req.query["department[]"]);
    const company = normalizeArray(req.query["company[]"]);
    const status = normalizeArray(req.query["status[]"]);
    const loanStatus = normalizeArray(req.query["loanStatus[]"]);

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      loanService.getAllLoans({
        skip,
        take: limit,
        search,
        department,
        company,
        status,
        loanStatus,
      }),
      loanService.countLoans({
        search,
        department,
        company,
        status,
        loanStatus,
      }),
    ]);

    return res.json({
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
    } catch (err: any) {
      console.error("PRISMA ERROR:", err);
      return res.status(500).json({
        message: err?.message,
        stack: err?.stack,
      });
    }

};

export const getLoanLedgerById = async (req:Request, res: Response) => {
  try {
    const loan_id = Number(req.params.loan_id);

    if (!loan_id) {
      return res.status(400).json({ message: "Invalid loan ID" });
    }

    const loan = await loanService.getLoanWithLedger(loan_id);

    return res.json(loan);
  }
  catch (error:any){
    return res.status(404).json({
      message: error.message,
    });
  }
};


export const getEmpLoanById = async (req: Request, res: Response) => {
  try {
    const loan_id = Number(req.params.loan_id);

    if (Number.isNaN(loan_id)) {
      return res.status(400).json({
        message: "Invalid loan ID",
      });
    }

    const loan = await loanService.getEmpLoan(loan_id);

    return res.status(200).json(loan);
  } catch (error: any) {
    if (error.message === "Loan not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to fetch loan",
      error: error.message,
    });
  }
};


export const updateEmployeeLoanController = async (
  req: Request,
  res: Response
) => {
  try {
    const loan_id = Number(req.params.loan_id);

    if (Number.isNaN(loan_id)) {
      return res.status(400).json({
        message: "Invalid loan ID",
      });
    }

    const {
      loan_type,
      principal,
      term_value,
      term_unit,
      start_date,
      deduct_allowance,
    } = req.body;

    if (
      !loan_type ||
      principal === undefined ||
      term_value === undefined ||
      !term_unit ||
      !start_date
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const updatedLoan = await loanService.updateEmployeeLoan({
      loan_id,
      loan_type,
      principal: Number(principal),
      term_value: Number(term_value),
      term_unit,
      start_date: new Date(start_date),
      deduct_allowance: Boolean(deduct_allowance),
    });

    return res.status(200).json(updatedLoan);
  } catch (error: any) {

    if (
      error.message ===
      "Loan structure cannot be modified after payments have started"
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }

    if (error.message === "Loan not found") {
      return res.status(404).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to update loan",
      error: error.message,
    });
  }
};

export const closedEmployeeLoanController = async (req:Request, res:Response) =>{
  try{
    const loan_id = Number(req.params.loan_id);
    const { remarks } = req.body;



    if (!loan_id || isNaN(loan_id)) {
      return res.status(400).json({
        message: "Invalid loan id",
      });
    }

    if (!remarks || !remarks.trim()) {
      return res.status(400).json({
        message: "Remarks are required",
      });
    }

    const closedLoan = await loanService.updateLoanStatus(
      loan_id,
      remarks
    );
    return res.status(200).json(closedLoan);
  }
  catch(error:any){
    if (
      error.message === "Loan not found" ||
      error.message === "Loan is already closed"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }
    if (error.message === "Remarks are required") {
      return res.status(400).json({
        message: error.message,
      });
    }
    return res.status(500).json({
      message: "Loan is already closed",
      error: error.message,
    });
  }
};

export const payEmployeeLoanController = async (
  req: Request,
  res: Response
) => {
  try {
    const loan_id = Number(req.params.loan_id);
    const { actionType } = req.body;

    if (Number.isNaN(loan_id)) {
      return res.status(400).json({
        message: "Invalid loan ID",
      });
    }

    if (!actionType || typeof actionType !== "string") {
      return res.status(400).json({
        message: "Loan action type is required",
      });
    }

    if (!LOAN_ACTION_TYPES.includes(actionType as LoanActionType)) {
      return res.status(400).json({
        message: "Invalid loan action type",
      });
    }

    const payment = await loanService.insertLoanPayment(
      loan_id,
      actionType as LoanActionType
    );

    return res.status(201).json(payment);
  } catch (error: any) {
    if (
      error.message === "Loan not found" ||
      error.message === "Loan is already CLOSED"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message === "Payroll already processed for this cycle") {
      return res.status(409).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to process loan payment",
      error: error.message,
    });
  }
};