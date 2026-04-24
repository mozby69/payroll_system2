import { Prisma } from "@prisma/client";
import { PayrollDateRange } from "../api/api.types";
import { BankFileRow, PayrollRow } from "./payroll_archive.types";
import ExcelJS from "exceljs";
import path from "path";
import { nowPH } from "../../utils/timezone";


export function isPayrollDateRange(value: Prisma.JsonValue): value is PayrollDateRange {
    return (
      typeof value === "object" &&
      value !== null &&
      "start_date" in value &&
      "end_date" in value
    );
  }
  



 export function formatMMDDYY(date: Date) {
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
  
    return `${mm}${dd}${yy}`;
  }

  
export function groupByCompany(data: PayrollRow[]) {
      const grouped: Record<string, PayrollRow[]> = {
        BDO: [],
        PNB: [],
      };
    
      for (const row of data) {
        const companyId =
          row.EmpCode?.BranchCode?.company_id ?? "UNKNOWN";
    
        const bank = companyId === "EMB" ? "BDO" : "PNB";
    
        grouped[bank].push(row);
      }
    
      return grouped;
    }





export function generateBankTxt(rows: BankFileRow[]): string {
  return rows
    .map((row) => `${row.bankAccount}\t${row.amount.toFixed(2)}`)
    .join("\n");
}


export async function generatePNBExcel(rows: BankFileRow[]) {
  const templatePath = path.join(
    process.cwd(),
    "templates",
    "PNB_FILE2.xlsx"
  );

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);

  const worksheet = workbook.worksheets[0];

 
  const lastRow = worksheet.lastRow?.number ?? 1;

  if (lastRow > 1) {
    worksheet.spliceRows(2, lastRow - 1);
  }

  let startRow = 2;

  rows.forEach((row) => {
    worksheet.getCell(`B${startRow}`).value = row.bankAccount;
    worksheet.getCell(`C${startRow}`).value = row.amount;
    startRow++;
  });

  const date = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US').format(date);

  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  worksheet.getCell("L1").value = total;
  worksheet.getCell("N1").value = rows.length;
  worksheet.getCell("H1").value = formattedDate;
  const manilaNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" })
  );
  
  const minutes = manilaNow.getMinutes();
  const flooredMinutes = Math.floor(minutes / 30) * 30;
  
  manilaNow.setMinutes(flooredMinutes);
  manilaNow.setSeconds(0);
  manilaNow.setMilliseconds(0);
  
  worksheet.getCell("J1").value = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(manilaNow);

  return workbook.xlsx.writeBuffer();
}











//is probi
type PaycodeRange = {
  start: Date;
  end: Date;
};

export function parsePaycode(paycode: string): PaycodeRange | null {
  const parts = paycode.split("-");
  if (parts.length !== 4) return null;

  const [monthStr, startDayStr, endDayStr, yearStr] = parts;
  const monthIndex = new Date(`${monthStr} 1, ${yearStr}`).getMonth();
  const year = Number(yearStr);
  const startDay = Number(startDayStr);
  const endDay = Number(endDayStr);

  if (isNaN(monthIndex) || isNaN(year) || isNaN(startDay) || isNaN(endDay)) {
    return null;
  }

  return {
    start: new Date(year, monthIndex, startDay),
    end: new Date(year, monthIndex, endDay),
  };
}

export  function isEmploymentWithinPaycode(employmentDate: Date | null,paycode: string | null): boolean {
  if (!employmentDate || !paycode) return false;

  const range = parsePaycode(paycode);
  if (!range) return false;

  return employmentDate >= range.start && employmentDate <= range.end;
}

