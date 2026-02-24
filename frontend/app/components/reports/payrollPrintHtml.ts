import { SpreadsheetRow } from "./SpreadSheet"

export function payrollPrintHtml(data: SpreadsheetRow[]) {

  const pad = (text: string, length: number, right = false) => {
    text = text.toString()
    if (text.length > length) return text.substring(0, length)
    return right ? text.padStart(length, " ") : text.padEnd(length, " ")
  }

  const format = (val: number | string) =>
    Number(val || 0).toFixed(2)

  /* EXACT CHARACTER WIDTH CALCULATION */
  /*
    No = 5
    Name = 30
    19 numeric columns × 9 = 171
    TOTAL = 206 characters
  */



  const lineWidth = 206
  const separator = "-".repeat(lineWidth)

    /* ===== CALCULATE GRAND TOTALS ===== */
    const totals = data.reduce((acc, row) => {
      acc.basicPay += Number(row.basicPay || 0)
      acc.overtime += Number(row.overtime || 0)
      acc.late += Number(row.late || 0)
      acc.undertime += Number(row.undertime || 0)
      acc.absence += Number(row.absence || 0)
      acc.gross += Number(row.gross || 0)
      acc.wtax += Number(row.wtax || 0)
      acc.sss += Number(row.sss || 0)
      acc.philhealth += Number(row.philhealth || 0)
      acc.pagibig += Number(row.pagibig || 0)
      acc.arE += Number(row.arE || 0)
      acc.fch += Number(row.fch || 0)
      acc.salaryLoan += Number(row.salaryLoan || 0)
      acc.calamityLoan += Number(row.calamityLoan || 0)
      acc.pagibigSalaryLoan += Number(row.pagibigSalaryLoan || 0)
      acc.netPayable += Number(row.netPayable || 0)
      acc.sssEmployer += Number(row.sssEmployer || 0)
      acc.philEmployer += Number(row.philEmployer || 0)
      acc.pagibigEmployer += Number(row.pagibigEmployer || 0)
      return acc
    }, {
      basicPay: 0,
      overtime: 0,
      late: 0,
      undertime: 0,
      absence: 0,
      gross: 0,
      wtax: 0,
      sss: 0,
      philhealth: 0,
      pagibig: 0,
      arE: 0,
      fch: 0,
      salaryLoan: 0,
      calamityLoan: 0,
      pagibigSalaryLoan: 0,
      netPayable: 0,
      sssEmployer: 0,
      philEmployer: 0,
      pagibigEmployer: 0
    })

  /* GROUP HEADER (aligned inside 206 width) */
  const headerGroup =
    pad("", 130) +
    pad("SSS LOANS", 27) +
    pad("", 10) +
    pad("EMPLOYER SHARE", 39)

  /* COLUMN HEADER */
  const headerColumns =
    pad("No", 5) +
    pad("Employee Name", 30) +
    pad("Basic", 8) +
    pad("OT", 8) +
    pad("Late", 8) +
    pad("UT", 8) +
    pad("Abs", 8) +
    pad("Gross", 8) +
    pad("W/Tax", 8) +
    pad("SSS", 8) +
    pad("PhilH", 8) +
    pad("PagI", 8) +
    pad("AR/E", 8) +
    pad("FCH", 8) +
    pad("Sal Ln", 8) +
    pad("Cal Ln", 8) +
    pad("PagI Ln", 8) +
    pad("Net Pay", 8) +
    pad("SSS ER", 8) +
    pad("Phil ER", 8) +
    pad("PagI ER", 8)

  /* DATA ROWS */
  const rows = data.map((row, i) =>
    pad(String(i + 1), 5) +
    pad(row.name, 30) +
    pad(format(row.basicPay), 8, true) +
    pad(format(row.overtime), 8, true) +
    pad(format(row.late), 8, true) +
    pad(format(row.undertime), 8, true) +
    pad(format(row.absence), 8, true) +
    pad(format(row.gross), 8, true) +
    pad(format(row.wtax), 8, true) +
    pad(format(row.sss), 8, true) +
    pad(format(row.philhealth), 8, true) +
    pad(format(row.pagibig), 8, true) +
    pad(format(row.arE), 8, true) +
    pad(format(row.fch), 8, true) +
    pad(format(row.salaryLoan), 8, true) +
    pad(format(row.calamityLoan), 8, true) +
    pad(format(row.pagibigSalaryLoan), 8, true) +
    pad(format(row.netPayable), 8, true) +
    pad(format(row.sssEmployer), 8, true) +
    pad(format(row.philEmployer), 8, true) +
    pad(format(row.pagibigEmployer), 8, true)
  ).join("\n")


    /* ===== GRAND TOTAL ROW ===== */
    const grandTotalRow =
    pad("", 5) +
    pad("GRAND TOTAL", 30) +
    pad(format(totals.basicPay), 8, true) +
    pad(format(totals.overtime), 8, true) +
    pad(format(totals.late), 8, true) +
    pad(format(totals.undertime), 8, true) +
    pad(format(totals.absence), 8, true) +
    pad(format(totals.gross), 8, true) +
    pad(format(totals.wtax), 8, true) +
    pad(format(totals.sss), 8, true) +
    pad(format(totals.philhealth), 8, true) +
    pad(format(totals.pagibig), 8, true) +
    pad(format(totals.arE), 8, true) +
    pad(format(totals.fch), 8, true) +
    pad(format(totals.salaryLoan), 8, true) +
    pad(format(totals.calamityLoan), 8, true) +
    pad(format(totals.pagibigSalaryLoan), 8, true) +
    pad(format(totals.netPayable), 8, true) +
    pad(format(totals.sssEmployer), 8, true) +
    pad(format(totals.philEmployer), 8, true) +
    pad(format(totals.pagibigEmployer), 8, true)


  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
@page { margin:0; }

body {
  font-family: "Courier New", monospace;
  font-size: 12px;  
  margin: 0;
}

pre {
  margin-left: 70px;
  margin-top: 40px;
  white-space: pre;
  
}
</style>
</head>
<body>

<pre>
PAYROLL REPORT
${separator}
${headerGroup}
${headerColumns}
${separator}
${rows}
${separator}
${grandTotalRow}
${separator}
</pre>

</body>
</html>
`
}