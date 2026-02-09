export interface AllowanceProps {
    EmpCode: string;
    Firstname: string | null;
    Lastname: string | null;
    totalAbsentHours:string | null;
    total:string | null;
    cash_assistance: string | null;
    ecola: string | null;

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
  EmpCode: string;
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
