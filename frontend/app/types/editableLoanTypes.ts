export interface VerifyPasswordPayload {
  password: string;
}

export interface VerifyPasswordResponse {
  success: boolean;
  user_id: number;
}

export interface FetchLoanLedgerPayload {
  loanType: string;
  EmpCode: string;
  PayPeriod: string;
  PayCode: string;
}

export interface LoanLedger {
  loan_ledger_id: number;
  loan_id: number;
  transaction_date: string; // API returns string (JSON)
  transaction_type: string;
  debit_amount: number;
  credit_amount: number;
  remarks?: string | null;
  payment_status?: string | null;
  payroll_cycle?: string | null;
  created_at: string;
  EmpCodeId: string;
}

export interface FetchLoanLedgerResponse {
  isPrevPaymentMissing: boolean;
  hasOverride:boolean;
  loan_id?: number;
  ledgers?: LoanLedger[];
  message?: string | null;
}


export interface overRideProps {
    loan_id: number;
    master_id: number;
    loan_type: "SSS_LOAN" | "PAGIBIG_LOAN";
    credit: number;
    payroll_cycle: string;
    payroll_period: string;
}


export type SubmitOverridePayload = overRideProps[];