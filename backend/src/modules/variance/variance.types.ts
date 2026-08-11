export type SaveVarianceOverrideParams = {
  EmpCode: string;
  PayCode: string;
  company_id: string;
  cycle: string;
  category: string;
};

export type PayrollCycle =
  | "10-25-Cycle"
  | "15-30-Cycle";

export type UserAccount =
  | "PAYROLL_CHECKER"
  | "FINANCIAL_CHECKER"
  | "FINANCE_APPROVER";




  export interface VarianceArchiveProps{
    page: number;
    limit: number;
    search?: string;
}
