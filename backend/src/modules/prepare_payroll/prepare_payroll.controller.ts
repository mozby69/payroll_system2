import { Request, Response } from "express";
import { ComputePayroll, fetchEmployeesByPayrollCycle, saveEmployeeLoan, saveEmployeePayroll, searchEmployees } from "./prepare_payroll.service";




export const getEmployeesByCycle = async (req: Request,res: Response) => {
  const cycle = req.query.cycle as "10-25-Cycle" | "15-30-Cycle" | undefined;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : undefined;

  if (!cycle) {
    return res.status(400).json({ message: "cycle is required" });
  }

  const result = await fetchEmployeesByPayrollCycle({
    cycle,
    page,
    limit,
    search,
  });

  res.json(result);
};





export const saveEmployeePayrollController = async (req: Request,res: Response) => {
  const {
    empCode,
    basic_salary,
    cash_assistance,
    pagibig_employee_share,
    pagibig_employer_share,
  } = req.body;

  if (!empCode) {
    return res.status(400).json({ message: "empCode is required" });
  }

  await saveEmployeePayroll({
    empCode,
    basic_salary:
      basic_salary !== undefined ? Number(basic_salary) : undefined,

    cash_assistance:
      cash_assistance !== undefined ? Number(cash_assistance) : undefined,

    pagibig_employee_share:
      pagibig_employee_share !== undefined
        ? Number(pagibig_employee_share)
        : undefined,

    pagibig_employer_share:
      pagibig_employer_share !== undefined
        ? Number(pagibig_employer_share)
        : undefined,
  });

  res.json({ message: "Payroll saved successfully" });
};







export const addEmployeeLoanController = async (req: Request, res: Response) => {
  try {
    const { empCode,loan_type,principal,term_value,term_unit,start_date } = req.body;

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
    });

    return res.status(201).json(loan);
  } catch (error: any) {
    console.error("LOAN CREATE ERROR:", error);
    return res.status(500).json({
      message: error.message ?? "Loan creation failed",
    });
  }
};




export const searchEmployeeController = async (req: Request, res: Response) => {
  const q = req.query.q?.toString() ?? "";
  const data = await searchEmployees(q);
  res.json(data);
};





export const getComputedPayrollController = async (req: Request,res: Response) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;



  const result = await ComputePayroll({
    page,
    limit,
    search,
  });

  res.json(result);
};

