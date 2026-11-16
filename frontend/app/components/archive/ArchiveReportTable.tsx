
"use client";

import { calculatePayrollTotals } from "@/app/utils/calculatePayrollTotals";
import { formatCurrency } from "@/app/utils/currencyConverter";

type Employee = {
  empCode: string;
  name: string;
  halfBasic: number;
  overtime: number;
  late: number;
  absences: number;
  undertime: number;
  branch: string | null;
  total: number;
  pagIbigEmployeer: number;
  sssEmployeer: number;
  philhealthEmployeer: number;
  reason: string;
  leaveInfo: {
    start: string;
    end: string;
    status: string;
    type: string;
  };
};

type Props = {
  title: string;
  employees: Employee[];
};

export default function ArchiveReportTable({
  title,
  employees,
}: Props) {
  if (!employees?.length) return null;

  const totals = calculatePayrollTotals(employees);

  const totalContributions =
    totals.pagibig + totals.sss + totals.philhealth;

  const overallTotal = totals.total + totalContributions;

  return (
    <section className="branch-section mt-5">
      <h3 className="mb-2 text-lg font-semibold">
        {title}
      </h3>

      <table className="w-full table-fixed border-collapse text-sm tabular-nums">
        <colgroup>
          <col style={{ width: "4%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "9%" }} />
        </colgroup>

        <thead>
          <tr className="bg-gray-100 text-xs font-semibold">
            <th className="border px-1 py-2 text-center">
              #
            </th>

            <th className="border px-2 py-2 text-left">
              EMPLOYEE
            </th>

            <th className="border px-1 py-2 text-right">
              HALF BASIC
            </th>

            <th className="border px-1 py-2 text-right">
              OVERTIME
            </th>

            <th className="border px-1 py-2 text-right">
              LATE
            </th>

            <th className="border px-1 py-2 text-right">
              ABSENCES
            </th>

            <th className="border px-1 py-2 text-right">
              TOTAL
            </th>

            <th className="border px-1 py-2 text-right">
              PAG-IBIG
            </th>

            <th className="border px-1 py-2 text-right">
              SSS
            </th>

            <th className="border px-1 py-2 text-right">
              PHILHEALTH
            </th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp, index) => {
            const hasLeave = Boolean(emp.reason);

            if (hasLeave) {
              return (
                <tr
                  key={`${emp.empCode}-${index}`}
                  className="text-red-600"
                >
                  <td className="border px-1 py-2 text-center">
                    {index + 1}
                  </td>

                  <td className="print-name border px-2 py-2 text-left whitespace-normal break-words">
                    {emp.name}
                  </td>

                  <td
                    colSpan={8}
                    className="border px-2 py-2 text-left"
                  >
                    {emp.leaveInfo?.type ?? "Unknown"} LEAVE
                    {" - "}
                    {emp.leaveInfo?.start ?? ""}
                    {" - "}
                    {emp.leaveInfo?.end ?? ""}
                  </td>
                </tr>
              );
            }

            return (
              <tr key={`${emp.empCode}-${index}`}>
                <td className="border px-1 py-2 text-center">
                  {index + 1}
                </td>

                <td className="print-name border px-2 py-2 text-left whitespace-normal break-words">
                  {emp.name}
                </td>

                <td className="border px-1 py-2 text-right">
                  {formatCurrency(emp.halfBasic)}
                </td>

                <td className="border px-1 py-2 text-right">
                  {formatCurrency(emp.overtime)}
                </td>

                <td className="border px-1 py-2 text-right">
                  {formatCurrency(
                    (Number(emp.late) || 0) +
                    (Number(emp.undertime) || 0)
                  )}
                </td>

                <td className="border px-1 py-2 text-right">
                  {formatCurrency(emp.absences)}
                </td>

                <td className="border px-1 py-2 text-right font-medium">
                  {formatCurrency(emp.total)}
                </td>

                <td className="border px-1 py-2 text-right">
                  {formatCurrency(emp.pagIbigEmployeer)}
                </td>

                <td className="border px-1 py-2 text-right">
                  {formatCurrency(emp.sssEmployeer)}
                </td>

                <td className="border px-1 py-2 text-right">
                  {formatCurrency(emp.philhealthEmployeer)}
                </td>
              </tr>
            );
          })}

          <tr className="bg-gray-200 font-semibold">
            <td className="border px-1 py-2" />

            <td className="border px-2 py-2 text-left">
              TOTAL
            </td>

            <td className="border px-1 py-2 text-right">
              {formatCurrency(totals.halfBasic)}
            </td>

            <td className="border px-1 py-2 text-right">
              {formatCurrency(totals.overtime)}
            </td>

            <td className="border px-1 py-2 text-right">
              {formatCurrency(totals.late)}
            </td>

            <td className="border px-1 py-2 text-right">
              {formatCurrency(totals.absences)}
            </td>

            <td className="border px-1 py-2 text-right">
              {formatCurrency(totals.total)}
            </td>

            <td className="border px-1 py-2 text-right">
              {formatCurrency(totals.pagibig)}
            </td>

            <td className="border px-1 py-2 text-right">
              {formatCurrency(totals.sss)}
            </td>

            <td className="border px-1 py-2 text-right">
              {formatCurrency(totals.philhealth)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-2 flex justify-end">
        <div className="w-[320px] text-sm">
          <div className="flex justify-between">
            <span>Total Contributions:</span>
            <span className="font-semibold">
              {formatCurrency(totalContributions)}
            </span>
          </div>

          <div className="mt-1 flex justify-between border-t pt-1 font-bold">
            <span>OVERALL TOTAL:</span>
            <span>{formatCurrency(overallTotal)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
