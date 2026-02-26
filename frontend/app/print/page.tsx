"use client";

import { useSearchParams } from "next/navigation";
import { usePrintBranch } from "@/app/hooks/useAllowance";



export default function AllowancePrintPage() {
  const searchParams = useSearchParams();

  const month = searchParams.get("month");
  const company = searchParams.get("company");
  const branch = searchParams.get("branch");

  const { data, isLoading } = usePrintBranch(
    month,
    company,
    branch
  );

  if (isLoading) return <div>Loading...</div>;

  const list = data?.data ?? [];

  function formatMonthYear(value: string | null): string {
    if (!value) return "";
  
    const [year, month] = value.split("-");
  
    const date = new Date(Number(year), Number(month) - 1);
  
    return date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="py-0 px-2 w-[210mm] min-h-[297mm] bg-white text-black" style={{ pageBreakAfter: "always" }}>

      <div className="text-center">
        <span className="font-semibold">BRANCH:</span> {branch}
      </div>

  
      <div className="grid grid-cols-2 gap-4 mt-4 text-[.7rem]">
        {list.map((row) => (
          <div
            key={row.EmpCodeId}
            className="border border-gray-800 p-3"
            style={{
              breakInside: "avoid",
              pageBreakInside: "avoid",
            }}
          >
            <div className="flex justify-between">
              <div className="font-semibold">
                <h2>EMPLOYEE NAME:</h2>
                <h2 className="mt-3 leading-tight">RECEIVE THE FOLLOWING<br />FOR THE PERIOD COVERED</h2>
                <h2 className="mt-2">CASH ASSISTANCE</h2>
                <h2 className="mt-3">ECOLA</h2>
                <h2 className="mt-2">TOTAL ABSENT</h2>
                <h2 className="mt-2">TOTAL LOAN</h2>
                <h2 className="mt-2">TOTAL</h2>
                <h2 className="mt-2">RECEIVED BY</h2>
                <h2 className="mt-2">DATE</h2>
              </div>
  
              <div className="text-right">
                <h2>{row.name}</h2>
                <h2 className="mt-4 font-semibold">{formatMonthYear(month)}</h2>
                <h2 className="mt-3">{row.cash_allowance}</h2>
                <h2 className="mt-3">{row.ecola}</h2>
                <h2 className="mt-2">-{row.deduct}</h2>
                <h2 className="mt-2">-{row.loan}</h2>
                <h2 className="mt-2 font-semibold">{row.total}</h2>
                <h2 className="mt-2 border-b w-40"><span className="invisible">s</span></h2>
                <h2 className="mt-2 border-b w-40"><span className="invisible">s</span></h2>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  }