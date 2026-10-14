"use client"

import { PayrollArchiveGrandTotal, PayrollArchiveReport } from "@/app/types/archiveTypes"
import ArchiveReportTable from "./ArchiveReportTable"
import { formatCurrency } from "@/app/utils/currencyConverter"

type Props = {
  report: PayrollArchiveReport
  grandTotals?: PayrollArchiveGrandTotal
}

export default function ArchivePayrollPrintView({ report, grandTotals }: Props) {

  if (!report) return null

  const today = new Date().toLocaleDateString()

  if(!grandTotals) return
 
  const totalContributions =
  grandTotals.pagibig + grandTotals?.sss + grandTotals?.philhealth

  const overallTotal = grandTotals.total + totalContributions


  return (
    
    <div className="print-report">

<style>{`
@media print {

  @page {
    size: landscape;
    margin: 10mm;
  }
    .print-name {
    text-align: left !important;
  }

.text-center{
    text-align: center !important;
  }

.branch-section {
  margin-bottom: 25px;

  /* ADD THIS */
  page-break-inside: avoid;
  break-inside: avoid;
}

  /* Keep branch title with table header */
  .branch-section h3 {
    page-break-after: avoid;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    page-break-inside: auto;
  }

  thead {
    display: table-header-group;
  }

  tfoot {
    display: table-footer-group;
  }

  tr {
    page-break-inside: avoid;
  }

  /* GRAND TOTAL always on last page */
.grand-total-section {
  page-break-inside: avoid;
  break-inside: avoid;
  margin-top: 20px;
}

  .signature-section {
    page-break-inside: avoid;
    margin-top: 40px;
  }

}
`}</style>


<div className="report-header text-center uppercase space-y-1">

<h1 className="text-lg font-bold">
  {report.summaries.company}
</h1>

<h2 className="text-base font-semibold tracking-wide">
  Payroll Archive Report
</h2>

<div className="text-sm tracking-wide">
  <span className="font-medium">Payroll Period Covered:</span>{" "}
  {report.summaries.PayCycle}
</div>

</div>

      <ArchiveReportTable title="BOARD" employees={report.boardEmployees ?? []} />

      <ArchiveReportTable title="MANCOM" employees={report.mancomEmployees ?? []} />

      <ArchiveReportTable title="MAIN HOLDING" employees={report.holdingEmployees ?? []} />

      {Object.entries(report.branchGroups ?? {}).map(
        ([branch, employees]: any) => (
          <ArchiveReportTable
            key={branch}
            title={branch}
            employees={employees ?? []}
          />
        )
      )}

      {grandTotals && (

        <div className="grand-total-section">

          <h3>GRAND TOTAL</h3>

          <table>

            <thead>
              <tr>
                <th className="w-[27%]">DESCRIPTION</th>
                <th>HALF BASIC</th>
                <th>OVERTIME</th>
                <th>LATE</th>
                <th>ABSENCES</th>
                <th>TOTAL</th>
                <th>PAG-IBIG</th>
                <th>SSS</th>
                <th>PHILHEALTH</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>GRAND TOTAL</td>

                <td>{formatCurrency(grandTotals.halfBasic)}</td>
                <td>{formatCurrency(grandTotals.overtime)}</td>
                <td>{formatCurrency(grandTotals.late)}</td>
                <td>{formatCurrency(grandTotals.absences)}</td>
                <td>{formatCurrency(grandTotals.total)}</td>
                <td>{formatCurrency(grandTotals.pagibig)}</td>
                <td>{formatCurrency(grandTotals.sss)}</td>
                <td>{formatCurrency(grandTotals.philhealth)}</td>

              </tr>

            </tbody>

          </table>

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

      {/* <div className="signature-section">

        <div>
          <p>Prepared By:</p>
          <div className="signature-line"></div>
        </div>

        <div>
          <p>Checked By:</p>
          <div className="signature-line"></div>
        </div>

        <div>
          <p>Approved By:</p>
          <div className="signature-line"></div>
        </div>

      </div> */}

    </div>
  )
}