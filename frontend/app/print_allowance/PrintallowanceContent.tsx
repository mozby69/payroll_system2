"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { usePrintBranch } from "../hooks/useAllowance";
import { formatMonthYear } from "../utils/DateFormatter";

export default function PrintAllowanceContent() {
  const searchParams = useSearchParams();

  const month = searchParams.get("month");
  const company = searchParams.get("company");
  const branch = searchParams.get("branch");

  const {
    data: printResponse,
    isLoading,
    isError,
    error,
  } = usePrintBranch(month, company, branch);

  const rows = useMemo(
    () => printResponse?.data ?? [],
    [printResponse?.data],
  );

  const hasPrinted = useRef(false);
  const rowCount = rows.length;

  useEffect(() => {
    if (hasPrinted.current || isLoading || rowCount === 0) {
      return;
    }

    hasPrinted.current = true;

    const timer = window.setTimeout(() => {
      window.print();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isLoading, rowCount]);

  if (!month || !company) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Month and company are required.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <p>Loading allowance data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          {error instanceof Error
            ? error.message
            : "Failed to load allowance data."}
        </p>
      </div>
    );
  }

  return (
    <main className="p-1">
      {rows.length === 0 ? (
        <p>No allowance records found.</p>
      ) : (
        <div className="mt-1 grid grid-cols-3 gap-2 text-[0.6rem]">
          {rows.map((row) => (
            <div
              key={row.EmpCodeId}
              className="border border-gray-800 p-2"
              style={{ breakInside: "avoid" }}
            >
              <div className="flex justify-between">
                <div className="font-semibold">
                  <p>EMPLOYEE NAME:</p>

                  <p className="mt-3 leading-tight">
                    RECEIVE THE FOLLOWING
                    <br />
                    FOR THE PERIOD COVERED
                  </p>

                  <p className="mt-2">CASH ASSISTANCE</p>
                  <p className="mt-2">ECOLA</p>
                  <p className="mt-2">ABSENCES</p>
                  <p className="mt-2">LOANS</p>
                  <p className="mt-2">TOTAL</p>
                  <p className="mt-2">RECEIVED BY</p>
                  <p className="mt-2">DATE</p>
                </div>

                <div className="text-right uppercase">
                  <p>{row.name}</p>

                  <p className="mt-4 font-semibold">
                    {formatMonthYear(month)}
                  </p>

                  <p className="mt-2">{row.cash_allowance}</p>
                  <p className="mt-2">{row.ecola}</p>
                  <p className="mt-2">{row.deduct}</p>
                  <p className="mt-2">{row.loan}</p>

                  <p className="mt-2 font-semibold">
                    {row.total}
                  </p>

                  <p className="mt-2 w-40 border-b">
                    &nbsp;
                  </p>

                  <p className="mt-2 w-40 border-b">
                    &nbsp;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}