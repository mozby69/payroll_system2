export interface EmployeeSummary {
    PayCode: string;
    TotalHoursWorked?: string | null;
    LateCount?: string | null;
    TotalAbsentHours?: string | null;
    TotalUndertime?: string | null;
    TotalOvertime?: string | null;
    RegularAtt?: unknown | null;
    OvertimeAtt?: unknown | null;
    NightShiftAtt?: unknown | null;
    NightShiftOtAtt?: unknown | null;
    EmpCodeId?: string;
  }
  
  export interface EmployeeSummaryPaginatedResponse {
    data: EmployeeSummary[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  

  export interface ApiErrorResponse {
    status?: "DUPLICATE" | "ERROR";
    message: string;
  }
  export interface ArchiveSuccessResponse {
    status: "SUCCESS";
    message: string;
  }


  export interface CompanyDetailsType {
    CompanyCode: string;
    CompanyCycle: string;
    CompanyName: string;
  }
  

 export type AuthUser = {
    id: number;
    username: string;
    role: string;
  };
  


  export type PayrollDateRange = {
    start_date: string;
    end_date: string;
  };


  export interface Company {
    CompanyCode: string;
    CompanyName: string | null;
    CompanyCycle: string | null;
  }
  
  export interface CompaniesResponse {
    success: boolean;
    data: Company[];
  }
  



  
export type FecthCompany = {
  CompanyCode: string;
  CompanyName: string;
};

export type LoanTypeResponse = string[];