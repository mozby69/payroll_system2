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

export interface ViewAllResponse {
  BOARD_MEMBER: ViewAllItem[];
  MANCOM: ViewAllItem[];
  BRANCHES: Record<string, ViewAllItem[]>;
}