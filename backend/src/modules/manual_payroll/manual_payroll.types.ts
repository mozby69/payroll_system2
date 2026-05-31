


export interface CreateManualPayrollPayload {
  selectedMonth: string;
  selectedRange: string;
  cycleCategory: string;
  payrollPeriod: string;
  fromDate: string;
  toDate: string;
  companyCode: string;
}


export interface ManualPayrollProps{
    page: number;
    limit: number;
    search?: string;
}
