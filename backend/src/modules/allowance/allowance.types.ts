

export interface allowanceprops{
    page: number;
    limit: number;
    search?: string;
    selectedMonth: string;
}




export interface SummaryAllowanceProps{
    page: number;
    limit: number;
    search?: string;
}


export interface AllowanceRow {
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
  }
  
 export interface GroupedAllowance {
    BOARD_MEMBER: AllowanceRow[];
    BRANCHES: Record<string, AllowanceRow[]>;
  }







export type EmployeeVariance = {
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
    };
  };
  


  