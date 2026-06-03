export type TotalPayroll = {
    id: number
    PayCycle: string
    cycle_category: string
    payroll_period: string
    Total_GrossPay: string
    Total_NetPay: string
    createdAt: string
    Total_Late: string
    Total_Absent: string
    Total_OverTimePay: string
    Total_SSSContributionEmployee: string
    Total_SSSContributionEmployer: string
    Total_PagibigContributionEmployee: string
    Total_PagibigContributionEmployer: string
    Total_PhilhealthContributionEmployee: string
    Total_PhilhealthContributionEmployer: string
    total_wtax: string
    status?:string | null;
  }
  
  export type PaginatedResponse<T> = {
    data: T[]
    meta: {
      total: number
      page: number
      pageSize: number
      totalPages: number
    }
  }

  


  export type EmployeeArchivedType = {
    id: number
    PayCode: string
    Late: string
    Absent: string
    cycle_category: string
    payroll_period: string
    selected_payroll_date: string
    undertime: string
    Overtime: string
    Grosspay: string
    w_tax: string
    Netpay: string
    Basic_salary: string
    SSS_employee_share: string
    SSS_employer_share: string
    Pagibig_employee_share: string
    Pagibig_employer_share: string
    philhealth_employee_share: string
    philhealth_employer_share: string
    ar_e: string
    fch_loan: string
    rfc_loan: string
    pagibig_loan: string
    sss_loan: string
    sss_calamity_loan: string
    status: string
    created_at: string
    totalPayrollId: number
    total_deductions:number;
    EmpCodeId: string
    disburse_amount:number;
    
    EmpCode: {
      Firstname: string
      Middlename: string
      Lastname: string
      BranchCodeId: string
      isAlien: boolean
      employeepayroll:{
      gmail_account:string;
      
    }
      BranchCode: {
        CompanyCode:{
          CompanyName: string
        }
      }
      secondaryBranch: {
        CompanyCode:{
          CompanyName: string
        }
      }
    }
  }

 export type GetEmployeeArchivedParams = {
    page?: number
    pageSize?: number
    search?: string
    totalPayrollId: number,
    selectedCompany?: string,
    selectedBranch?: string
  }
  
  






//BANK TYPES
export interface BankProps {
  id:number;
  PayCode:string;
  cycle_category:"10-25-Cycle" | "15-30-Cycle";
  Netpay:number;
  BranchCodeId:string;
  EmpCodeId:string;
  EmpCode:{
    Firstname:string;
    Lastname:string;
    BranchCode:{
      company_id:string;
    }
    bank_account:string;
  }
  
}

export interface BankResponse {
  BDO: BankProps[];
  PNB: BankProps[];
}