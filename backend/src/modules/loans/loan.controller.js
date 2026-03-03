import { saveEmployeeLoan } from "../loans/loan.service";
import * as loanService from "../loans/loan.service";
import { LOAN_ACTION_TYPES } from "./loan.types";
import { LoanLimitError } from "./loan.error";
export const addEmployeeLoanController = async (req, res) => {
    try {
        const { empCode, loan_type, principal, term_value, term_unit, start_date, deduct_allowance, others_type, } = req.body;
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
            others_type,
        });
        return res.status(201).json(loan);
    }
    catch (error) {
        if (error instanceof LoanLimitError) {
            return res.status(400).json({
                code: "LOAN_LIMIT_EXCEEDED",
                message: error.message,
                details: error.details,
            });
        }
        if (error.message === "You have Existing Active Loan") {
            return res.status(400).json({
                code: "DUPLICATE_LOAN",
                message: error.message,
            });
        }
        if (error.message === "Enter Employee Basic Salary First.") {
            return res.status(400).json({
                code: "MISSING_SALARY",
                message: error.message,
            });
        }
        return res.status(500).json({
            message: "Loan creation failed",
        });
    }
};
const normalizeArray = (value) => {
    if (value === undefined)
        return undefined;
    if (Array.isArray(value))
        return value;
    return [String(value)];
};
export const getAllLoans = async (req, res) => {
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
    }
    catch (err) {
        return res.status(500).json({
            message: err?.message,
            stack: err?.stack,
        });
    }
};
export const getLoanLedgerById = async (req, res) => {
    try {
        const loan_id = Number(req.params.loan_id);
        if (!loan_id) {
            return res.status(400).json({ message: "Invalid loan ID" });
        }
        const loan = await loanService.getLoanWithLedger(loan_id);
        return res.json(loan);
    }
    catch (error) {
        return res.status(404).json({
            message: error.message,
        });
    }
};
export const getEmpLoanById = async (req, res) => {
    try {
        const loan_id = Number(req.params.loan_id);
        if (Number.isNaN(loan_id)) {
            return res.status(400).json({
                message: "Invalid loan ID",
            });
        }
        const loan = await loanService.getEmpLoan(loan_id);
        return res.status(200).json(loan);
    }
    catch (error) {
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
export const updateEmployeeLoanController = async (req, res) => {
    try {
        const loan_id = Number(req.params.loan_id);
        if (Number.isNaN(loan_id)) {
            return res.status(400).json({
                message: "Invalid loan ID",
            });
        }
        const { loan_type, principal, term_value, term_unit, start_date, deduct_allowance, } = req.body;
        if (!loan_type ||
            principal === undefined ||
            term_value === undefined ||
            !term_unit ||
            !start_date) {
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
    }
    catch (error) {
        if (error.message ===
            "Loan structure cannot be modified after payments have started") {
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
export const closedEmployeeLoanController = async (req, res) => {
    try {
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
        const closedLoan = await loanService.updateLoanStatus(loan_id, remarks);
        return res.status(200).json(closedLoan);
    }
    catch (error) {
        if (error.message === "Loan not found" ||
            error.message === "Loan is already closed") {
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
export const payEmployeeLoanController = async (req, res) => {
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
        if (!LOAN_ACTION_TYPES.includes(actionType)) {
            return res.status(400).json({
                message: "Invalid loan action type",
            });
        }
        const payment = await loanService.insertLoanPayment(loan_id, actionType);
        return res.status(201).json(payment);
    }
    catch (error) {
        if (error.message === "Loan not found" ||
            error.message === "Loan is already CLOSED") {
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
export const getLoansByEmpCodeController = async (req, res) => {
    try {
        const { empCode, payPeriod, payCycle, } = req.body;
        if (!empCode ||
            !payPeriod ||
            !payCycle) {
            return res.status(400).json({
                message: "Missing required fields",
            });
        }
        const loans = await loanService.fetchLoanByEmpCode({
            EmpCode: empCode,
            payPeriod,
            payCycle,
        });
        return res.status(200).json(loans);
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch employee loans",
            error: error.message,
        });
    }
};
export const getBonusRules = async (req, res) => {
    try {
        const codes = await loanService.fetchBonusRule();
        return res.status(200).json(codes);
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch bonus codes",
            error: error.message,
        });
    }
};
export const searchEmployeeController = async (req, res) => {
    const q = req.query.q?.toString() ?? "";
    const data = await loanService.searchEmployees(q);
    res.json(data);
};
