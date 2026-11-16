"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Printer, RefreshCw } from "lucide-react";
import { useReactToPrint } from "react-to-print";

import GenButton from "@/app/components/Buttons";
import { ProcessingOverlay } from "@/app/ui/loader/ProcessingOverlay";

import {
  useFetchBranchesByCompany,
} from "@/app/hooks/useAllowance";

import {
  useCompaniesByCycle,
} from "@/app/hooks/useGeneral";

import {
  usePendingPayrollReport,
} from "@/app/hooks/usePayrollArchive";

import {
  PayrollArchiveEmployee,
} from "@/app/types/archiveTypes";

import ArchiveReportView from "./ArchiveReportView";
import ArchivePayrollPrintView from "./ArchivePayrollPrint";

type PendingPayrollReportModalProps = {
  cycleCategory: string;
};

export default function PendingPayrollReportModal({
  cycleCategory,
}: PendingPayrollReportModalProps) {
  // ==========================================
  // STATE
  // ==========================================

  const printRef = useRef<HTMLDivElement>(null);

  const [selectedCompany, setSelectedCompany] =
    useState<string>("");

  const [selectedBranch, setSelectedBranch] =
    useState<string>("");

  const [isPrinting, setIsPrinting] =
    useState(false);

  // ==========================================
  // GET COMPANIES
  // ==========================================

  const {
    data: company,
    isLoading: companiesLoading,
  } = useCompaniesByCycle(cycleCategory);

  const companies = company?.data ?? [];

  // ==========================================
  // DEFAULT COMPANY
  // ==========================================

  useEffect(() => {
    if (
      companies.length > 0 &&
      !selectedCompany
    ) {
      setSelectedCompany(
        companies[0].CompanyCode
      );
    }
  }, [companies, selectedCompany]);

  // ==========================================
  // GET BRANCHES
  // ==========================================

  const {
    data: branches = [],
  } = useFetchBranchesByCompany(
    selectedCompany
  );

  // ==========================================
  // SELECTED BRANCH
  // ==========================================

  const activeBranch =
    branches.length === 1
      ? branches[0].branchCode
      : selectedBranch;

  // ==========================================
  // GET PENDING PAYROLL REPORT
  // ==========================================

  const {
    data: report,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = usePendingPayrollReport(
    selectedCompany
  );

  // ==========================================
  // FILTER BRANCH GROUPS
  // ==========================================

  const filteredReport = useMemo(() => {
    if (!report) return null;

    if (!activeBranch) {
      return report;
    }

    const filterEmployees = (
      employees: PayrollArchiveEmployee[]
    ) => {
      return employees.filter(
        (emp) =>
          emp.branch === activeBranch ||
          emp.secondBranchId === activeBranch
      );
    };

    const filteredBranchGroups: Record<
      string,
      PayrollArchiveEmployee[]
    > = {};

    Object.entries(
      report.branchGroups ?? {}
    ).forEach(([branchCode, employees]) => {
      const filtered = filterEmployees(
        employees
      );

      if (filtered.length > 0) {
        filteredBranchGroups[branchCode] =
          filtered;
      }
    });

    return {
      ...report,

      boardEmployees: filterEmployees(
        report.boardEmployees ?? []
      ),

      mancomEmployees: filterEmployees(
        report.mancomEmployees ?? []
      ),

      holdingEmployees: filterEmployees(
        report.holdingEmployees ?? []
      ),

      branchGroups: filteredBranchGroups,
    };
  }, [report, activeBranch]);

  // ==========================================
  // GRAND TOTALS
  // ==========================================

 const grandTotals = useMemo(() => {
  if (!filteredReport) return null;

  const allEmployees: PayrollArchiveEmployee[] = [
    ...(filteredReport.boardEmployees ?? []),
    ...(filteredReport.mancomEmployees ?? []),
    ...(filteredReport.holdingEmployees ?? []),
    ...Object.values(
      filteredReport.branchGroups ?? {}
    ).flat(),
  ];

  // Remove duplicate employees
  const uniqueEmployees = Array.from(
    new Map(
      allEmployees.map((emp) => [emp.empCode, emp])
    ).values()
  );

  // Convert monetary values to centavos
  const toCents = (value: unknown): number => {
    const number = Number(value);

    return Number.isFinite(number)
      ? Math.round(number * 100)
      : 0;
  };

  const totals = uniqueEmployees.reduce(
    (acc, emp) => {
      acc.halfBasic += toCents(emp.halfBasic);
      acc.overtime += toCents(emp.overtime);

      // Late + Undertime
      acc.late +=
        toCents(emp.late) +
        toCents(emp.undertime);

      acc.absences += toCents(emp.absences);

      // Preserve actual employee payroll totals
      acc.total += toCents(emp.total);

      acc.pagibig += toCents(emp.pagIbigEmployeer);
      acc.sss += toCents(emp.sssEmployeer);
      acc.philhealth += toCents(emp.philhealthEmployeer);

      return acc;
    },
    {
      halfBasic: 0,
      overtime: 0,
      late: 0,
      absences: 0,
      total: 0,
      pagibig: 0,
      sss: 0,
      philhealth: 0,
    }
  );

  const calculatedNet =
    totals.halfBasic +
    totals.overtime -
    totals.late -
    totals.absences;

  const variance = totals.total - calculatedNet;

  if (variance !== 0) {
    console.warn("Payroll variance:", {
      calculatedNet: calculatedNet / 100,
      actualTotal: totals.total / 100,
      variance: variance / 100,
    });
  }

  return {
    halfBasic: totals.halfBasic / 100,
    overtime: totals.overtime / 100,
    late: totals.late / 100,
    absences: totals.absences / 100,
    total: totals.total / 100,
    pagibig: totals.pagibig / 100,
    sss: totals.sss / 100,
    philhealth: totals.philhealth / 100,
  };
}, [filteredReport]);

  // ==========================================
  // PRINT
  // ==========================================

  const handlePrint = useReactToPrint({
    contentRef: printRef,

    documentTitle:
      `Pending-Payroll-Report-${selectedCompany}`,

    onBeforePrint: async () => {
      setIsPrinting(true);
    },

    onAfterPrint: () => {
      setIsPrinting(false);
    },
  });

  // ==========================================
  // EMPLOYEE COUNT
  // ==========================================

  const employeeCount = useMemo(() => {
    if (!filteredReport) return 0;

    const allEmployees = [
      ...(filteredReport.boardEmployees ?? []),
      ...(filteredReport.mancomEmployees ?? []),
      ...(filteredReport.holdingEmployees ?? []),
      ...Object.values(
        filteredReport.branchGroups ?? {}
      ).flat(),
    ];

    return new Set(
      allEmployees.map(
        (emp) => emp.empCode
      )
    ).size;
  }, [filteredReport]);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-6">
      {/* PRINT OVERLAY */}

      {isPrinting && (
        <ProcessingOverlay
          title="Preparing Payroll Report"
          message="Please wait while we prepare the payroll report."
        />
      )}

      {/* HEADER */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Pending Payroll Report
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Employee payroll report from pending payroll records
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* REFRESH */}

            <GenButton
              variant="secondary"
              onClick={() => {
                void refetch();
              }}
              disabled={
                !selectedCompany ||
                isFetching
              }
              className="flex items-center gap-2"
            >
              <RefreshCw
                size={16}
                className={
                  isFetching
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </GenButton>

            {/* PRINT */}

            <GenButton
              variant="positive"
              onClick={() => {
                void handlePrint();
              }}
              disabled={
                !filteredReport ||
                isLoading ||
                isPrinting ||
                employeeCount === 0
              }
              className="flex items-center gap-2"
            >
              <Printer size={16} />

              Print All
            </GenButton>
          </div>
        </div>

        {/* FILTERS */}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* COMPANY */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Company
            </label>

            <select
              value={selectedCompany}
              onChange={(e) => {
                setSelectedCompany(
                  e.target.value
                );

                setSelectedBranch("");
              }}
              disabled={companiesLoading}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                Choose Company
              </option>

              {companies.map((item) => (
                <option
                  key={item.CompanyCode}
                  value={item.CompanyCode}
                >
                  {item.CompanyName}
                </option>
              ))}
            </select>
          </div>

          {/* BRANCH */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Branch
            </label>

            <select
              value={activeBranch}
              onChange={(e) => {
                setSelectedBranch(
                  e.target.value
                );
              }}
              disabled={
                !selectedCompany ||
                branches.length === 1
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            >
              <option value="">
                All Branches
              </option>

              {branches.map((branch) => (
                <option
                  key={branch.branchCode}
                  value={branch.branchCode}
                >
                  {branch.branchCode}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SUMMARY INFORMATION */}

        {filteredReport && (
          <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
            <span>
              <strong>Company:</strong>{" "}
              {filteredReport.summaries.company}
            </span>

            <span>
              <strong>Pay Cycle:</strong>{" "}
              {filteredReport.summaries.PayCycle ?? "N/A"}
            </span>

            <span>
              <strong>Employees:</strong>{" "}
              {employeeCount}
            </span>

            <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">
              PENDING
            </span>
          </div>
        )}
      </div>

      {/* LOADING */}

      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading pending payroll report...
        </div>
      )}

      {/* ERROR */}

      {isError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-5"
        >
          <h3 className="font-semibold text-red-700">
            Unable to load payroll report
          </h3>

          <p className="mt-1 text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred."}
          </p>
        </div>
      )}

      {/* EMPTY STATE */}

      {!isLoading &&
        !isError &&
        filteredReport &&
        employeeCount === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <h3 className="font-semibold text-slate-700">
              No pending payroll records
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              No employees were found for the selected company and branch.
            </p>
          </div>
        )}

      {/* REPORT */}

      {!isLoading &&
        !isError &&
        filteredReport &&
        grandTotals &&
        employeeCount > 0 && (
          <div className="print-wrapper">
            <h2 className="mb-6 text-center text-xl font-bold">
              PENDING PAYROLL REPORT
            </h2>

            {/* SCREEN VIEW */}

            <ArchiveReportView
              report={filteredReport}
              grandTotals={grandTotals}
            />

            {/* PRINT VIEW */}

            <div
              style={{
                position: "absolute",
                left: "-10000px",
                top: 0,
                width: "100%",
              }}
            >
              <div ref={printRef}>
                <ArchivePayrollPrintView
                  report={filteredReport}
                  grandTotals={grandTotals}
                />
              </div>
            </div>
          </div>
        )}
    </div>
  );
}