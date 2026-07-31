
// Loan Type Code ↓

import { Decimal } from "@prisma/client/runtime/library";

const MONTH_INDEX: Record<string, number> = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

export function convertPayrollLabelToPeriod(
  payrollLabel: string
): string {
  const [monthName, , , yearStr] = payrollLabel.split("-");

  const monthIndex = MONTH_INDEX[monthName];
  if (monthIndex === undefined) {
    throw new Error(`Invalid month name: ${monthName}`);
  }

  const year = Number(yearStr);
  if (Number.isNaN(year)) {
    throw new Error(`Invalid year in payroll label: ${payrollLabel}`);
  }

  const resultMonth = String(monthIndex + 1).padStart(2, "0");
  return `${year}-${resultMonth}`;
}


//  Loan Type Code ↑




export interface EmployeeBankAccountsParams{
  PayCode:string;
  cycle_category: "10-25-Cycle" | "15-30-Cycle" | undefined;
  company_id:string;
}

export interface PayrollRow {
  PayCode: string;
  cycle_category: string | null;
  Netpay: number;
  BranchCodeId:string | null;
  EmpCode: {
    Firstname: string | null;
    Lastname: string | null;
    isAlien?:boolean,
    secondaryBranchId?:string,
    BranchCode: {
      company_id: string | null;
    } | null;
  };
}


export interface BankFileRow {
  bankAccount: string;
  amount: number;
}





type MoneyValue =
  | Decimal
  | string
  | number
  | null
  | undefined;

export type SendPayslipType = {
  id: number;
  EmpCodeId: string;

  PayCode: string | null;
  Late: MoneyValue;
  Absent: MoneyValue;

  payroll_period: string | null;
  selected_payroll_date: string | null;

  undertime: MoneyValue;
  Overtime: MoneyValue;
  Grosspay: MoneyValue;
  w_tax: MoneyValue;
  Netpay: MoneyValue;
  Basic_salary: MoneyValue;

  SSS_employee_share: MoneyValue;
  SSS_employer_share: MoneyValue;

  Pagibig_employee_share: MoneyValue;
  Pagibig_employer_share: MoneyValue;

  philhealth_employee_share: MoneyValue;
  philhealth_employer_share: MoneyValue;

  ar_e: MoneyValue;
  fch_loan: MoneyValue;
  rfc_loan: MoneyValue;
  pagibig_loan: MoneyValue;
  sss_loan: MoneyValue;
  sss_calamity_loan: MoneyValue;

  total_deductions: MoneyValue;

  EmpCode: {
    Firstname: string | null;
    Middlename: string | null;
    Lastname: string | null;

    BranchCode: {
      branchCode: string;
      Company: string | null;
      Location: string | null;
      company_id: string | null;
    } | null;

    employeepayroll: {
      gmail_account: string | null;
    } | null;
  };
};