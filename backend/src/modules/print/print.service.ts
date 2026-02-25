import printer from "printer"

function padRight(text: any, width: number) {
  return String(text ?? "").padEnd(width, " ").substring(0, width)
}

function padLeft(text: any, width: number) {
  return String(text ?? "").padStart(width, " ").substring(0, width)
}

function format(num: number) {
  return Number(num || 0).toFixed(2)
}

export function generatePayrollRaw(rows: any[]) {

  let output = ""

  // ESC/P initialize
  output += "\x1B\x40"     // reset
  output += "\x1B\x50"     // 10 CPI
  output += "\x1B\x6C\x00" // left margin 0

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

  printer.printDirect({
    data: raw,
    printer: "EPSON FX-2175II",
    type: "RAW",
    success: () => console.log("Payroll printed"),
    error: err => console.error(err)
  })
}