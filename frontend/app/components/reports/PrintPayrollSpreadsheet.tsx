"use client"

import React, { useMemo } from "react"
import { SpreadsheetRow } from "./SpreadSheet"

type Props = {
  data: SpreadsheetRow[]
}

export default function PayrollSpreadsheetPrint({ data }: Props) {

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
      netPayable: 0,
      sssEmployer: 0,
      philEmployer: 0,
      pagibigEmployer: 0,
    })
  }, [data])

  return (
    <div className="print-area">

      <div className="matrix-title">
        PAYROLL REPORT
      </div>

      <table className="matrix-table">
        <thead>
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
            <th>Sal Ln</th>
            <th>Net Pay</th>
            <th>SSS ER</th>
            <th>Phil ER</th>
            <th>PagI ER</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td className="left">{row.name}</td>
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
              <td>{format(row.salaryLoan)}</td>
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
            <td>0.00</td>
            <td>0.00</td>
            <td>{format(totals.netPayable)}</td>
            <td>{format(totals.sssEmployer)}</td>
            <td>{format(totals.philEmployer)}</td>
            <td>{format(totals.pagibigEmployer)}</td>
          </tr>
        </tbody>
      </table>

      <style jsx global>{`
        .print-area {
          font-family: "Courier New", monospace;
          width: 100%;
        }

        .matrix-title {
          text-align: center;
          font-size: 12pt;
          margin-bottom: 6px;
        }

        .matrix-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 8pt;
        }

        .matrix-table th,
        .matrix-table td {
          border: 1px solid #000;
          padding: 2px 3px;
          text-align: right;
          white-space: nowrap;
        }

        .matrix-table td.left {
          text-align: left;
        }

        .grand td {
          font-weight: bold;
        }

        /* ========================= */
        /* DOT MATRIX PRINT SETTINGS */
        /* ========================= */

@media print {

  @page {
    size: 15in 11in landscape;
    margin: 0;
  }

  html, body {
    margin: 0 !important;
    padding: 0 !important;
  }

  .print-area {
    width: 13.6in;   /* IMPORTANT */
    position: absolute;
    left: 0;
    top: 0;
  }

}
      `}</style>
    </div>
  )
}