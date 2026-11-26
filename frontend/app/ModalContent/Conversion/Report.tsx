import { useAuth } from "@/app/components/UserContext";
import { useAllowanceSignatories } from "@/app/hooks/useAllowance";
import { useConversionReport } from "@/app/hooks/useConversion";
import { useGetCompanyByCode } from "@/app/hooks/useGeneral";
import { formatCurrency } from "@/app/utils/currencyConverter";
import { formatDate } from "@/app/utils/DateFormatter";
import { useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";

const FCH_GROUPS = [
  "FCH MANILA",
  "FCH ANTIPOLO",
  "FCH VISAYAS",
] as const;

const PSPMI_BRANCHES = [
  "PSPMI",
  "SGI",
  "NAH",
  "TLH"
] as const;



type ReportEmployee = NonNullable<
  ReturnType<typeof useConversionReport>["data"]
>[number];

type ReportSection = {
  title: string | null;
  employees: ReportEmployee[];
};

const calculateTotals = (employees: ReportEmployee[]) =>
  employees.reduce(
    (acc, item) => ({
      basic:
        acc.basic + Number(item.basic_salary ?? 0),
      daily:
        acc.daily + Number(item.daily_rate ?? 0),
      amount:
        acc.amount +
        Number(item.leave_amount_for_conversion ?? 0),
    }),
    {
      basic: 0,
      daily: 0,
      amount: 0,
    }
  );

function ConversionReportTable({
  employees,
}: {
  employees: ReportEmployee[];
}) {
  const totals = calculateTotals(employees);

  const headerClass =
    "p-4 border border-gray-200 text-center text-xs font-semibold uppercase";

  const cellClass =
    "p-2 border border-gray-200";

  const totalClass =
    "font-semibold border border-gray-200 p-2";

  return (
    <div className="overflow-x-auto print:overflow-visible">
      <table className="w-full border-collapse border-gray-100 bg-white shadow-sm rounded-lg overflow-hidden print:shadow-none">
        <thead>
          <tr>
            <th className={headerClass}>
              EMPLOYEE NAME
            </th>
            <th className={headerClass}>
              DATE HIRED
            </th>
            <th className={headerClass}>
              TENURE
            </th>
            <th className={headerClass}>
              MONTHLY BASIC
            </th>
            <th className={headerClass}>
              DAILY RATE
            </th>
            <th className={headerClass}>
              REMAINING LEAVE
            </th>
            <th className={headerClass}>
              VL FOR CONVERT
            </th>
            <th className={headerClass}>
              SL PER DTR
            </th>
            <th className={headerClass}>
              TOTAL LEAVE CREDITS FOR CONVERSION
            </th>
            <th className={headerClass}>
              AMOUNT FOR CONVERSION
            </th>
          </tr>
        </thead>

        <tbody>
          {employees.map((item) => (
            <tr key={item.EmpCode}>
              <td className={cellClass}>
                {item.fullname}
              </td>

              <td className={cellClass}>
                {formatDate(item.EmployementDate)}
              </td>

              <td className={`${cellClass} text-center`}>
                {item.tenure}
              </td>

              <td className={`${cellClass} text-right`}>
                {item.basic_salary == null
                  ? 0
                  : Number(item.basic_salary)}
              </td>

              <td className={`${cellClass} text-right`}>
                {item.daily_rate}
              </td>

              <td className={`${cellClass} text-center`}>
                {Number(item.Vacation ?? 0)}
              </td>

              <td className={`${cellClass} text-center`}>
                {item.leave_convert == null
                  ? ""
                  : Number(item.leave_convert)}
              </td>

              <td className={`${cellClass} text-center`}>
                {Number(item.Sick ?? 0)}
              </td>

              <td className={`${cellClass} text-center`}>
                {item.total_leave_for_conversion}
              </td>

              <td className={`${cellClass} text-right`}>
                {formatCurrency(
                  item.leave_amount_for_conversion
                )}
              </td>
            </tr>
          ))}

          {employees.length === 0 && (
            <tr>
              <td
                colSpan={10}
                className="border border-gray-200 p-6 text-center text-gray-500"
              >
                No employees found.
              </td>
            </tr>
          )}

          {/* ORIGINAL TOTAL ROW */}
          <tr>
            <td className={totalClass} colSpan={3}>
              TOTAL
            </td>

            <td className={`${totalClass} text-right`}>
              {formatCurrency(totals.basic)}
            </td>

            <td className={`${totalClass} text-right`}>
              {formatCurrency(totals.daily)}
            </td>

            <td className={totalClass} colSpan={4} />

            <td className={`${totalClass} text-right`}>
              {formatCurrency(totals.amount)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function ConversionReport() {
  const { user } = useAuth();
  const company_id = user?.company_id;

  const { data: conversion_report_data } =
    useConversionReport(company_id);

  const { data: companyData } =
    useGetCompanyByCode(company_id ?? "");

  const { data: signatoryResponse } =
    useAllowanceSignatories();

  const printRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // REPORT DATA
  // ==========================================

  const reportData = useMemo(
    () => conversion_report_data ?? [],
    [conversion_report_data]
  );

  const asOfDate =
    reportData[0]?.as_of_date?.as_of_date;

  // ==========================================
  // GROUP REPORT FOR FCH
  // ==========================================

// ==========================================
// GROUP REPORT BY COMPANY CONFIGURATION
// ==========================================

const reportSections = useMemo<ReportSection[]>(() => {
  // Determine the categories for the company
  const categories =
    company_id === "FCH"
      ? FCH_GROUPS
      : company_id === "PSPMI"
      ? PSPMI_BRANCHES
      : null;

  // Other companies retain the original report
  if (!categories) {
    return [
      {
        title: null,
        employees: reportData,
      },
    ];
  }

  // Determine which property to use for grouping
  const getCategory = (employee: ReportEmployee): string => {
    const category =
      company_id === "FCH"
        ? employee.branch_group_name
        : employee.effective_branch_code;

    return category?.trim().toUpperCase() ?? "";
  };

  // Generate individual report sections
  const sections: ReportSection[] = categories.map(
    (category) => ({
      title: category,

      employees: reportData.filter(
        (employee) => getCategory(employee) === category
      ),
    })
  );

  // Include employees without a recognized category
  const ungrouped = reportData.filter(
    (employee) =>
      !categories.some(
        (category) => getCategory(employee) === category
      )
  );

  // Prevent employees from being excluded
  if (ungrouped.length > 0) {
    sections.push({
      title: "UNGROUPED",
      employees: ungrouped,
    });
  }

  return sections;
}, [company_id, reportData]);

  // ==========================================
  // PRINT
  // ==========================================

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "conversion report",
    pageStyle: `
      @page {
        size: portrait;
        margin: 15mm;
      }

      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      table {
        border-collapse: collapse;
        width: 100%;
      }

      thead {
        display: table-header-group;
      }

      tr {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .report-section {
        break-inside: auto;
        page-break-inside: auto;
      }

      .report-section-title {
        break-after: avoid;
        page-break-after: avoid;
      }

      .signatory-section {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    `,
  });

  // ==========================================
  // SIGNATORIES
  // ==========================================

  const signatories = signatoryResponse?.data ?? [];

  const conversionSignatories = signatories.filter(
    (item) =>
      item.category === "SL_VL_CONVERSION" &&
      item.isActive
  );

  const preparedBy = conversionSignatories.filter(
    (item) => item.signatory_type === "PREPARED_BY"
  );

  const checkedBy = conversionSignatories.filter(
    (item) => item.signatory_type === "CHECKED_BY"
  );

  const approvedBy = conversionSignatories.filter(
    (item) => item.signatory_type === "APPROVED_BY"
  );

  // ==========================================
  // RENDER
  // ==========================================

const isGroupedCompany =
  company_id === "FCH" ||
  company_id === "PSPMI";

const grandTotals = useMemo(() => {
  if (!isGroupedCompany) return null;

  return calculateTotals(reportData);
}, [isGroupedCompany, reportData]);

  return (
    <div
      ref={printRef}
      className="p-2 print-deductions print:bg-white print:shadow-none print:p-2"
    >
      {/* REPORT HEADER */}
      <div className="flex justify-between">
        <div>
          <h2 className="font-semibold uppercase">
            {companyData?.data?.[0]?.CompanyName ?? ""}.
          </h2>

          <h2>
            VL AND SL CREDITS PLUS SL CONVERSION
          </h2>

          <div>
            LEAVE CREDITS AS OF: {formatDate(asOfDate)}
          </div>

          <h2>
            Date: {formatDate(new Date())}
          </h2>
        </div>

        <div className="print:hidden">
          <button
            type="button"
            className="bg-blue-700 hover:bg-blue-600 px-8 py-2 text-white rounded"
            onClick={() => handlePrint()}
          >
            Print
          </button>
        </div>
      </div>

      {/* ======================================
          REPORT TABLES
         ====================================== */}

  
{/* ======================================
    REPORT TABLES
====================================== */}

<div className="py-4">

  {/* INDIVIDUAL REPORT SECTIONS */}
  {reportSections.map((section, index) => (
    <div
      key={section.title ?? "default"}
      className={
        index === 0
          ? "report-section"
          : "report-section mt-8"
      }
    >
      {section.title && (
        <h3 className="report-section-title mb-3 border-b border-gray-300 pb-2 text-sm font-bold uppercase text-gray-800">
          {section.title}
        </h3>
      )}

      <ConversionReportTable
        employees={section.employees}
      />
    </div>
  ))}

  {/* COMPANY GRAND TOTAL */}
  {isGroupedCompany && grandTotals && (
    <div className="mt-8">

      <h3 className="mb-3 text-sm font-bold uppercase text-gray-800">
        {company_id} GRAND TOTAL
      </h3>

      <div className="overflow-x-auto print:overflow-visible">

        <table className="w-full border-collapse bg-white">

          <tbody>
            <tr className="bg-gray-100 print:bg-gray-100">

              <td
                colSpan={3}
                className="border border-gray-300 p-3 font-bold"
              >
                GRAND TOTAL
              </td>

              {/* MONTHLY BASIC */}
              <td className="border border-gray-300 p-3 text-right font-bold">
                {formatCurrency(grandTotals.basic)}
              </td>

              {/* DAILY RATE */}
              <td className="border border-gray-300 p-3 text-right font-bold">
                {formatCurrency(grandTotals.daily)}
              </td>

              {/* EMPTY COLUMNS */}
              <td
                colSpan={4}
                className="border border-gray-300 p-3"
              />

              {/* AMOUNT FOR CONVERSION */}
              <td className="border border-gray-300 p-3 text-right font-bold">
                {formatCurrency(grandTotals.amount)}
              </td>

            </tr>
          </tbody>

        </table>

      </div>

    </div>
  )}

</div>


      {/* ======================================
          SIGNATORIES
          DISPLAY ONCE AT THE BOTTOM
         ====================================== */}

      <div className="signatory-section mt-4 grid grid-cols-3 px-4 py-4 text-xs">
        {/* PREPARED BY */}
        <div className="justify-self-start">
          <h2 className="font-semibold">
            PREPARED BY:
          </h2>

          {preparedBy.map((item) => (
            <p
              key={item.id}
              className="mt-10 uppercase"
            >
              {item.name}
            </p>
          ))}
        </div>

        {/* CHECKED BY */}
        <div className="justify-self-center">
          <h2 className="font-semibold">
            CHECKED BY:
          </h2>

          {checkedBy.map((item) => (
            <p
              key={item.id}
              className="mt-10 uppercase"
            >
              {item.name}
            </p>
          ))}
        </div>

        {/* APPROVED BY */}
        <div className="justify-self-end">
          <h2 className="font-semibold">
            APPROVED BY:
          </h2>

          {approvedBy.map((item) => (
            <p
              key={item.id}
              className="mt-10 uppercase"
            >
              {item.name}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}