

export type Column<T> = {
    header: string;
    accessor?: (row: T) => string | number;
    render?: (row: T) => React.ReactNode;
    footer?: React.ReactNode | (() => React.ReactNode);
  };
 

  export type PayrollSummary = {
    PayCode: string;
    EmpCodeId:string;
    TotalHoursWorked: string | null;
    LateCount: string | null;
    TotalAbsentHours: string | null;
    semi_monthly_rate:string | null;
    absence:string | null | number;
    late_count:string | null | number;
    overtime:string | null | number;
    gross_pay:number | string | null;
    philhealth_rate:number | null;
    emp_pagibig_contrib: number | null;
    sss_contribution:number | null;
  };


  export interface EmployeeRow {
    EmpCode: string;
    Firstname: string | null;
    Lastname: string | null;
    Department?: string | null;
    Position?: string | null;
    EmploymentStatus?: string | null;
    basic_salary: number;
    sss_contrib:number | string;
    phil_rate:number;
    pagibig_share:number | string;
    pagibig_employee_share: number;
    pagibig_employer_share: number;
    cash_assistance?:number;
    WithAtm:boolean;
    Disbursing:boolean;
    Taxable:boolean;
    
    // Loan Code ↓
    fch_loan: number;
    sss_loan: number;
    pagibig_loan: number;
    rfc_loan:number;
    are_loan:number;
    // Loan Code ↑
    
    pagibig_id:string; 
    next_payroll:string; 
    month_pay:string,
    BranchCode?: {
      branchCode: string;
      Location: string | null;
      CompanyCode: {
        CompanyName: string | null;
        CompanyCycle: string | null;
      } | null;
    } | null;
  }
  

  export type PaginatedResponse<T> = {
    data: T[];
    meta: {
      cycle?:string;
      company_id:string;
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      zeroSalaryCount:number;
    };
  };


  
export type PaySlipTypes = {
  employeeCode: string
  name: string
  payrollPeriod: string

  basicPay: number
  overTime: number
  late: number
  absence: number
  grossPay: number

  sss: number
  withTax: number
  pagIbig: number
  arE: number
  fchLoan: number
  philHealth: number
  pagIbigLoan: number
  sssSalaryLoan: number
  sssCalamityLoan: number
  housingLoan: number

  totalDeduction: number
  netPayable: number
}


export interface EmployeeSummaryTypes {
  employee: string;
  basicPay: number;
  overtime: number;
  late: number;
  absence: number;
  total: number;
  wTax: number;
  sss: number;
  philHealth: number;
  pagIbig: number;
  arE: number;
  fch: number;
  salary: number;
  calamity: number;
  pagSalaryLoan: number;
  netPayable: number;
  sssEmpShare: number;
  philEmpShare: number;
  pagEmpShare: number;
  
}


export interface PayrollResponse {
  status: "SUCCESS";
  data: PayrollEmployee[];
  availableCompany: AvailableCompany[];
}

export interface AvailableCompany {
  company_id: string;
  cycle: string;
}



export interface PayrollEmployee {
  PayCode: string;
  CycleCategory: string;
  PayrollPeriod: string;
  LateCount: number;
  TotalAbsentHours: string;
  TotalOvertime: string;
  TotalUndertime: number;
  RegularAtt: Record<string, string>;
  OvertimeAtt: Record<string, string>;
  NightShiftAtt: Record<string, string>;
  NightShiftOtAtt: Record<string, string>;
  EmpCodeId: string;
  EmpCode: {
    Firstname: string;
    Lastname: string;
    BranchCode:{
      company_id:string;
    }
  };
  semi_monthly:number;
  overtime:number;
  late_count:number;
  undertime:number;
  absence:number;
  gross_pay:number;
  sss_contrib_employee:number;
  sss_contrib_employer:number;
  pagibig_contrib_employee:number;
  pagibig_contrib_employer:number,
  philhealth_contrib_employee:number;
  philhealth_contrib_employer:number;
  net_pay:number;
  wtax:number;
  computedWtax:number;


  // Loan Code ↓
  rfc_loan:number;
  fch_loan:number;
  pagibig_loan:number;
  sss_loan:number;
  are_loan:number;
  // Loan Code ↑
}