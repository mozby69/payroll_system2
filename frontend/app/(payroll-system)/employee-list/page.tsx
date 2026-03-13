"use client";

import { Filter, IndentIncreaseIcon, View } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEmployees } from "../../hooks/employees";
import FilterModal from "../../components/Filter";
import ActiveFilters from "@/app/components/FilterObject";
import GenButton from "@/app/components/Buttons";
import { useState } from "react";
import { FilterProvider, useFilters } from "@/app/components/FilterContext";
import EmpIncrease from "@/app/components/empList/empIncrease";


const FILTER_KEYS = ["department", "company", "status"] as const;

function EmployeeListContent() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters } = useFilters();
 

  const search = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page") ?? 1);
  const limit = 10;

  const { data, isLoading, isError } = useEmployees(
    page,
    limit,
    search,
    filters
  );

  const [open, setOpen] = useState(false);
  const [openSalary, setOpenSalary] = useState(false);

  const updateParams = (fn: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    fn(params);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSearch = (value: string) => {
    updateParams(params => {
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }

      params.set("page", "1");
    });
  };
  
  const goToPage = (p: number) => {
    updateParams((params) => {
      params.set("page", String(p));
    });
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center py-8 text-mainGray">
      <div className="w-[95%] flex flex-col gap-y-8">

        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Employee</h1>
            <p className="text-sm text-mainLightGray">
              Complete list of employees
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="px-4 py-2 rounded-md bg-mainNeutral w-full"
            />

            <GenButton variant="primary" onClick={() => setOpen(true)}>
              <Filter size={16} /> Filter
            </GenButton>

            <div className="w-full inline-flex justify-end">
              <GenButton variant="main" className="w-full" onClick={()=>setOpenSalary(true)}>
                <IndentIncreaseIcon size={16}/> Salary Increase
              </GenButton>
            </div>
          </div>
        </div>

        <ActiveFilters />

        <table className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow-lg">
          <thead className="bg-mainDark text-white">
            <tr>
              <th className="p-4 text-left">EmpCode</th>
              <th className="p-4 text-left">Full Name</th>
              <th className="p-4 text-left">Branch</th>
              <th className="p-4 text-left">Department</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Basic Salary</th>
              <th className="p-4 text-left">Actions</th>
              
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  Loading employees...
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-red-500">
                  Failed to load employees
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              data?.data.map((emp) => (
                <tr
                  key={emp.EmpCode}
                  className="odd:bg-mainLight even:bg-mainNeutral"
                >
                  <td className="p-4">{emp.EmpCode}</td>
                  <td className="p-4">
                    {emp.Lastname}, {emp.Firstname} {emp.Middlename}
                  </td>
                  <td className="p-4">{emp.BranchCode?.branchCode ?? "-"}</td>
                  <td className="p-4">{emp.Department ?? "-"}</td>
                  <td className="p-4">{emp.EmploymentStatus}</td>
                  <td className="p-4">
                    {emp.employeepayroll?.basic_salary
                      ? new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                        }).format(emp.employeepayroll.basic_salary)
                      : "-"}
                  </td>
                  <td className="p-4">
                    <GenButton
                      variant="outline"
                      onClick={() =>
                        router.push(`/profile/${emp.EmpCode}`)
                      }
                    >
                      <View size={16} /> Details
                    </GenButton>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {data && (
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm">
              Page {data.meta.page} of {data.meta.totalPages}
            </span>

            <div className="flex gap-2">
              <GenButton
                variant="secondary"
                disabled={page === 1}
                onClick={() => goToPage(page - 1)}
              >
                Prev
              </GenButton>

              <GenButton
                variant="secondary"
                disabled={page === data.meta.totalPages}
                onClick={() => goToPage(page + 1)}
              >
                Next
              </GenButton>
            </div>
          </div>
        )}
      </div>

      <FilterModal open={open} onClose={() => setOpen(false)} />

      <EmpIncrease open={openSalary} onClose={() => setOpenSalary(false)} />
    </div>
  );
}

export default function EmployeeList() {
  return (
    <FilterProvider filterKeys={FILTER_KEYS}>
      <EmployeeListContent />
    </FilterProvider>
  );
}
