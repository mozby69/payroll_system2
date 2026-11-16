
"use client";

import {
  PayrollArchiveGrandTotal,
  PayrollArchiveReport,
} from "@/app/types/archiveTypes";

import ArchiveReportTable from "./ArchiveReportTable";
import { formatCurrency } from "@/app/utils/currencyConverter";

type Props = {
  report: PayrollArchiveReport;
  grandTotals?: PayrollArchiveGrandTotal;
};

export default function ArchivePayrollPrintView({
  report,
  grandTotals,
}: Props) {
  if (!report || !grandTotals) return null;

  const totalContributions =
    (Number(grandTotals.pagibig) || 0) +
    (Number(grandTotals.sss) || 0) +
    (Number(grandTotals.philhealth) || 0);

  const overallTotal =
    (Number(grandTotals.total) || 0) + totalContributions;

  return (
    <div className="print-report">
     
<style>{`
  @media print {
    @page {
      size: A4 landscape;
      margin: 8mm;
    }

    .print-report {
      width: 100% !important;
      max-width: none !important;
      font-family: Arial, sans-serif !important;
      font-size: 10pt !important;
      color: #111827 !important;
      background: white !important;
    }

    .report-header {
      text-align: center !important;
      margin-bottom: 16px !important;
    }

    .report-header h1 {
      font-size: 16pt !important;
      font-weight: 700 !important;
    }

    .report-header h2 {
      font-size: 12pt !important;
      font-weight: 600 !important;
    }

    .report-header div {
      font-size: 10pt !important;
    }

    /* Branch sections */
    .branch-section {
      margin-top: 14px !important;
      margin-bottom: 18px !important;
      break-inside: auto !important;
      page-break-inside: auto !important;
    }

    .branch-section h3 {
      font-size: 12pt !important;
      font-weight: 700 !important;
      margin-bottom: 7px !important;
      break-after: avoid !important;
      page-break-after: avoid !important;
    }

    /* Employee tables */
    .branch-section table {
      width: 100% !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
      font-size: 10pt !important;
    }

    .branch-section th {
      font-size: 9pt !important;
      font-weight: 700 !important;
      background: #e5e7eb !important;
      padding: 6px 4px !important;
      border: 1px solid #9ca3af !important;
      line-height: 1.2 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .branch-section td {
      font-size: 10pt !important;
      padding: 6px 4px !important;
      border: 1px solid #9ca3af !important;
      line-height: 1.3 !important;
      vertical-align: middle !important;
    }

    /* Employee number */
    .branch-section th:first-child,
    .branch-section td:first-child {
      text-align: center !important;
    }

    /* Employee name */
    .branch-section th:nth-child(2),
    .branch-section td:nth-child(2) {
      text-align: left !important;
      white-space: normal !important;
      overflow-wrap: anywhere !important;
      overflow: visible !important;
      text-overflow: clip !important;
    }

    /* Financial columns */
    .branch-section th:nth-child(n+3),
    .branch-section td:nth-child(n+3) {
      text-align: right !important;
      white-space: nowrap !important;
      font-variant-numeric: tabular-nums;
    }

    .branch-section thead {
      display: table-header-group !important;
    }

    .branch-section tbody {
      break-inside: auto !important;
    }

    .branch-section tr {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    /* Grand total */
    .grand-total-section {
      margin-top: 20px !important;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    .grand-total-section h3 {
      font-size: 12pt !important;
      font-weight: 700 !important;
    }

    .grand-total-section table {
      width: 100% !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
    }

    .grand-total-section th {
      font-size: 8.5pt !important;
      background: #e5e7eb !important;
    }

    .grand-total-section td {
      font-size: 9pt !important;
      font-weight: 700 !important;
    }

    .grand-total-section th,
    .grand-total-section td {
      border: 1px solid #9ca3af !important;
      padding: 7px 4px !important;
      overflow-wrap: anywhere !important;
    }

    .print-overall-summary {
      margin-top: 14px !important;
      break-inside: avoid !important;
    }
  }
`}</style>


      <header className="report-header text-center uppercase space-y-1">
        <h1 className="text-lg font-bold">
          {report.summaries.company}
        </h1>

        <h2 className="text-base font-semibold tracking-wide">
          Payroll By Branch Report
        </h2>

        <div className="text-sm tracking-wide">
          <span className="font-medium">
            Payroll Period Covered:
          </span>{" "}
          {report.summaries.PayCode}
        </div>
      </header>

      <ArchiveReportTable
        title="BOARD"
        employees={report.boardEmployees ?? []}
      />

      <ArchiveReportTable
        title="MANCOM"
        employees={report.mancomEmployees ?? []}
      />

      <ArchiveReportTable
        title="MAIN HOLDING"
        employees={report.holdingEmployees ?? []}
      />

      {Object.entries(report.branchGroups ?? {}).map(
        ([branch, employees]) => (
          <ArchiveReportTable
            key={branch}
            title={branch}
            employees={employees ?? []}
          />
        )
      )}

      <section className="grand-total-section">
        <h3 className="font-bold">GRAND TOTAL</h3>

        <table>
          <thead>
            <tr>
              <th>DESCRIPTION</th>
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
            <tr className="font-semibold">
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
      </section>

      <div className="print-overall-summary mt-3 flex justify-end">
        <div className="w-[320px] text-sm">
          <div className="flex justify-between">
            <span className="font-medium">
              Total Contributions:
            </span>
            <span className="font-semibold">
              {formatCurrency(totalContributions)}
            </span>
          </div>

          <div className="mt-1 flex justify-between border-t pt-1 text-base font-bold">
            <span>OVERALL TOTAL:</span>
            <span>{formatCurrency(overallTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
