
"use client";

import {
  EmployeeGenerateBonusResponse,
} from "@/app/types/bonusType";

import {
  Fragment,
  forwardRef,
  useMemo,
} from "react";

type BonusProps = {
  data: EmployeeGenerateBonusResponse;
};

type BonusRule = {
  code?: string;
  name?: string;
};

type BatchSummary = {
  id: number;
  bonusRuleId: number;
  bonusRule?: BonusRule | null;
};

type EmployeeBonusDetail = {
  bonusSummaryId: number;
  bonusAmount: number | string;
};

type Employee =
  EmployeeGenerateBonusResponse["data"]["employees"][number] & {
    branchCode?: string | null;
    branchPosition?: number | null;
    bonuses?: EmployeeBonusDetail[];
  };

type VarianceEmployee = {
  EmpCode: string;
  basic_salary: number | string | null;
  type: string;
  remarks?: string | null;
  name?: string | null;
  date?: string | null;
};

type VarianceReport = {
  varianceEmployees?: VarianceEmployee[];
  totalVarianceBasicSalary?: number | string | null;
  prevPayrollDate?: string | null;
  prevPayroll?: number | string | null;
};

const formatMoney = (value: unknown) => {
  const amount = Number(value ?? 0);

  return `₱${(Number.isFinite(amount) ? amount : 0).toLocaleString(
    "en-PH",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};

const formatDate = (
  value: string | Date | null | undefined
) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-PH", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
};

const PrintBonusReport = forwardRef<
  HTMLDivElement,
  BonusProps
>(({ data }, ref) => {
  const response = data?.data;

  const summary = response?.summary;

  const batchResponse = response as
    typeof response & {
      summaries?: BatchSummary[];
    };

  const summaries = batchResponse?.summaries ?? [];

  const employees = (
    response?.employees ?? []
  ) as Employee[];

  // COMPANY INFORMATION
  const companyCode = (
    summary?.companyCode ??
    employees[0]?.companyCode ??
    ""
  ).toUpperCase();

  const isPSPMI = companyCode === "PSPMI";

  // Replace these with actual registered company names.
  const companyNames: Record<string, string> = {
    PSPMI: "PSPMI",
    EMB: "EMB",
  };

  const companyName =
    companyNames[companyCode] ?? companyCode;

  // BATCH BONUS
  const hasBatch = summaries.length > 1;

  const bonusColumns = useMemo(() => {
    if (!hasBatch) return [];

    const uniqueRules = new Map<
      number,
      BatchSummary
    >();

    summaries.forEach((item) => {
      if (!uniqueRules.has(item.bonusRuleId)) {
        uniqueRules.set(item.bonusRuleId, item);
      }
    });

    return Array.from(uniqueRules.values());
  }, [summaries, hasBatch]);

  const getBonusAmountByRule = (
    employee: Employee,
    bonusRuleId: number
  ) => {
    const summaryIds = new Set(
      summaries
        .filter(
          (item) => item.bonusRuleId === bonusRuleId
        )
        .map((item) => item.id)
    );

    return (employee.bonuses ?? []).reduce(
      (total, bonus) => {
        if (summaryIds.has(bonus.bonusSummaryId)) {
          return (
            total + Number(bonus.bonusAmount ?? 0)
          );
        }

        return total;
      },
      0
    );
  };

  // ALPHABETICAL SORTING
  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
      const nameCompare = (
        a.fullName ?? ""
      ).localeCompare(
        b.fullName ?? "",
        undefined,
        { sensitivity: "base" }
      );

      if (nameCompare !== 0) {
        return nameCompare;
      }

      return (a.employeeCode ?? "").localeCompare(
        b.employeeCode ?? ""
      );
    });
  }, [employees]);

  // PSPMI BRANCH GROUPING
  const sortedBranches = useMemo(() => {
    if (!isPSPMI) return [];

    const grouped = sortedEmployees.reduce(
      (acc, employee) => {
        const branchCode =
          employee.branchCode || "UNKNOWN";

        if (!acc[branchCode]) {
          acc[branchCode] = [];
        }

        acc[branchCode].push(employee);

        return acc;
      },
      {} as Record<string, Employee[]>
    );

    return Object.entries(grouped).sort(
      ([branchA, employeesA], [branchB, employeesB]) => {
        const positionA = Number(
          employeesA[0]?.branchPosition ?? 9999
        );

        const positionB = Number(
          employeesB[0]?.branchPosition ?? 9999
        );

        if (positionA !== positionB) {
          return positionA - positionB;
        }

        return branchA.localeCompare(branchB);
      }
    );
  }, [sortedEmployees, isPSPMI]);

  // TOTALS
  const calculateTotals = (rows: Employee[]) =>
    rows.reduce(
      (acc, employee) => {
        const salary = Number(
          employee.basicSalary ?? 0
        );

        acc.basicSalary += salary;
        acc.halfMonth += salary / 2;
        acc.bonusAmount += Number(
          employee.bonusAmount ?? 0
        );
        acc.fchLoan += Number(
          employee.fchLoan ?? 0
        );
        acc.netAmount += Number(
          employee.netAmount ?? 0
        );

        return acc;
      },
      {
        basicSalary: 0,
        halfMonth: 0,
        bonusAmount: 0,
        fchLoan: 0,
        netAmount: 0,
      }
    );

  const totals = calculateTotals(sortedEmployees);

  const getBonusColumnTotal = (
    rows: Employee[],
    ruleId: number
  ) =>
    rows.reduce(
      (sum, employee) =>
        sum + getBonusAmountByRule(employee, ruleId),
      0
    );

  const totalColumns = 10 + bonusColumns.length;

  // VARIANCE
  const rawVariance = response?.variance as
    | VarianceReport
    | VarianceReport[]
    | null
    | undefined;

  const variance: VarianceReport | null =
    Array.isArray(rawVariance)
      ? rawVariance.length === 1
        ? rawVariance[0]
        : null
      : rawVariance ?? null;

  const varianceEmployees =
    variance?.varianceEmployees ?? [];

  const varianceTotal = Number(
    variance?.totalVarianceBasicSalary ?? 0
  );

  const varianceBreakdownTotal =
    varianceEmployees.reduce(
      (sum, employee) => {
        const amount = Number(
          employee.basic_salary ?? 0
        );

        return employee.type ===
          "ARCHIVE_NO_BONUS"
          ? sum - amount
          : sum + amount;
      },
      0
    );

  const remainingVariance =
    varianceTotal - varianceBreakdownTotal;

  // EMPLOYEE ROWS
  const renderEmployeeRows = (rows: Employee[]) =>
    rows.map((employee, index) => (
      <tr
        key={`${employee.companyCode}-${employee.employeeCode}`}
      >
        <td className="border px-1 py-1 text-center">
          {index + 1}
        </td>

        <td className="border px-1 py-1 employee-name">
          {employee.fullName}
        </td>

        <td className="border px-1 py-1 text-center">
          {formatDate(employee.employementDate)}
        </td>

        <td className="border px-1 py-1 text-center">
          {employee.tenureYears}
        </td>

        <td className="border px-1 py-1 money-cell">
          {formatMoney(employee.basicSalary)}
        </td>

        <td className="border px-1 py-1 money-cell">
          {formatMoney(
            Number(employee.basicSalary ?? 0) / 2
          )}
        </td>

        {bonusColumns.map((column) => (
          <td
            key={column.bonusRuleId}
            className="border px-1 py-1 money-cell"
          >
            {formatMoney(
              getBonusAmountByRule(
                employee,
                column.bonusRuleId
              )
            )}
          </td>
        ))}

        <td className="border px-1 py-1 money-cell">
          {formatMoney(employee.bonusAmount)}
        </td>

        <td className="border px-1 py-1 money-cell">
          {formatMoney(employee.fchLoan)}
        </td>

        <td className="border px-1 py-1 money-cell font-semibold">
          {formatMoney(employee.netAmount)}
        </td>

        <td className="border px-1 py-1">
          {employee.remarks ?? ""}
        </td>
      </tr>
    ));

  // REUSABLE TOTAL ROW
  const renderTotalRow = (
    rows: Employee[],
    label: string,
    isGrandTotal = false
  ) => {
    const rowTotals = calculateTotals(rows);

    return (
      <tr
        className={
          isGrandTotal
            ? "grand-total font-bold bg-gray-200"
            : "branch-total font-semibold bg-gray-100"
        }
      >
        <td
          colSpan={4}
          className="border px-1 py-2 text-right"
        >
          {label}
        </td>

        <td className="border px-1 py-2 money-cell">
          {formatMoney(rowTotals.basicSalary)}
        </td>

        <td className="border px-1 py-2 money-cell">
          {formatMoney(rowTotals.halfMonth)}
        </td>

        {bonusColumns.map((column) => (
          <td
            key={column.bonusRuleId}
            className="border px-1 py-2 money-cell"
          >
            {formatMoney(
              getBonusColumnTotal(
                rows,
                column.bonusRuleId
              )
            )}
          </td>
        ))}

        <td className="border px-1 py-2 money-cell">
          {formatMoney(rowTotals.bonusAmount)}
        </td>

        <td className="border px-1 py-2 money-cell">
          {formatMoney(rowTotals.fchLoan)}
        </td>

        <td className="border px-1 py-2 money-cell">
          {formatMoney(rowTotals.netAmount)}
        </td>

        <td className="border" />
      </tr>
    );
  };

  return (
    <div
      ref={ref}
      className="bonus-print-wrapper bg-white text-black"
    >
      <style>{`
        @page {
          size: A4 landscape;
          margin: 10mm;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
          }

          .bonus-print-wrapper {
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
            min-height: auto !important;
            font-size: 10px;
            color: #000 !important;
            background: #fff !important;
          }

          .bonus-print-wrapper * {
            visibility: visible !important;
          }

          .bonus-print-wrapper table {
            width: 100%;
            border-collapse: collapse;
            table-layout: auto;
          }

          .bonus-print-wrapper thead {
            display: table-header-group;
          }

          .bonus-print-wrapper tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .bonus-print-wrapper th,
          .bonus-print-wrapper td {
            border: 1px solid #777;
          }

          .bonus-print-wrapper .variance-section,
          .bonus-print-wrapper .signature-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .bonus-print-wrapper .print-header {
            break-after: avoid;
            page-break-after: avoid;
          }

          .bonus-print-wrapper .print-table {
            font-size: 9px;
          }

          .bonus-print-wrapper .print-table th {
            padding: 5px 3px;
            font-weight: 700;
          }

          .bonus-print-wrapper .print-table td {
            padding: 4px 3px;
          }

          .bonus-print-wrapper .employee-name {
            min-width: 125px;
          }

          .bonus-print-wrapper .money-cell {
            text-align: right;
            white-space: nowrap;
          }

          .bonus-print-wrapper .branch-header,
          .bonus-print-wrapper .branch-total,
          .bonus-print-wrapper .grand-total,
          .bonus-print-wrapper thead {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .bonus-print-wrapper .branch-header,
          .bonus-print-wrapper .grand-total,
          .bonus-print-wrapper thead {
            background-color: #e5e7eb !important;
          }

          .bonus-print-wrapper .branch-total {
            background-color: #f3f4f6 !important;
          }
        }
      `}</style>

      {/* REPORT HEADER */}
      <div className="print-header text-center mb-5">
        <h1 className="text-lg font-bold">
          {companyName} - EMPLOYEE BONUS REPORT
        </h1>

        <div className="text-sm font-semibold mt-1">
          {hasBatch
            ? "CONSOLIDATED BONUS REPORT"
            : summary?.bonusRule?.name ??
              "BONUS REPORT"}
        </div>

        <div className="text-xs mt-1">
          Release Period:{" "}
          {summary?.releasePeriod ?? "-"}
        </div>

        <div className="text-xs mt-1">
          Total Employees: {sortedEmployees.length}
        </div>
      </div>

      {/* EMPLOYEE TABLE */}
      <table className="print-table w-full text-xs border-collapse border border-gray-400">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-1 py-2 text-center">
              #
            </th>

            <th className="border px-1 py-2 text-left employee-name">
              Employee
            </th>

            <th className="border px-1 py-2 text-center">
              Date Hired
            </th>

            <th className="border px-1 py-2 text-center">
              Tenure
            </th>

            <th className="border px-1 py-2 text-right">
              Monthly Basic
            </th>

            <th className="border px-1 py-2 text-right">
              Half Month
            </th>

            {/* DYNAMIC BATCH COLUMNS */}
            {bonusColumns.map((column) => (
              <th
                key={column.bonusRuleId}
                className="border px-1 py-2 text-right"
              >
                {column.bonusRule?.name ??
                  column.bonusRule?.code ??
                  "Bonus"}
              </th>
            ))}

            <th className="border px-1 py-2 text-right">
              Bonus
            </th>

            <th className="border px-1 py-2 text-right">
              FCH Loan
            </th>

            <th className="border px-1 py-2 text-right">
              Net Bonus
            </th>

            <th className="border px-1 py-2 text-left">
              Remarks
            </th>
          </tr>
        </thead>

        <tbody>
          {isPSPMI ? (
            // PSPMI: GROUP BY BRANCH
            sortedBranches.map(
              ([branchCode, branchEmployees]) => (
                <Fragment key={branchCode}>
                  {/* BRANCH HEADER */}
                  <tr className="branch-header bg-gray-200 font-bold">
                    <td
                      colSpan={totalColumns}
                      className="border px-2 py-2 text-left"
                    >
                      {branchCode}
                    </td>
                  </tr>

                  {/* EMPLOYEES */}
                  {renderEmployeeRows(branchEmployees)}

                  {/* BRANCH SUBTOTAL */}
                  {renderTotalRow(
                    branchEmployees,
                    "BRANCH TOTAL"
                  )}
                </Fragment>
              )
            )
          ) : (
            // OTHER COMPANIES: ALPHABETICAL ONLY
            renderEmployeeRows(sortedEmployees)
          )}

          {/* EMPTY STATE */}
          {sortedEmployees.length === 0 && (
            <tr>
              <td
                colSpan={totalColumns}
                className="border px-3 py-5 text-center"
              >
                No employee bonus records found.
              </td>
            </tr>
          )}

          {/* GRAND TOTAL */}
          {renderTotalRow(
            sortedEmployees,
            "GRAND TOTAL",
            true
          )}
        </tbody>
      </table>

      {/* PAYROLL COMPARISON */}
      {variance && (
        <div className="variance-section mt-6 border p-4 text-sm">
          <h3 className="font-semibold mb-3">
            Payroll Comparison
          </h3>

          <div className="flex justify-between">
            <span>Half Month</span>
            <span>
              {formatMoney(totals.halfMonth)}
            </span>
          </div>

          <div className="flex justify-between mt-1">
            <span>
              Previous Payroll{" "}
              {variance.prevPayrollDate ?? ""}
            </span>
            <span>
              {formatMoney(variance.prevPayroll)}
            </span>
          </div>

          <div className="border-t my-2" />

          <div className="flex justify-between font-semibold">
            <span>VARIANCE</span>
            <span>
              {formatMoney(varianceTotal)}
            </span>
          </div>

          {varianceEmployees.map((employee, index) => {
            const amount = Number(
              employee.basic_salary ?? 0
            );

            const isAdd =
              employee.type === "BONUS_NO_ARCHIVE" ||
              employee.type === "SALARY_CHANGED";

            return (
              <div
                key={`${employee.EmpCode}-${index}`}
                className="flex justify-between gap-4 text-xs mt-1"
              >
                <span>
                  {employee.remarks
                    ? `${employee.remarks}: `
                    : "UNKNOWN: "}

                  {employee.name}

                  {employee.date
                    ? ` (${employee.date})`
                    : ""}
                </span>

                <span className="whitespace-nowrap">
                  {isAdd
                    ? `(${formatMoney(amount)})`
                    : formatMoney(amount)}
                </span>
              </div>
            );
          })}

          <div className="border-t my-2" />

          <div className="flex justify-between font-semibold">
            <span>Total Variance Balance</span>
            <span>
              {formatMoney(remainingVariance)}
            </span>
          </div>
        </div>
      )}

      {/* SIGNATURE SECTION */}
      <div className="signature-section mt-16 flex justify-between gap-6 text-sm">
        <div className="flex-1">
          <div className="border-t border-black text-center pt-1">
            Prepared By
          </div>
        </div>

        <div className="flex-1">
          <div className="border-t border-black text-center pt-1">
            Checked By
          </div>
        </div>

        <div className="flex-1">
          <div className="border-t border-black text-center pt-1">
            Approved By
          </div>
        </div>
      </div>
    </div>
  );
});

PrintBonusReport.displayName = "PrintBonusReport";

export default PrintBonusReport;
