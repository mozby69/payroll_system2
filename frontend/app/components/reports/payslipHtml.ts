import { EmployeeArchivedType } from "@/app/types/totalPayroll"
import { generateSinglePayslip } from "./generateSinglePayslip"

export function payslipHtml(data: EmployeeArchivedType[]) {

  let pages = ""

  for (let i = 0; i < data.length; i += 4) {
    const chunk = data.slice(i, i + 4)

    const pageContent = chunk
      .map((item) => generateSinglePayslip(item))
      .join("")

    pages += `
      <div class="payslip-page">
        ${pageContent}
      </div>
    `
  }

  return `
    <html>
      <head>
        <style>
          .payslip-page {
            page-break-after: always;
            break-after: page;
          }
          .payslip-page:last-child {
            page-break-after: auto;
          }
        </style>
      </head>
      <body>
        ${pages}
      </body>
    </html>
  `
}
