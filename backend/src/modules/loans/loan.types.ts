  export interface loanProps{
    empCode: string;
    loan_type: "FCH_LOAN" | "SSS_LOAN" | "PAGIBIG_LOAN" | "RFC_LOAN" | "ARE_LOAN";
    principal: number;
    term_value: number;
    term_unit: "MONTHS" | "YEARS";
    start_date: Date;
    deduct_allowance:boolean;
    others_type:string;
  }

export interface updateLoanProps{
    loan_id: number;
    loan_type: "FCH_LOAN" | "SSS_LOAN" | "PAGIBIG_LOAN" | "RFC_LOAN" | "ARE_LOAN";
    principal: number;
    term_value: number;
    term_unit: "MONTHS" | "YEARS";
    start_date: Date;
    deduct_allowance:boolean;
  }




export const CYCLE_RULES = {
  "10-25-Cycle": { first: 10, second: 25, third: 30 },
  "15-30-Cycle": { first: 15, second: 25, third: 30 },
} as const;

export const DEFAULT_CYCLE_CATEGORY: CycleCategory = "10-25-Cycle";


export type CycleCategory = keyof typeof CYCLE_RULES;

export type PayrollCycle = `${number}`;

  

  
export const LOAN_ACTION_TYPES = [
  "SKIPPED",
  "EARLY_PAY",
] as const;

export type LoanActionType =
  typeof LOAN_ACTION_TYPES[number];


export type PayCyclePeriod = {
  EmpCode: string;
  payCycle: string;
  payPeriod: string;
} 

export type LoanResult = {
  FCH_LOAN: any | null;
  SSS_LOAN: any | null;
  PAGIBIG_LOAN: any | null;
  RFC_LOAN: any | null
};

export type UpdateLedgerDatePayload = {
  loan_id: number
  ledger_id: number
  transaction_date: Date
  remarks: string
}
