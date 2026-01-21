

export type Column<T> = {
    header: string;
    accessor?: (row: T) => string | number;
    render?: (row: T) => React.ReactNode;
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

  export type PaginatedResponse<T> = {
    data: T[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
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
