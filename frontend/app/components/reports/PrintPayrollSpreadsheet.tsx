"use client"

import React, { forwardRef, useMemo } from "react"
import { SpreadsheetRow } from "./SpreadSheet"
import { useGetCompanyByCode } from "@/app/hooks/useGeneral"
import { parsePayCode } from "@/app/utils/parsePaycode"
import { getCurrentPrintDateTime } from "./getCurrentPrintDateTime"

type Props = {
  data: SpreadsheetRow[],
  payCode?: string,
  companyCode?: string
}

const PayrollSpreadsheetPrint = forwardRef<HTMLDivElement, Props>(
({ data, payCode, companyCode }, ref) => {
  const printInfo = getCurrentPrintDateTime()
const period = parsePayCode(payCode)
  const { data: companyData } =
      useGetCompanyByCode(companyCode ?? "")

  const format = (val: number | string) =>
    Number(val || 0).toFixed(2)

  const totals = useMemo(() => {
    return data.reduce((acc, row) => ({
      basicPay: acc.basicPay + Number(row.basicPay || 0),
      overtime: acc.overtime + Number(row.overtime || 0),
      late: acc.late + Number(row.late || 0),
      undertime: acc.undertime + Number(row.undertime || 0),
      absence: acc.absence + Number(row.absence || 0),
      gross: acc.gross + Number(row.gross || 0),
      wtax: acc.wtax + Number(row.wtax || 0),
      sss: acc.sss + Number(row.sss || 0),
      philhealth: acc.philhealth + Number(row.philhealth || 0),
      pagibig: acc.pagibig + Number(row.pagibig || 0),

      arE: acc.arE + Number(row.arE || 0),
      fch: acc.fch + Number(row.fch || 0),
      salaryLoan: acc.salaryLoan + Number(row.salaryLoan || 0),
      calamityLoan: acc.calamityLoan + Number(row.calamityLoan || 0),

      pagibigSalaryLoan: acc.pagibigSalaryLoan + Number(row.pagibigSalaryLoan || 0),

      netPayable: acc.netPayable + Number(row.netPayable || 0),
      sssEmployer: acc.sssEmployer + Number(row.sssEmployer || 0),
      philEmployer: acc.philEmployer + Number(row.philEmployer || 0),
      pagibigEmployer: acc.pagibigEmployer + Number(row.pagibigEmployer || 0),
    }), {
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
      pagibigEmployer: 0,
    })
  }, [data])

  return (
    <div ref={ref}>
      <style>{`
        @media print {

        @page {
          size: 15in 11in landscape;
          margin: 0;
        }

        body {
          margin: 0;
          font-family: "Courier New", monospace !!important;
        }

        .print-area {
          width: 14.7in;
          margin: 0.1in auto;
          font-size: 8pt;
        }

      table {
        border-collapse: collapse;
          width: 13.5in;      
      }

        th, td {
          padding: 2px 3px;
          border-bottom: 1px solid #999;
          white-space: nowrap;
        }

        th {
          border-bottom: 2px solid #000;
          text-align: center;
        }

        td {
          text-align: right;
        }

        /* No column */
        th:nth-child(1),
        td:nth-child(1) {
          width: 40px;
          text-align: center;
        }

        /* Name column — FIXED PROPERLY */
        th:nth-child(2),
        td:nth-child(2) {
          width: 200px;          /* increase width */
          text-align: left;
          overflow: hidden;      /* prevent overlap */
          text-overflow: ellipsis;
        }
          th:nth-child(2){
              text-align: center;
          }

        /* All numeric columns */
        th:nth-child(n+2),
        td:nth-child(n+2) {
          width: 40px;
        }

        .group-header {
          border-bottom: 2px solid #000;
          text-align: center;
          font-weight: bold;
        }

        .grand td {
          font-weight: bold;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
        }
          .matrix-title{
            margin-top: 40px;
            font-weight: bold;
          }

          .matrix-title .company{
              text-transform: uppercase;
          }
      }

  `}</style>

      <div className="print-area">
        <div className="matrix-title ">
        <p className="company">
           {companyData?.data?.[0]?.CompanyName ?? ""}
        </p>
          <p>Payroll Period Covered:  &nbsp;{period?.from}  &nbsp;   To  &nbsp;   {period?.to}</p>
          <p>Date Printed: &nbsp; {printInfo.date}</p>
          <p>Time Printed: &nbsp; {printInfo.time}</p>
        </div>

        <table>
        <thead>
  <tr>
    <th colSpan={14}></th>
    <th colSpan={2}>SSS LOANS</th>
    <th></th>
    <th></th>
    <th colSpan={3}>EMPLOYER SHARE</th>
  </tr>

  <tr>
    <th>No</th>
    <th>Employee Name</th>
    <th>Basic</th>
    <th>OT</th>
    <th>Late</th>
    <th>UT</th>
    <th>Abs</th>
    <th>Gross</th>
    <th>W/Tax</th>
    <th>SSS</th>
    <th>PhilH</th>
    <th>PagI</th>
    <th>AR/E</th>
    <th>FCH</th>

    <th>Salary</th>
    <th>Calamity</th>

    <th>Pag. Sal. Ln</th>


    <th>Net Pay</th>

    <th>SSS</th>
    <th>PhilH</th>
    <th>PagI</th>
  </tr>
</thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{row.name}</td>
                <td>{format(row.basicPay)}</td>
                <td>{format(row.overtime)}</td>
                <td>{format(row.late)}</td>
                <td>{format(row.undertime)}</td>
                <td>{format(row.absence)}</td>
                <td>{format(row.gross)}</td>
                <td>{format(row.wtax)}</td>
                <td>{format(row.sss)}</td>
                <td>{format(row.philhealth)}</td>
                <td>{format(row.pagibig)}</td>
                <td>{format(row.arE)}</td>
                <td>{format(row.fch)}</td>
                <td>{format(row.salaryLoan)}</td>
                <td>{format(row.calamityLoan)}</td>
                <td>{format(row.pagibigSalaryLoan)}</td>
                <td>{format(row.netPayable)}</td>
                <td>{format(row.sssEmployer)}</td>
                <td>{format(row.philEmployer)}</td>
                <td>{format(row.pagibigEmployer)}</td>
              </tr>
            ))}

            <tr className="grand">
              <td colSpan={2}>GRAND TOTAL</td>
              <td>{format(totals.basicPay)}</td>
              <td>{format(totals.overtime)}</td>
              <td>{format(totals.late)}</td>
              <td>{format(totals.undertime)}</td>
              <td>{format(totals.absence)}</td>
              <td>{format(totals.gross)}</td>
              <td>{format(totals.wtax)}</td>
              <td>{format(totals.sss)}</td>
              <td>{format(totals.philhealth)}</td>
              <td>{format(totals.pagibig)}</td>
              <td>{format(totals.arE)}</td>
              <td>{format(totals.fch)}</td>
              <td>{format(totals.salaryLoan)}</td>
              <td>{format(totals.calamityLoan)}</td>
              <td>{format(totals.pagibigSalaryLoan)}</td>
              <td>{format(totals.netPayable)}</td>
              <td>{format(totals.sssEmployer)}</td>
              <td>{format(totals.philEmployer)}</td>
              <td>{format(totals.pagibigEmployer)}</td>
            </tr>

          </tbody>
        </table>

      </div>
    </div>
  )
})

PayrollSpreadsheetPrint.displayName = "PayrollSpreadsheetPrint"
export default PayrollSpreadsheetPrint

