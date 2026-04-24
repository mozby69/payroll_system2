export interface EmployeeList{
    EmpCode: string;
    IdNo:string;
    Firstname:string;
    Middlename:string;
    Lastname:string;
    Suffix:string;
    DateofBirth:string;
    BirthPlace:string;
    Age:string;
    BloodType:string;
    Gender:string;
    CivilStatus:string;
    Address:string;
    HomeAddress:string;
    PhoneNo:string;
    Email:string;
    Position:string;
    Department:string;
    BranchCode: {
      branchCode: string;
    };
    EmploymentStatus: string;

    employeepayroll?: {
    basic_salary: number;
  } | null;
}




export interface EmployeeResponse {
  data: EmployeeList[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}


import { FilterKey } from "./FilterTypes";

export type EmployeeFilters = Partial<
  Record<FilterKey, string[]>
>;


export type EmpDetails = {
  Payrollid: number;
  EmpTin?: string | null;
  EmpSSSNo?: string | null;
  EmpPhilhlthNo?: string | null;
  EmpPagibigNo?: string | null;
  EmpChildrenName?: string | null;
  EmpChildrenBirthday?: string | null;
  EmpChildrenBplace?: string | null;
};

export type EmployeeLoan = {
  loan_id: number;
  principal: number;
  loan_type: string;
  term_value: number;
  term_unit: string;
  status: string;
  start_date: string;
  deduct_allowance: boolean;
  per_payroll_deduct: number;
};


export type EmpPayrollInfo = {
  BasicSalary: number;
  CashAssistance: number;
  Ecola: number;
  TotalSalary: number;
  sssContribEmployee: number;
  philhealthRateEmployee: number;
  pagibigEmployeeShare: number;
  totalEdeduction:number;
  bankAccount: string;
};

export type EmpOAInfo = {
  OaBasicSalary: number;
};


export type CompanyInfo = {
  CompanyName?: string | null;
  CompanyCycle?: string | null;
};

export type BranchInfo = {
  branchCode: string;
  Company?: string | null;
  Location?: string | null;
  CompanyCode?: {
    CompanyCode?: string | null;
    CompanyName?: string | null;
  } | null;
};

export type EmployeeProfile = {
  EmpCode: string;
  Firstname?: string | null;
  Middlename?: string | null;
  Lastname?: string | null;
  Position?: string | null;
  Department?: string | null;
  EmploymentStatus?: string | null;
  Address?: string | null;

  WithAtm: boolean;         
  Disbursing: boolean;
  Taxable:boolean;      
  BranchCode?: BranchInfo | null;
  isOfficerAllowance?:boolean;
  employeepr: EmpDetails[];
  employeepayroll: EmpPayrollInfo | null;
  officersAllowance: EmpOAInfo | null;
  loan_details: EmployeeLoan[];
};
export type UpdateEmployeePayrollPayload = {
  empCode: string;
  basicSalary: number;
  cashAssistance: number;
  ecola: number;
  pagibigEmployeeShare: number;
  WithAtm: boolean;
  Disbursing: boolean;
  Taxable:boolean;
  remarks?:string;
  isOfficerAllowance?:boolean;
  OaBasicSalary?:string;
  bankAccount?: string;
};

export type PayrollFormState = {
  basicSalary: string;
  cashAssistance: string;
  ecola: string;
  pagibigEmployeeShare: string;
  WithAtm: boolean;
  Disbursing: boolean;
  Taxable:boolean;
  isOfficerAllowance?:boolean;
  OaBasicSalary?: string;
  bankAccount?: string;
};


export type EmployeeIncreaseItem = {
  EmpCode: string;
  Firstname: string;
  Middlename: string;
  Lastname: string;
  BranchCode: {
    branchCode: string;
  };
  employeepayroll?: {
    basic_salary: number;
  } | null;
};

export type BulkIncreasePayload = {
  empCodes: string[];
  amount: number;
  reason: string;
};