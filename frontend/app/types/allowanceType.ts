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
  


