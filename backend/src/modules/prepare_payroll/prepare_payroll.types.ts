import { Decimal } from "@prisma/client/runtime/library";

export type PaginationParams = {
    page:number;
    limit:number;
    search?: string;
    payCode?:string;
  }
  

export type SSSRange = {
    start_range: Decimal | null;
    end_range: Decimal | null;
    employee_share: Decimal | null;
    employer_share: Decimal | null;
  };

export type TaxField = {
  start_range: number | null;
  end_range:number | null;
  annual_base_tax_bracket: Decimal | null;
  rate_per_bracket: Decimal | null;
  annual_base_tax_per_year: Decimal | null;
}
  



export type PayrollDeductions = {
  EmpCodeId: string;
  EmpCode: {
    Firstname: string | null;
    Lastname: string | null;
  };
  sss_contrib_employee:number;
  philhealth_contrib_employee:number;
  pagibig_contrib_employee:number;
  wtax:number;
  fch_loan:number;
  sss_loan:number;
  pagibig_loan:number;
  rfc_loan:number;
  are_loan:number;
  total_deductions:number;

};





// Loan Code Types ↓


export interface FetchEmployeesByCycleParams {
    cycle: "10-25-Cycle" | "15-30-Cycle";
  }
  

export const PAYROLL_CYCLE_MAP: Record<string, string> = {
  "10-pay-cycle": "25-pay-cycle",
  "25-pay-cycle": "10-pay-cycle",
  "15-pay-cycle": "30-pay-cycle",
  "30-pay-cycle": "15-pay-cycle",
};


const MONTH_INDEX: Record<string, number> = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

// Dont Delete or Remove ths Backup code ↓

  // export function convertPayrollLabelToPeriod(
  //   payrollLabel: string
  // ): string {
  
  //   const [monthName, startDay, endDay, yearStr] =
  //     payrollLabel.split("-");

  //   const monthIndex = MONTH_INDEX[monthName];
  //   if (monthIndex === undefined) {
  //     throw new Error(`Invalid month name: ${monthName}`);
  //   }

  //   const year = Number(yearStr);
  //   const end = Number(endDay);

  //   if (Number.isNaN(year) || Number.isNaN(end)) {
  //     throw new Error(`Invalid payroll label: ${payrollLabel}`);
  //   }


  //   let date = new Date(year, monthIndex, 1);

  
  //   if (end >= 28) {
  //     date.setMonth(date.getMonth() + 1);
  //   }

  //   const resultYear = date.getFullYear();
  //   const resultMonth = String(date.getMonth() + 1).padStart(2, "0");

  //   return `${resultYear}-${resultMonth}`;
  // }

// Dont Delete or Remove ths Backup code ↑


export function convertPayrollLabelToPeriod(
  payrollLabel: string
): string {
  const [monthName, , , yearStr] = payrollLabel.split("-");

  const monthIndex = MONTH_INDEX[monthName];
  if (monthIndex === undefined) {
    throw new Error(`Invalid month name: ${monthName}`);
  }

  const year = Number(yearStr);
  if (Number.isNaN(year)) {
    throw new Error(`Invalid year in payroll label: ${payrollLabel}`);
  }

  const resultMonth = String(monthIndex + 1).padStart(2, "0");
  return `${year}-${resultMonth}`;
}



export function getCurrentPayrollLabel(): string {
  const now = new Date();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const monthName = monthNames[now.getMonth()];
  const year = now.getFullYear();

  return `${monthName}-1-15-${year}`;
}







export type UpdateDeductionPayload = {
  PayCode: string;
  EmpCodeId: string;
  PayrollPeriod: string;
  LateCount: number;
  TotalAbsentHours: number;
  TotalUndertime: number;
  TotalOvertime:number;
  gross_pay_edit:number;
  gross_edited:boolean;
  philhealth_employee:number;
  philhealth_employer:number;
  final_wtax:number;
  basic_salary:number;
};