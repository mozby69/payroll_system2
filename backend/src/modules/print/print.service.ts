import { writeFileSync, unlinkSync } from "fs"
import { exec } from "child_process"
import path from "path"
import { Decimal } from "@prisma/client/runtime/library"
import { getBrowser } from "../../utils/pdfBrowser"
import PDFDocument from "pdfkit";
import { amountToWords, drawDottedLine, drawText } from "../payroll_archive/payroll_archive.helper"
import { formatPayrollPeriod } from "../prepare_payroll/prepare_payroll.helper"


function padRight(text: any, width: number) {
  return String(text ?? "").padEnd(width, " ").substring(0, width)
}

function padLeft(text: any, width: number) {
  return String(text ?? "").padStart(width, " ").substring(0, width)
}

function format(num: number) {
  return Number(num || 0).toFixed(2)
}

function generatePayrollRaw(rows: any[]) {

  let output = ""

  output += "\x1B\x40"     // Initialize
  output += "\x1B\x50"     // 10 CPI
  output += "\x1B\x6C\x00" // Left margin 0

  const pageWidth = 132
  const linesPerPage = 55
  let lineCount = 0

  function printHeader() {
    output += padRight("PAYROLL REPORT", pageWidth) + "\n\n"
    lineCount += 2

    output +=
      padRight("No",4) +
      padRight("Employee Name",25) +
      padLeft("Basic",10) +
      padLeft("OT",8) +
      padLeft("Late",8) +
      padLeft("UT",8) +
      padLeft("Abs",8) +
      padLeft("Gross",10) +
      padLeft("WTax",8) +
      padLeft("SSS",8) +
      padLeft("PhilH",8) +
      padLeft("PagI",8) +
      padLeft("AR/E",8) +
      padLeft("SalLn",8) +
      padLeft("Net",10) +
      padLeft("SSS ER",8) +
      padLeft("Phil ER",8) +
      padLeft("PagI ER",8) +
      "\n"

    output += "-".repeat(pageWidth) + "\n"
    lineCount += 2
  }

  printHeader()

  rows.forEach((row, i) => {

    if (lineCount >= linesPerPage) {
      output += "\f"
      lineCount = 0
      printHeader()
    }

    output +=
      padRight(i + 1,4) +
      padRight(row.name,25) +
      padLeft(format(row.basicPay),10) +
      padLeft(format(row.overtime),8) +
      padLeft(format(row.late),8) +
      padLeft(format(row.undertime),8) +
      padLeft(format(row.absence),8) +
      padLeft(format(row.gross),10) +
      padLeft(format(row.wtax),8) +
      padLeft(format(row.sss),8) +
      padLeft(format(row.philhealth),8) +
      padLeft(format(row.pagibig),8) +
      padLeft(format(row.arE),8) +
      padLeft(format(row.salaryLoan),8) +
      padLeft(format(row.netPayable),10) +
      padLeft(format(row.sssEmployer),8) +
      padLeft(format(row.philEmployer),8) +
      padLeft(format(row.pagibigEmployer),8) +
      "\n"

    lineCount++
  })

  output += "\f"
  return output
}

export function printPayroll(rows: any[]) {

  const raw = generatePayrollRaw(rows)

  const tempPath = path.join(__dirname, "payroll_print.txt")

  writeFileSync(tempPath, raw, { encoding: "ascii" })

  const printerName = "EPSON FX-2175II"

  exec(`print /D:"${printerName}" "${tempPath}"`, (error) => {
    unlinkSync(tempPath)

    if (error) {
      console.error("Print error:", error)
    } else {
      console.log("Payroll printed successfully")
    }
  })
}








//xyryl




export type AllowancePdfData = {
  EmpCodeId: string;
  name: string;
  month: string;
  company: string;
  branch: string | null;
  location: string | null;

  cash_allowance: number;
  ecola: number;
  deduct: number;
  loan: number;
  totalDeduction: number;
  total: number;
};




