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
  