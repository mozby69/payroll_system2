

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


  export interface EmployeeRow {
    EmpCode: string;
    Firstname: string | null;
    Lastname: string | null;
    Department?: string | null;
    Position?: string | null;
    EmploymentStatus?: string | null;
    basic_salary: number;
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
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };