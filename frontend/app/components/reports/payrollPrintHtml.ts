import { SpreadsheetRow } from "./SpreadSheet"

export function payrollPrintHtml(data: SpreadsheetRow[]) {

  const pad = (text: string, length: number, right = false) => {
    text = text.toString()
    if (text.length > length) return text.substring(0, length)
    return right ? text.padStart(length, " ") : text.padEnd(length, " ")
  }

  const format = (val: number | string) =>
    Number(val || 0).toFixed(2)

  const lineWidth = 220
  const separator = "-".repeat(lineWidth)

  /* GROUP HEADER */
  const headerGroup =
    pad("", 152) +
    pad("SSS LOANS", 24) +
    pad("", 16) +
    pad("EMPLOYER SHARE", 14)

  /* COLUMN HEADER */
  const headerColumns =
    pad("No", 5) +
    pad("Employee Name", 30) +
    pad("Basic", 9) +
    pad("OT", 9) +
    pad("Late", 9) +
    pad("UT", 9) +
    pad("Absence", 9) +
    pad("Gross", 9) +
    pad("W/Tax", 9) +
    pad("SSS", 9) +
    pad("PhilH", 9) +
    pad("PagI", 9) +
    pad("AR/E", 9) +
    pad("FCH", 9) +
    pad("Sal Ln", 9) +
    pad("Cal Ln", 9) +
    pad("PagI Ln", 9) +
    pad("Net Pay", 9) +
    pad("SSS", 9) +
    pad("Phil ER", 9) +
    pad("Pag-ibig", 9)

  /* ROWS */
  const rows = data.map((row, i) =>
    pad(String(i + 1), 5) +
    pad(row.name, 30) +
    pad(format(row.basicPay), 9, true) +
    pad(format(row.overtime), 9, true) +
    pad(format(row.late), 9, true) +
    pad(format(row.undertime), 9, true) +
    pad(format(row.absence), 9, true) +
    pad(format(row.gross), 9, true) +
    pad(format(row.wtax), 9, true) +
    pad(format(row.sss), 9, true) +
    pad(format(row.philhealth), 9, true) +
    pad(format(row.pagibig), 9, true) +
    pad(format(row.arE), 9, true) +
    pad(format(row.fch), 9, true) +
    pad(format(row.salaryLoan), 9, true) +
    pad(format(row.calamityLoan), 9, true) +
    pad(format(row.pagibigSalaryLoan), 9, true) +
    pad(format(row.netPayable), 9, true) +
    pad(format(row.sssEmployer), 9, true) +
    pad(format(row.philEmployer), 9, true) +
    pad(format(row.pagibigEmployer), 9, true)
  ).join("\n")

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />

<style>
@page { margin: 5mm; }

body {
  font-family: "Courier New", monospace;
  font-size: 10pt;
  margin: 0;
}

.report-wrapper {
  padding: 10px;
}

.report-title {
  text-align: center;
  font-weight: bold;
  margin-bottom: 6px;
}

.separator {
  border-top: 1px solid #000;
  margin: 4px 0;
}

pre {
  margin: 0;
  line-height: 1.4;
  white-space: pre;
}
</style>

</head>
<body>

<div class="report-wrapper">

<div class="report-title">
  PAYROLL REPORT
</div>

<div class="separator"></div>

<pre>
${headerGroup}
${headerColumns}
${separator}
${rows}
</pre>

</div>

</body>
</html>
`
}