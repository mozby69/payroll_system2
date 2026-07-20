

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
  


  

export type ArchiveAllowanceDTO = {
  EmpCodeId: string;
  name: string;
  cash_allowance: number | null;
  ecola: number | null;
  absent_count: number | null;
  total: number | null;
  totalDeduction: number | null;
  deduct: number | null;
  loan: number | null;
  position: string | null;
  createdAt: Date;
  branchCode: string;
  branchPosition: number;
  company_id: string | null;
  emergency_allowance_amount: number | null;
  is_emergency: boolean | null;
};

export type BranchMeta = {
  branchCode: string;
  position: number;
  company_id: string | null;
};

export type ArchiveAllowanceFullResponse = {
  list: ArchiveAllowanceDTO[];
  details: {
    company_list: unknown;
    loans: unknown;
    variance_allowance: unknown;
    variance_employee: unknown;
  } | null;
};




export type AllowanceTotals = {
  cash_allowance: number;
  computed_ecola: number;
  deduct:number;
  total: number;
};

export type BranchAllowanceSummary = {
  employees: AllowanceRow[];
  loans: AllowanceLoan[];
  total_loans: number;
  totals: AllowanceTotals;
  disbursement: AllowanceTotals;
};

export type CompanyAllowanceSummary = {
  branches: Record<string, BranchAllowanceSummary>;
  grand_total: AllowanceTotals;
};

export type AllowanceLoan = {
  EmpCode: string;
  Firstname: string;
  Lastname: string;
  per_payroll_deduct: number;
  BranchCodeId: string | null;
  loan_type: string | null;
  others_types: string | null;
};

// type BranchAllowanceSummary = {
//   employees: AllowanceRow[];
//   loans: AllowanceLoan[];
//   total_loans: number;
//   totals: AllowanceTotals;
// };