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
  branchCode:string;
}



export interface ArchiveAllowanceResponse {
  data: ArchiveAllowance[];
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
  fch_rfc_deducted: number;
  cash_assitance_deduct:number;
  ecola_deduct:number;
}
export interface LoanItem{
  EmpCode:string;
  Firstname:string;
  Lastname:string;
  per_payroll_deduct:number;
  BranchCodeId:string;
}

export interface ViewAllResponse {
  BOARD_MEMBER: ViewAllItem[];
  MANCOM: ViewAllItem[];
  BRANCHES: Record<string, Record<string, ViewAllItem[]>>;
  LOANS: LoanItem[];
  VARIANCE:VarianceAllowance;
  VARIANCE_EMP: VarianceEmpItem[];
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