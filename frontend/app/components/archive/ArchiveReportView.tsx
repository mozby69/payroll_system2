"use client"

import { PayrollArchiveGrandTotal, PayrollArchiveReport } from "@/app/types/archiveTypes"
import ArchiveReportTable from "./ArchiveReportTable"
import { formatCurrency } from "@/app/utils/currencyConverter"

type Props = {
  report: PayrollArchiveReport
  grandTotals?: PayrollArchiveGrandTotal
}

export default function ArchiveReportView({ report, grandTotals }: Props) {

    if(!grandTotals) return
 
  const totalContributions =
  grandTotals.pagibig + grandTotals?.sss + grandTotals?.philhealth

  const overallTotal = grandTotals.total + totalContributions

  return (
    <div className="space-y-8">

      {/* Board */}
      <ArchiveReportTable
        title="BOARD"
        employees={report.boardEmployees}
      />

      {/* Mancom */}
      <ArchiveReportTable
        title="MANCOM"
        employees={report.mancomEmployees}
      />

      {/* Holding */}
      <ArchiveReportTable
        title="MAIN HOLDING"
        employees={report.holdingEmployees}
      />

      {/* Branch Groups */}
      {Object.entries(report.branchGroups).map(
        ([branch, employees]: any) => (
          <ArchiveReportTable
            key={branch}
            title={branch}
            employees={employees}
          />
        )
      )}

      {/* GRAND TOTAL */}
      {grandTotals && (
        <div className="mt-10">

          <h3 className="text-lg font-semibold text-slate-800 mb-3">
            GRAND TOTAL
          </h3>

          <div className="border rounded-lg overflow-hidden">

            <table className="w-full border-collapse text-sm table-fixed tabular-nums">

              <thead>
                <tr className="bg-gray-100 text-xs font-semibold">
                  <th className="border px-2 py-2 text-left w-[27%]">
                    DESCRIPTION
                  </th>

                  <th className="border px-2 py-2 text-right">
                    HALF BASIC
                  </th>

                  <th className="border px-2 py-2 text-right">
                    OVERTIME
                  </th>

                  <th className="border px-2 py-2 text-right">
                    LATE
                  </th>

                  <th className="border px-2 py-2 text-right">
                    ABSENCES
                  </th>

                  <th className="border px-2 py-2 text-right">
                    TOTAL
                  </th>

                  <th className="border px-2 py-2 text-right">
                    PAG-IBIG
                  </th>

                  <th className="border px-2 py-2 text-right">
                    SSS
                  </th>

                  <th className="border px-2 py-2 text-right">
                    PHILHEALTH
                  </th>
                </tr>
              </thead>

              <tbody>

                <tr className="bg-gray-50 font-semibold">

                  <td className="border px-2 py-2">
                    GRAND TOTAL
                  </td>

                  <td className="border px-2 py-2 text-right">
                    {formatCurrency(grandTotals.halfBasic)}
                  </td>

                  <td className="border px-2 py-2 text-right">
                    {formatCurrency(grandTotals.overtime)}
                  </td>

                  <td className="border px-2 py-2 text-right">
                    {formatCurrency(grandTotals.late)}
                  </td>

                  <td className="border px-2 py-2 text-right">
                    {formatCurrency(grandTotals.absences)}
                  </td>

                  <td className="border px-2 py-2 text-right font-bold">
                    {formatCurrency(grandTotals.total)}
                  </td>

                  <td className="border px-2 py-2 text-right">
                    {formatCurrency(grandTotals.pagibig)}
                  </td>

                  <td className="border px-2 py-2 text-right">
                    {formatCurrency(grandTotals.sss)}
                  </td>

                  <td className="border px-2 py-2 text-right">
                    {formatCurrency(grandTotals.philhealth)}
                  </td>

                </tr>

              </tbody>

            </table>

       

          </div>

        </div>
      )}

          <div className="mt-3 flex justify-end">
                <div className="w-[320px] text-sm">

                  <div className="flex justify-between">
                    <span className="font-medium">Total Contributions:</span>
                    <span className="font-semibold">
                      {formatCurrency(totalContributions)}
                    </span>
                  </div>

                  <div className="border-t mt-1 pt-1 flex justify-between text-base font-bold">
                    <span>OVERALL TOTAL:</span>
                    <span>
                      {formatCurrency(overallTotal)}
                    </span>
                  </div>
                </div>
          </div>
    </div>
  )
}