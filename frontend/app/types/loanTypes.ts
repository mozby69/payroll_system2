

import { FilterKey } from "./FilterTypes";

export type AddLoanPayload = {
  empCode: string;
  loan_type: "FCH_LOAN" | "SSS_LOAN" | "PAGIBIG_LOAN" | "RFC_LOAN" | "OTHERS" | "ARE_LOAN" ;
  principal: number;
  term_value: number;
  term_unit: "MONTHS" | "YEARS";
  start_date: string;
  deduct_allowance: boolean;
  others_type:string;
};

export interface LoanList{
    loan_id: number;
    principal: number;
    loan_type: "FCH_LOAN" | "SSS_LOAN" | "PAGIBIG_LOAN" | "RFC_LOAN" | "OTHERS" | "ARE_LOAN";
    term_value: number;
    term_unit: "MONTHS" | "YEARS";
    start_date: string;
    deduct_allowance: boolean;
    per_payroll_deduct: number;
    empCode: string;
    status:string;
    fullname: string;
    extended_term: number;
}

export type LoanPaymentResponse = {
  loan_ledger_id: number;
  loan_id: number;
  EmpCodeId: string;
  transaction_date: string;
  transaction_type: "PAYROLL_DEDUCT";
  debit_amount: number;
  credit_amount: number;
  payment_status: "PAID";
  payroll_cycle: "10" | "25";
  remarks: string;
};


export interface LoanResponse {
  data: LoanList[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}


export type LoanFilters = Partial<
  Record<FilterKey, string[]>
>;


export type LedgerRow = {
  loan_ledger_id: number | string;
  transaction_date: string | null;
  transaction_type: string;
  payment_status: string | null;
  debit_amount: number;
  credit_amount: number;
  isPaid: boolean;
  isDeduction:boolean;
  isCreated:boolean;
};

export type LoanLedgerItem = {
  loan_ledger_id: number | string;
  transaction_date: string | null;
  transaction_type: string;
  payment_status: string | null;
  debit_amount: number;
  credit_amount: number;
  remarks: string | null;
  isPaid: boolean;
  isDeduction: boolean;
  isCreated: boolean;
  payroll_cycle?: "10" | "25";
};


export type LoanType = "FCH_LOAN" | "SSS_LOAN" | "PAGIBIG_LOAN" | "RFC_LOAN" | "OTHERS" | "ARE_LOAN";
export type AreType = "HOUSING" | "OTHERS";
export type TermUnit = "MONTHS" | "YEARS";

export type EmpLoanResponse = {
  loan_id: number;
  principal: number;
  loan_type: LoanType;
  term_value: number;
  term_unit: TermUnit;
  start_date: string;
  deduct_allowance: boolean;
  per_payroll_deduct: number;
  status: string;
  totalPaid: number;
  remainingPayment: number;
  totalExpectedDeductions: number;
  remainingBalance: number;
  ledger: LoanLedgerItem[];
};


export type UpdateLoanPayload = {
  loan_type: LoanType;
  principal: number;
  term_value: number;
  term_unit: TermUnit;
  start_date: string;
  deduct_allowance: boolean;
};

export type UpdateLoanVariables = {
    loan_id: number;
    payload: UpdateLoanPayload;
  };


export type CloseLoanRequest = {
  remarks: string;
};

export type CloseLoanVariables = {
    loan_id: number;
    payload: CloseLoanRequest;
  };

export const LOAN_ACTION_TYPES = [
  "EARLY_PAY",
  "SKIPPED",
] as const;

export type LoanActionType =
  typeof LOAN_ACTION_TYPES[number];


export type PayLoanPayload = {
  loan_id: number;
  actionType: LoanActionType;
};


export type FetchEmpLoansPayload = {
  empCode: string;
  payPeriod: string;       // "2026-02"
  payCycle: string;        // "10-pay-cycle"

};


export type LoanWithCycleInfo = {
  loan_id: number;
  loan_type: LoanType;
  principal: number;
  term_value: number;
  term_unit: TermUnit;
  start_date: string;
  per_payroll_deduct: number;
  deduct_allowance: boolean;
  latestLedger: LoanLedgerItem | null;
  hasLedgerForCurrentCycle: boolean;
};

export type EmpLoansByCycleResponse = {
  FCH_LOAN: LoanWithCycleInfo | null;
  SSS_LOAN: LoanWithCycleInfo | null;
  PAGIBIG_LOAN: LoanWithCycleInfo | null;
  RFC_LOAN: LoanWithCycleInfo | null;
  ARE_LOAN: LoanWithCycleInfo | null;
};


export type BonusRules = {
  code: string;
  name:string;
}

export type InfoProps = {
  label: string;
  value: string | number | null | undefined;
};

export type EmployeeSearchItem = {
  EmpCode: string;
  Firstname: string;
  Lastname: string;
};


export interface LoanLimitDetails {
  employee: {
    empCode?: string;
    employmentStatus?: string;
  };
  salary: {
    netPerPayroll: number;
    maxAllowedLoanDeduction: number;
  };
  loans: {
    existingLoans: Array<{
      per_payroll_deduct: number;
    }>;
    totalExistingLoanDeduction: number;
    newLoanDeduction: number;
    totalWithNewLoan: number;
    excessAmount: number;
  };
}

export interface ApiErrorResponse {
  code?: string;
  message?: string;
  details?: LoanLimitDetails;
}