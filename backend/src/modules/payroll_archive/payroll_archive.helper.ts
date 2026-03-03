import { Prisma } from "@prisma/client";
import { PayrollDateRange } from "../api/api.types";
import { BankFileRow, PayrollRow } from "./payroll_archive.types";
import ExcelJS from "exceljs";
import path from "path";


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

  // 🔥 1️⃣ Remove all existing data rows (keep header row only)
  const lastRow = worksheet.lastRow?.number ?? 1;

  if (lastRow > 1) {
    worksheet.spliceRows(2, lastRow - 1);
  }

  // 🔥 2️⃣ Start writing fresh at row 2
  let startRow = 2;

  rows.forEach((row) => {
    worksheet.getCell(`B${startRow}`).value = row.bankAccount;
    worksheet.getCell(`C${startRow}`).value = row.amount;
    startRow++;
  });

  // 🔥 3️⃣ Update totals
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  worksheet.getCell("K2").value = total;
  worksheet.getCell("M2").value = rows.length;

  return workbook.xlsx.writeBuffer();
}