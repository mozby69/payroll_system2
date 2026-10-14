import { Prisma } from "@prisma/client";
import { PayrollDateRange } from "../api/api.types";
import { BankFileRow, PayrollRow } from "./payroll_archive.types";
import ExcelJS from "exceljs";
import path from "path";
import { nowPH } from "../../utils/timezone";
import { Decimal } from "@prisma/client/runtime/library";


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





// export function generateBankTxt(rows: BankFileRow[]): string {
//   return rows
//     .map((row) => `${row.bankAccount}\t${row.amount.toFixed(2)}`)
//     .join("\n");
// }


export function generateBankTxt(
  rows: BankFileRow[]
): string {

  return rows
    .filter((row) => {

      const hasValidAmount =
        Number(row.amount) > 0;

      const hasValidBankAccount =
        row.bankAccount &&
        row.bankAccount.toString().trim() !== "" &&
        row.bankAccount.toString() !== "0";

      return hasValidAmount && hasValidBankAccount;

    })
    .map(
      (row) =>
        `${row.bankAccount}\t${row.amount.toFixed(2)}`
    )
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

   // FILTER INVALID ROWS
  const filteredRows = rows.filter((row) => {
    const hasValidAmount = Number(row.amount) > 0;

    const hasValidBankAccount =
      row.bankAccount &&
      row.bankAccount.toString().trim() !== "" &&
      row.bankAccount.toString() !== "0";

    return hasValidAmount && hasValidBankAccount;
  });


  let startRow = 2;

  filteredRows.forEach((row) => {
    worksheet.getCell(`B${startRow}`).value = row.bankAccount;
    worksheet.getCell(`C${startRow}`).value = row.amount;
    startRow++;
  });

  const date = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US').format(date);

  const total = filteredRows.reduce((sum, r) => sum + r.amount, 0);
  worksheet.getCell("L1").value = total;
  worksheet.getCell("N1").value = filteredRows.length;
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




export function toMoney(
  value:
    | string
    | number
    | Decimal
    | null
    | undefined
): number {
  const converted = Number(value ?? 0);

  if (!Number.isFinite(converted)) {
    return 0;
  }

  return Math.abs(converted) < 0.005
    ? 0
    : converted;
}




//number to words
const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

export function convertBelowOneThousand(
  value: number
): string {
  let number = Math.floor(value);
  const parts: string[] = [];

  if (number >= 100) {
    const hundreds = Math.floor(number / 100);

    parts.push(
      `${ones[hundreds]} Hundred`
    );

    number %= 100;
  }

  if (number >= 20) {
    const tensValue = Math.floor(number / 10);

    parts.push(tens[tensValue]);

    number %= 10;
  }

  if (number > 0) {
    parts.push(ones[number]);
  }

  return parts.join(" ");
}

function convertWholeNumberToWords(
  value: number
): string {
  if (value === 0) {
    return "Zero";
  }

  let number = Math.floor(value);
  const parts: string[] = [];

  const billions = Math.floor(
    number / 1_000_000_000
  );

  if (billions > 0) {
    parts.push(
      `${convertBelowOneThousand(
        billions
      )} Billion`
    );

    number %= 1_000_000_000;
  }

  const millions = Math.floor(
    number / 1_000_000
  );

  if (millions > 0) {
    parts.push(
      `${convertBelowOneThousand(
        millions
      )} Million`
    );

    number %= 1_000_000;
  }

  const thousands = Math.floor(
    number / 1_000
  );

  if (thousands > 0) {
    parts.push(
      `${convertBelowOneThousand(
        thousands
      )} Thousand`
    );

    number %= 1_000;
  }

  if (number > 0) {
    parts.push(
      convertBelowOneThousand(number)
    );
  }

  return parts.join(" ");
}

export function amountToWords(
  value: number
): string {
  const amount = Number.isFinite(value)
    ? Math.abs(value)
    : 0;

  const pesos = Math.floor(amount);

  const centavos = Math.round(
    (amount - pesos) * 100
  );

  const pesoText =
    pesos === 1
      ? "One Peso"
      : `${convertWholeNumberToWords(
          pesos
        )} Pesos`;

  if (centavos === 0) {
    return `${pesoText} Only`;
  }

  const centavoText =
    centavos === 1
      ? "One Centavo"
      : `${convertWholeNumberToWords(
          centavos
        )} Centavos`;

  return `${pesoText} and ${centavoText}`;
}





//xtetl 

type TextAlign =
  | "left"
  | "center"
  | "right";

type DrawTextOptions = {
  bold?: boolean;
  align?: TextAlign;
  fontSize?: number;
  lineGap?: number;
};

export function drawText(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  width: number,
  options?: DrawTextOptions
): void {
  doc
    .font(
      options?.bold
        ? "Helvetica-Bold"
        : "Helvetica"
    )
    .fontSize(options?.fontSize ?? 9)
    .fillColor("#000000")
    .text(text, x, y, {
      width,
      align: options?.align ?? "left",
      lineGap: options?.lineGap ?? 0,
    });
}

export function drawLine(
  doc: PDFKit.PDFDocument,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  lineWidth = 0.6
): void {
  doc
    .moveTo(x1, y1)
    .lineTo(x2, y2)
    .lineWidth(lineWidth)
    .strokeColor("#000000")
    .stroke();
}

export function drawBox(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  lineWidth = 0.7
): void {
  doc
    .rect(x, y, width, height)
    .lineWidth(lineWidth)
    .strokeColor("#000000")
    .stroke();
}

export function drawDottedLine(
  doc: PDFKit.PDFDocument,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): void {
  doc
    .save()
    .dash(1, {
      space: 1,
    })
    .moveTo(x1, y1)
    .lineTo(x2, y2)
    .lineWidth(0.7)
    .strokeColor("#000000")
    .stroke()
    .undash()
    .restore();
}




//send email bulk 

export async function processWithConcurrency<T>(
  items: T[],
  concurrency: number,
  handler: (
    item: T,
    index: number
  ) => Promise<void>
): Promise<void> {
  let currentIndex = 0;

  async function worker(): Promise<void> {
    while (true) {
      const index = currentIndex;

      if (index >= items.length) {
        return;
      }

      currentIndex += 1;

      await handler(items[index], index);
    }
  }

  const workerCount = Math.min(
    concurrency,
    items.length
  );

  await Promise.all(
    Array.from(
      { length: workerCount },
      () => worker()
    )
  );
}




//email helper batch send 

type MailTransportError = Error & {
  code?: string;
  responseCode?: number;
  response?: string;
};

export function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export function isTemporaryGmailError(
  error: unknown
): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const mailError =
    error as MailTransportError;

  return (
    mailError.responseCode === 454 ||
    mailError.response?.includes("454-4.7.0") === true ||
    mailError.message.includes("454-4.7.0") ||
    mailError.message.includes(
      "Too many login attempts"
    )
  );
}