export interface AllowanceProps {
    EmpCode: string;
    Firstname: string | null;
    Lastname: string | null;
    totalAbsentHours:string | null;
    total:string | null;
    cash_assistance: string | null;
    ecola: string | null;
    totalDeduction:string | null;
    loan: string | null;
    deduct:string | null;
    absent_hours?:number | null;
    BranchCode:{
      branchCode:string;
    };
}
  

export interface AllowanceMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
  


export interface AllowanceListResponse {
    data: AllowanceProps[];
    meta: AllowanceMeta;
}
  


export interface AllowanceSummary{
  allowance_name:string;
  total_cash_allowance:string;
  total_ecola:string,
  grand_total:string;
  totalDeduction:string;
  selectedMonth:string;
}

export interface AllowanceSummaryResponse{
  data: AllowanceSummary[];
    meta: AllowanceMeta;
}


export interface ArchiveAllowance {
  EmpCodeId: string;
  name: string;
  cash_allowance: number | null;
  ecola: number | null;
  totalDeduction: number | null;
  total: number | null;
  createdAt: string;
  branchCode: string;
  position: string | null;
  loan: number | null;
  deduct: number | null;
  branchPosition: number;
  company_id: string | null;
  emergency_allowance_amount: number | null;
  is_emergency: boolean | null;
}
export interface ArchiveAllowanceDetails {
  company_list: Record<string, unknown>;
  loans: unknown[];
  variance_allowance: unknown;
  variance_employee: unknown;
}

export interface ArchiveAllowanceResponse {
  data: {
    list: ArchiveAllowance[];
    details: ArchiveAllowanceDetails | null;
  };
}







export interface Company {
  CompanyCode: string;
  CompanyName: string;
  CompanyCycle: string | null;
}

export interface Branch {
  branchCode: string;
  Location: string | null;
  company_id: string | null;
}



export interface PrintAllowanceRow {
  EmpCodeId: string;
  name: string;
  cash_allowance: number | null;
  ecola: number | null;
  totalDeduction: number | null;
  total: number | null;
  deduct: number | null;
  loan:number | null;
}

export interface VarianceEmpItem {
  EmpCode: string;
  name: string;

  previous: {
    cash_assistance: number;
    ecola: number;
    total: number;
  };

  current: {
    cash_assistance: number;
    ecola: number;
    total: number;
  };

  variance: {
    cash_assistance: number;
    ecola: number;
    total: number;
    remarks: string | null;
    created_at: string | null;
    action: {
      type: "ADD" | "LESS";
      data: {
        remarks:string;
        create_at:string;
      };
    };
  };
}

export interface ViewAllItem {
  EmpCode: string;
  name: string;
  cash_allowance: number;
  computed_ecola: number;
  absent: number;
  total: number;
  selectedMonth: string;
  deduct: number;
  totalDeduction: number;
  branch_code: string;
  bod_member: string | null;
  position: string | null;
  cash_assitance_deduct:number;
  ecola_deduct:number;
  is_emergency:boolean;
  emergency_allowance_amount:number;
}
// export interface LoanItem{
//   EmpCode:string;
//   Firstname:string;
//   Lastname:string;
//   per_payroll_deduct?:number;
//   BranchCodeId:string;
// }

export interface CompanyData {
  total_cash_allowance: number;
  ecola: number;
  total_num: number;
  branches: Record<string, unknown>;
  is_emergency:boolean;
  emergency_allowance_amount:number;
}

export interface allowanceTotals{
    cash_allowance:number;
    computed_ecola:number;
    total:number;
}
export interface loanlistProps{
    Firstname:string;
    Lastname:string;
    per_payroll_deduct:number;
    loan_type:string;
    others_types:string;
}
export type TotalPerCompany = Record<string, CompanyData>;

export interface ViewAllResponse {
  BOARD_MEMBER: ViewAllItem[];
  MANCOM: ViewAllItem[];
  MH: ViewAllItem[];
  mh_totals: allowanceTotals;
  board_mancom_totals:allowanceTotals;
  total_mh_boardmancom: allowanceTotals;
  mh_mancom_loans:loanlistProps [];
  total_disburse:allowanceTotals;
  BRANCHES: Record<string, Record<string, ViewAllItem[]>>;

  LOANS: loanlistProps[];
  VARIANCE:VarianceAllowance;
  VARIANCE_EMP: VarianceEmpItem[];
  TOTAL_PER_COMPANY: TotalPerCompany;
  totalmhAndMancomLoans:number;
}


interface VarianceAllowanceField{
  selectedMonth:string;
  cash_assistance:number;
  ecola:number;
  grand_total:number;
}
interface VarianceAllowanceGrandTotal{
  cash_assistance:number;
  ecola:number;
  grand_total:number;
}

export interface VarianceAllowance{
  previous: VarianceAllowanceField;
  current: VarianceAllowanceField;
  variance: VarianceAllowanceGrandTotal;
}









// export type LoanItem = {
//     Firstname: string;
//     Lastname: string;
//     per_payroll_deduct: number;
//     BranchCodeId: string;
// };


export type CompanyItem = {
  total_cash_allowance: number;
  ecola: number;
  total_num: number;
  branches: unknown;
  emergency_allowance_amount: number;
};

export type VarianceAllowanceComplete = {
  previous: {
    selectedMonth: string;
    cash_assistance: number;
    ecola: number;
    grand_total: number;
  };
  current: {
    selectedMonth: string;
    cash_assistance: number;
    ecola: number;
    grand_total: number;
  };
  variance: {
    cash_assistance: number;
    ecola: number;
    grand_total: number;
  };
};

export type VarianceAllowanceEmployee = {
  name: string;
  variance: {
    cash_assistance: number;
    ecola: number;
    total: number;
    action: {
      type: "ADD" | "LESS";
    };
  };
};