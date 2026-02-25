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
    <div className="p-6 w-[210mm] min-h-[297mm] bg-white text-black">

      <div className="flex justify-between">
        <h1 className="text-xl font-bold mb-4">
          Allowance – {month}
        </h1>
        <h2 className="mb-4">
          Company: {company} | Branch: {branch}
        </h2>
      </div>

    
      <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
        {list.map((row) => (
          <div key={row.EmpCodeId}
            className="border border-gray-800 p-3">

            <div className="flex justify-between">
              <div className="font-semibold">
                <h2 className="">EMPLOYEE NAME:</h2>
                <h2 className="mt-4 leading-tight">
                  RECEIVE THE FOLLOWING
                  <br />
                  FOR THE PERIOD COVERED
                </h2>
                <h2 className="mt-4">CASH ASSITANCE</h2>
                <h2 className="mt-3">ECOLA</h2>
                <h2 className="mt-3">TOTAL ABSENT</h2>
                <h2 className="mt-3">TOTAL LOAN</h2>
                <h2 className="mt-3">TOTAL</h2>
                <h2 className="mt-3">RECEIVED BY</h2>
                <h2 className="mt-3">DATE</h2>
              </div>

              <div className="text-right">
                <h2 className="">
                  {row.name}
                </h2>
                <h2 className="mt-5">
                  {formatMonthYear(month)}
                </h2>
                <h2 className="mt-5">{row.cash_allowance}</h2>
                <h2 className="mt-3">{row.ecola}</h2>
                <h2 className="mt-3">{row.deduct}</h2>
                <h2 className="mt-3">{row.loan}</h2>
                <h2 className="mt-3">{row.total}</h2>
                <h2 className="mt-3 border-b"><span className="invisible">s</span></h2>
                <h2 className="mt-3 border-b"><span className="invisible">s</span></h2>
              </div>

            </div>
          </div>
        ))}
      </div>
          
    
        </div>
  );
}