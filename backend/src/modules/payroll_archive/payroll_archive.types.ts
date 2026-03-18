
// Loan Type Code ↓

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


//  Loan Type Code ↑




export interface EmployeeBankAccountsParams{
  PayCode:string;
  cycle_category: "10-25-Cycle" | "15-30-Cycle" | undefined;
  company_id:string;
}

export interface PayrollRow {
  PayCode: string;
  cycle_category: string | null;
  Netpay: number; // ✅ number, not string
  BranchCodeId:string | null;
  EmpCode: {
    Firstname: string | null;
    Lastname: string | null;
    BranchCode: {
      company_id: string | null;
    } | null;
  };
}


export interface BankFileRow {
  bankAccount: string;
  amount: number;
}