function formatAmount(value: number): string {
  const amount = Number.isFinite(value) ? value : 0;

  // Convert -0 to 0
  const normalized =
    Object.is(amount, -0) ? 0 : amount;

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(normalized);
}

function drawLabelValue(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string,
  y: number,
  options?: {
    labelBold?: boolean;
    valueBold?: boolean;
  }
): void {
  const {
    labelBold = false,
    valueBold = false,
  } = options ?? {};

  doc
    .font(
      labelBold
        ? "Helvetica-Bold"
        : "Helvetica"
    )
    .fontSize(10)
    .fillColor("#000000")
    .text(label, 70, y, {
      width: 250,
      align: "left",
    });

  doc
    .font(
      valueBold
        ? "Helvetica-Bold"
        : "Helvetica"
    )
    .fontSize(10)
    .text(value, 350, y, {
      width: 170,
      align: "right",
    });
}

function renderAllowanceTemplate(
  doc: PDFKit.PDFDocument,
  employee: AllowancePdfData
): void {
  const boxX = 50;
  const boxY = 40;
  const boxWidth = 495;
  const boxHeight = 335;

  // Outer border
  doc
    .rect(
      boxX,
      boxY,
      boxWidth,
      boxHeight
    )
    .lineWidth(0.8)
    .strokeColor("#000000")
    .stroke();

  // Employee name
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#000000")
    .text("EMPLOYEE NAME:", 70, 58, {
      width: 180,
    });

  doc
    .font("Helvetica")
    .fontSize(10)
    .text(
      employee.name.toUpperCase(),
      280,
      58,
      {
        width: 240,
        align: "right",
      }
    );

  // Period heading
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(
      "RECEIVE THE FOLLOWING\nFOR THE PERIOD COVERED",
      70,
      98,
      {
        width: 230,
        lineGap: 2,
      }
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(
      employee.month.toUpperCase(),
      350,
      104,
      {
        width: 170,
        align: "right",
      }
    );

  let currentY = 147;

  drawLabelValue(
    doc,
    "CASH ASSISTANCE",
    formatAmount(employee.cash_allowance),
    currentY,
    {
      labelBold: true,
    }
  );

  currentY += 33;

  drawLabelValue(
    doc,
    "ECOLA",
    formatAmount(employee.ecola),
    currentY,
    {
      labelBold: true,
    }
  );

  currentY += 33;

  drawLabelValue(
    doc,
    "ABSENCES",
    formatAmount(employee.deduct),
    currentY,
    {
      labelBold: true,
    }
  );

  currentY += 33;

  drawLabelValue(
    doc,
    "LOANS",
    formatAmount(employee.loan),
    currentY,
    {
      labelBold: true,
    }
  );

  currentY += 33;

  drawLabelValue(
    doc,
    "TOTAL",
    formatAmount(employee.total),
    currentY,
    {
      labelBold: true,
      valueBold: true,
    }
  );

  currentY += 36;

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("RECEIVED BY", 70, currentY);

  doc
    .moveTo(300, currentY + 9)
    .lineTo(520, currentY + 9)
    .lineWidth(0.6)
    .strokeColor("#000000")
    .stroke();

  currentY += 34;

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("DATE", 70, currentY);

  doc
    .moveTo(300, currentY + 9)
    .lineTo(520, currentY + 9)
    .lineWidth(0.6)
    .strokeColor("#000000")
    .stroke();
}

export function generateAllowancePDF(
  employee: AllowancePdfData
): Promise<Buffer> {
  return new Promise<Buffer>(
    (resolve, reject) => {
      const document = new PDFDocument({
        size: "A4",
        layout: "portrait",
        margin: 50,
        info: {
          Title:
            `Allowance Payslip - ${employee.EmpCodeId}`,
          Author: "Payroll System",
          Subject:
            `Allowance for ${employee.month}`,
        },
      });

      const chunks: Buffer[] = [];

      document.on(
        "data",
        (chunk: Buffer | Uint8Array) => {
          chunks.push(Buffer.from(chunk));
        }
      );

      document.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      document.on(
        "error",
        (error: Error) => {
          reject(error);
        }
      );

      try {
        renderAllowanceTemplate(
          document,
          employee
        );

        document.end();
      } catch (error: unknown) {
        document.end();

        reject(
          error instanceof Error
            ? error
            : new Error(
                "Failed to generate allowance PDF"
              )
        );
      }
    }
  );
}




















//PAYSLIT PDF 
type MoneyValue =
  | string
  | number
  | null
  | undefined;

export type PayslipPdfData = {
  EmpCodeId: string;
  employeeName: string;
  companyName: string;

  payCode: string;
  payrollPeriod: string;
  selectedPayrollDate: string;

  basicSalary: number;
  overtime: number;
  late: number;
  undertime: number;
  absence: number;
  grossPay: number;

  sssEmployee: number;
  withholdingTax: number;
  pagibigEmployee: number;
  philhealthEmployee: number;
  arE: number;

  fchLoan: number;
  rfcLoan: number;
  pagibigLoan: number;
  sssLoan: number;
  calamityLoan: number;
  pagibig_calamity_loan:number;

  totalDeductions: number;
  netPay: number;

 
};

function toMoney(
  value: MoneyValue
): number {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.abs(amount) < 0.005
    ? 0
    : amount;
}

function formatMoney(value: MoneyValue): string {
  const amount = toMoney(value);

  return new Intl.NumberFormat(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(amount);
}

function drawCell(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  width: number,
  options?: {
    bold?: boolean;
    align?: "left" | "center" | "right";
    fontSize?: number;
  }
): void {
  doc
    .font(
      options?.bold
        ? "Helvetica-Bold"
        : "Helvetica"
    )
    .fontSize(options?.fontSize ?? 8)
    .fillColor("#000000")
    .text(text, x, y, {
      width,
      align: options?.align ?? "left",
      lineBreak: false,
    });
}

function drawLine(
  doc: PDFKit.PDFDocument,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): void {
  doc
    .moveTo(x1, y1)
    .lineTo(x2, y2)
    .lineWidth(0.5)
    .strokeColor("#000000")
    .stroke();
}

function drawBox(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  doc
    .rect(x, y, width, height)
    .lineWidth(0.6)
    .strokeColor("#000000")
    .stroke();
}

function renderPayslipTemplate(
  doc: PDFKit.PDFDocument,
  employee: PayslipPdfData
): void {
  const pageWidth = 595.28;

  const marginX = 12;
  const topY = 10;

  const receiptWidth = 175;
  const gap = 7;

  const leftWidth =
    pageWidth -
    marginX * 2 -
    receiptWidth -
    gap;

  const leftX = marginX;

  const receiptX =
    leftX + leftWidth + gap;

  const payslipHeight = 209;


  const companyName =
    employee.companyName.trim().toUpperCase();

  const employeeName =
    employee.employeeName.trim();

  const netPayInWords =
    amountToWords(employee.netPay);

  // ===================================================
  // LEFT PAYSLIP BORDER
  // ===================================================

  drawBox(
    doc,
    leftX,
    topY,
    leftWidth,
    payslipHeight
  );

  // Company name
  drawText(
    doc,
    companyName,
    leftX,
    topY + 3,
    leftWidth,
    {
      align: "center",
      fontSize: 8,
    }
  );

  drawText(
    doc,
    "**PAYSLIP**",
    leftX,
    topY + 14,
    leftWidth,
    {
      align: "center",
      bold: true,
      fontSize: 8,
    }
  );

  // Employee row
  drawText(
    doc,
    `Employee Code: ${employee.EmpCodeId}`,
    leftX + 5,
    topY + 30,
    125,
    {
      fontSize: 7.5,
    }
  );

  drawText(
    doc,
    `Name: ${employeeName}`,
    leftX + 135,
    topY + 30,
    leftWidth - 140,
    {
      fontSize: 7.5,
    }
  );

  // Payroll period
  drawText(
    doc,
    `Payroll Period: ${formatPayrollPeriod(employee.payCode)}`,
    leftX + 5,
    topY + 44,
    leftWidth - 10,
    {
      fontSize: 7.5,
    }
  );

  drawLine(
    doc,
    leftX,
    topY + 58,
    leftX + leftWidth,
    topY + 58
  );

  // Basic and overtime
  drawText(
    doc,
    `Basic Pay : ${formatMoney(
      employee.basicSalary
    )}`,
    leftX + 6,
    topY + 64,
    leftWidth / 2 - 10,
    {
      fontSize: 8,
    }
  );

  drawLine(
    doc,
    leftX + leftWidth / 2,
    topY + 58,
    leftX + leftWidth / 2,
    topY + 78
  );

  drawText(
    doc,
    `Overtime : ${formatMoney(
      employee.overtime
    )}`,
    leftX + leftWidth / 2 + 6,
    topY + 64,
    leftWidth / 2 - 12,
    {
      fontSize: 8,
    }
  );

  drawLine(
    doc,
    leftX,
    topY + 78,
    leftX + leftWidth,
    topY + 78
  );

  // Late / undertime / absence / gross
  const detailsWidth =
    leftWidth / 4;

  drawText(
    doc,
    `(Less) Late : ${formatMoney(
      employee.late
    )}`,
    leftX + 3,
    topY + 84,
    detailsWidth,
    {
      align: "center",
      fontSize: 7.5,
    }
  );

  drawText(
    doc,
    `Undertime : ${formatMoney(
      employee.undertime
    )}`,
    leftX + detailsWidth,
    topY + 84,
    detailsWidth,
    {
      align: "center",
      fontSize: 7.5,
    }
  );

  drawText(
    doc,
    `Absence : ${formatMoney(
      employee.absence
    )}`,
    leftX + detailsWidth * 2,
    topY + 84,
    detailsWidth,
    {
      align: "center",
      fontSize: 7.5,
    }
  );

  drawLine(
    doc,
    leftX + detailsWidth * 3,
    topY + 78,
    leftX + detailsWidth * 3,
    topY + 101
  );

  drawText(
    doc,
    `Gross Pay : ${formatMoney(
      employee.grossPay
    )}`,
    leftX + detailsWidth * 3,
    topY + 84,
    detailsWidth,
    {
      align: "center",
      fontSize: 7.5,
    }
  );

  drawLine(
    doc,
    leftX,
    topY + 101,
    leftX + leftWidth,
    topY + 101
  );

  // Deductions header
  drawText(
    doc,
    "D E D U C T I O N S",
    leftX,
    topY + 108,
    leftWidth,
    {
      align: "center",
      fontSize: 8,
    }
  );

  drawLine(
    doc,
    leftX,
    topY + 123,
    leftX + leftWidth,
    topY + 123
  );

  const deductionColumn =
    leftWidth / 4;

  // First deduction row
  drawText(
    doc,
    "SSS Cont :",
    leftX + 5,
    topY + 130,
    50,
    {
      fontSize: 7.5,
    }
  );

  drawText(
    doc,
    formatMoney(employee.sssEmployee),
    leftX + 50,
    topY + 130,
    deductionColumn - 55,
    {
      align: "right",
      fontSize: 7.5,

    }
  );
//tax
  drawLine(
    doc,
    leftX + deductionColumn,
    topY + 123,
    leftX + deductionColumn,
    topY + 145
  );

  drawText(
    doc,
    "W/Tax :",
    leftX + deductionColumn + 5,
    topY + 130,
    50,
    {
      fontSize: 7.5,
    }
  );

  drawText(
    doc,
    formatMoney(
      employee.withholdingTax
    ),
    leftX + deductionColumn + 50,
    topY + 130,
    deductionColumn - 55,
    {
      align: "right",
      fontSize: 7.5,
    }
  );

  drawLine(
    doc,
    leftX + deductionColumn * 2,
    topY + 123,
    leftX + deductionColumn * 2,
    topY + 145
  );

  //pagibig
drawText(
  doc,
  "PAG-IBIG :",
  leftX + deductionColumn * 2 + 5,
  topY + 130,
  45,
  {
    fontSize: 7.5,
  }
);

drawText(
  doc,
  formatMoney(employee.pagibigEmployee),
  leftX + deductionColumn * 2 + 48,
  topY + 130,
  deductionColumn - 53,
  {
    align: "right",
    fontSize: 7.5,
  }
);

  drawLine(
    doc,
    leftX + deductionColumn * 3,
    topY + 123,
    leftX + deductionColumn * 3,
    topY + 145
  );

  drawText(
    doc,
    "AR/E:",
    leftX + deductionColumn * 3 + 5,
    topY + 130,
    45,
    {
      fontSize: 7.5,
    }
  );

  drawText(
    doc,
    formatMoney(employee.arE),
    leftX + deductionColumn * 3 + 45,
    topY + 130,
    deductionColumn - 50,
    {
      align: "right",
      fontSize: 7.5,
    }
  );

  drawLine(
    doc,
    leftX,
    topY + 145,
    leftX + leftWidth,
    topY + 145
  );

  // Second deduction row
  drawText(
    doc,
    "FCH Ln:",
    leftX + 5,
    topY + 151,
    43,
    {
      fontSize: 7.5,
    }
  );

  drawText(
    doc,
    formatMoney(employee.fchLoan),
    leftX + 55,
    topY + 151,
    deductionColumn - 58,
    {
      align: "right",
      fontSize: 7.5,
    }
  );

  drawLine(
    doc,
    leftX + deductionColumn,
    topY + 145,
    leftX + deductionColumn,
    topY + 167
  );

  drawText(
    doc,
    "Phil. Hlt :",
    leftX + deductionColumn + 5,
    topY + 151,
    45,
    {
      fontSize: 7.5,
    }
  );

  drawText(
    doc,
    formatMoney(
      employee.philhealthEmployee
    ),
    leftX + deductionColumn + 48,
    topY + 151,
    deductionColumn - 53,
    {
      align: "right",
      fontSize: 7.5,
    }
  );

  drawLine(
    doc,
    leftX + deductionColumn * 2,
    topY + 145,
    leftX + deductionColumn * 2,
    topY + 167
  );


  //p sal n
  drawText(
    doc,
    "P. Sal. Ln :",
    leftX + deductionColumn * 2 + 5,
    topY + 151,
    45,
    {
      fontSize: 7.5,
    }
  );

  drawText(
    doc,
    formatMoney(employee.pagibigLoan),
    leftX + deductionColumn * 2 + 48,
    topY + 151,
    deductionColumn - 53,
    {
      align: "right",
      fontSize: 7.5,
    }
  );

  drawLine(
    doc,
    leftX + deductionColumn * 3,
    topY + 145,
    leftX + deductionColumn * 3,
    topY + 167
  );

  drawText(
    doc,
    "OTHER LOANS",
    leftX + deductionColumn * 3,
    topY + 151,
    deductionColumn,
    {
      align: "center",
      fontSize: 7.5,
    }
  );

const loanHeaderY = topY + 167;
const loanTextY = loanHeaderY - 4;

const sssTitleWidth = 30;
const loanTitleWidth = 36;

const sssTitleX =
  leftX +
  deductionColumn / 2 -
  sssTitleWidth / 2;

const loanTitleX =
  leftX +
  deductionColumn * 1.5 -
  loanTitleWidth / 2;

// First line segment
drawLine(
  doc,
  leftX,
  loanHeaderY,
  sssTitleX - 5,
  loanHeaderY
);

// Between SSS and LOAN
drawLine(
  doc,
  sssTitleX + sssTitleWidth + 5,
  loanHeaderY,
  loanTitleX - 5,
  loanHeaderY
);

// After LOAN
drawLine(
  doc,
  loanTitleX + loanTitleWidth + 5,
  loanHeaderY,
  leftX + leftWidth,
  loanHeaderY
);

// SSS label
drawText(
  doc,
  "SSS",
  sssTitleX,
  loanTextY,
  sssTitleWidth,
  {
    align: "center",
    fontSize: 7,
  }
);

// LOAN label
drawText(
  doc,
  "LOAN",
  loanTitleX,
  loanTextY,
  loanTitleWidth,
  {
    align: "center",
    fontSize: 7,
  }
);

  // Third deduction row
  drawText(
    doc,
    "Salary :",
    leftX + 5,
    topY + 174,
    44,
    {
      fontSize: 7.5,
    }
  );

  drawText(
    doc,
    formatMoney(employee.sssLoan),
    leftX + 55,
    topY + 174,
    deductionColumn - 57,
    {
      align: "right",
      fontSize: 7.5,
    }
  );

  drawText(
    doc,
    "Calamity :",
    leftX + deductionColumn + 5,
    topY + 174,
    55,
    {
      fontSize: 7.5,
    }
  );

  drawText(
    doc,
    formatMoney( employee.calamityLoan + employee.pagibig_calamity_loan),
    leftX + deductionColumn + 48,
    topY + 174,
    deductionColumn - 53,
    {
      align: "right",
      fontSize: 7.5,
    }
  );

drawText(
  doc,
  "Housing :",
  leftX + deductionColumn * 2 + 5,
  topY + 174,
  45,
  {
    fontSize: 7.5,
  }
);

drawText(
  doc,
  formatMoney(employee.rfcLoan),
  leftX + deductionColumn * 2 + 48,
  topY + 174,
  deductionColumn - 53,
  {
    align: "right",
    fontSize: 7.5,
  }
);


  const totalsTopY = topY + 187;
const totalsRowHeight = 24;

const totalsTextY =
  totalsTopY + (totalsRowHeight - 7.5) / 2;

  drawLine(
  doc,
  leftX,
  totalsTopY,
  leftX + leftWidth,
  totalsTopY
);

drawText(
  doc,
  "TOTAL DEDUCTIONS :",
  leftX + 5,
  totalsTextY,
  115,
  {
    fontSize: 7.5,
  }
);

drawText(
  doc,
  formatMoney(employee.totalDeductions),
  leftX + 60,
  totalsTextY,
  70,
  {
    align: "right",
    fontSize: 7.5,
  }
);

drawText(
  doc,
  "NET PAYABLE :",
  leftX + leftWidth - 200,
  totalsTextY,
  100,
  {
    fontSize: 7.5,
  }
);

drawText(
  doc,
  formatMoney(employee.netPay),
  leftX + leftWidth - 100,
  totalsTextY,
  95,
  {
    align: "right",
    fontSize: 7.5,
  }
);

drawLine(
  doc,
  leftX,
  totalsTopY + totalsRowHeight,
  leftX + leftWidth,
  totalsTopY + totalsRowHeight
);

  // Bottom dotted cut line
  drawDottedLine(
    doc,
    leftX,
    topY + payslipHeight + 3,
    leftX + leftWidth,
    topY + payslipHeight + 3
  );

  // ===================================================
  // RIGHT RECEIPT
  // ===================================================

  drawBox(
    doc,
    receiptX,
    topY,
    receiptWidth,
    payslipHeight,
  );

  drawText(
    doc,
    companyName,
    receiptX + 4,
    topY + 5,
    receiptWidth - 8,
    {
      align: "center",
      fontSize: 7.5,
    }
  );

  drawText(
    doc,
    "Payroll Period",
    receiptX + 6,
    topY + 21,
    65,
    {
      fontSize: 7,
    }
  );

  drawText(
    doc,
    `:   ${employee.payCode}`,
    receiptX + 72,
    topY + 21,
    receiptWidth - 78,
    {
      fontSize: 7,
    }
  );

  drawText(
    doc,
    "Code",
    receiptX + 6,
    topY + 35,
    65,
    {
      fontSize: 7,
    }
  );

  drawText(
    doc,
    `:   ${employee.EmpCodeId}`,
    receiptX + 72,
    topY + 35,
    receiptWidth - 78,
    {
      fontSize: 7,
    }
  );

  drawText(
    doc,
    "Name",
    receiptX + 6,
    topY + 49,
    65,
    {
      fontSize: 7,
    }
  );

  drawText(
    doc,
    `:   ${employeeName}`,
    receiptX + 72,
    topY + 49,
    receiptWidth - 78,
    {
      fontSize: 7,
    }
  );

  drawText(
    doc,
    "NET PAY",
    receiptX + 6,
    topY + 63,
    65,
    {
      fontSize: 7,
    }
  );

  drawText(
    doc,
    `:   ${formatMoney(
      employee.netPay
    )}`,
    receiptX + 72,
    topY + 63,
    receiptWidth - 78,
    {
      fontSize: 7,
    }
  );

  drawText(
    doc,
    "Received the amount of:",
    receiptX + 6,
    topY + 78,
    receiptWidth - 12,
    {
      fontSize: 7,
    }
  );

  drawText(
    doc,
    netPayInWords,
    receiptX + 8,
    topY + 96,
    receiptWidth - 16,
    {
      align: "center",
      fontSize: 7,
      lineGap: 1,
    }
  );

  drawDottedLine(
    doc,
    receiptX + 3,
    topY + 126,
    receiptX + receiptWidth - 3,
    topY + 126
  );

  drawText(
    doc,
    `I acknowledge receipt of the amount stated in full payment of my salary ${formatMoney(
      employee.netPay
    )}`,
    receiptX + 6,
    topY + 137,
    receiptWidth - 12,
    {
      fontSize: 7,
      lineGap: 2,
    }
  );

  drawLine(
    doc,
    receiptX + 5,
    topY + 181,
    receiptX + 80,
    topY + 181
  );

  drawLine(
    doc,
    receiptX + 94,
    topY + 181,
    receiptX + receiptWidth - 5,
    topY + 181
  );

  drawText(
    doc,
    "Signature",
    receiptX + 5,
    topY + 184,
    75,
    {
      align: "center",
      fontSize: 7,
    }
  );

  drawText(
    doc,
    "Date",
    receiptX + 94,
    topY + 184,
    receiptWidth - 99,
    {
      align: "center",
      fontSize: 7,
    }
  );

  drawDottedLine(
    doc,
    receiptX,
    topY + payslipHeight + 3,
    receiptX + receiptWidth,
    topY + payslipHeight + 3
  );
}




export function generatePayslipPDF(employee: PayslipPdfData): Promise<Buffer> {
  return new Promise<Buffer>(
    (resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        layout: "portrait",
        margin: 0,
        info: {
          Title:
            `Payslip-${employee.EmpCodeId}`,
          Author: "Payroll System",
          Subject:
            `Payslip for ${employee.payCode}`,
        },
      });

      const chunks: Buffer[] = [];

      doc.on(
        "data",
        (chunk: Buffer | Uint8Array) => {
          chunks.push(Buffer.from(chunk));
        }
      );

      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on("error", reject);

      try {
        renderPayslipTemplate(doc, employee);
        doc.end();
      } catch (error: unknown) {
        doc.end();

        reject(
          error instanceof Error
            ? error
            : new Error(
                "Failed to generate payslip PDF"
              )
        );
      }
    }
  );
}