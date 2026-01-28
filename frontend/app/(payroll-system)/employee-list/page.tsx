
"use client";

import { Filter, View } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEmployees } from "../../hooks/employees";
import FilterModal from "../../components/Filter";
import ActiveFilters from "@/app/components/FilterObject";
import GenButton from "@/app/components/Buttons";
import { useEffect, useRef, useState } from "react";

export default function EmployeeList() {
    
    const didInit = useRef(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const search = searchParams.get("search") ?? "";
    const page = Number(searchParams.get("page") ?? 1);
    const limit = 10;


    const filters = {
        department: searchParams.getAll("department"),
        company: searchParams.getAll("company"),
        status: searchParams.getAll("status"),
    };


    const { data, isLoading, isError } = useEmployees(
        page,
        limit,
        search,
        filters
    );

    const [open, setOpen] = useState(false);

    const updateParams = (fn: (params: URLSearchParams) => void) => {
        const params = new URLSearchParams(searchParams.toString());
        fn(params);
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    const handleSearch = (value: string) => {
        updateParams((params) => {
        value ? params.set("search", value) : params.delete("search");
        params.set("page", "1");
        });
    };

    const goToPage = (p: number) => {
        updateParams((params) => {
        params.set("page", String(p));
        });
    };

    const toggleFilter = (key: string, value: string) => {
        updateParams((params) => {
        const values = params.getAll(key);

        params.delete(key);
        if (!values.includes(value)) {
            [...values, value].forEach((v) => params.append(key, v));
        } else {
            values.filter((v) => v !== value).forEach((v) => params.append(key, v));
        }

        params.set("page", "1");
        });
    };

    const removeFilter = (key: string, value: string) => {
        updateParams((params) => {
        const values = params.getAll(key).filter((v) => v !== value);
        params.delete(key);
        values.forEach((v) => params.append(key, v));
        });
    };


    const clearAll = () => {
        updateParams((params) => {
        ["department", "company", "status"].forEach((k) => params.delete(k));
        params.set("page", "1");
        });
    };


    // useEffect(() => {
    // if (didInit.current) return;
    // didInit.current = true;

    // const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;

    // if (nav?.type === "reload") {
    //     const params = new URLSearchParams(searchParams.toString());
    //     params.set("page", "1");
    //     router.replace(`?${params.toString()}`, { scroll: false });
    // }
    // }, [router, searchParams]);




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
          </div>
        </div>

        <ActiveFilters
          filters={filters}
          onRemove={removeFilter}
          onClearAll={clearAll}
        />

        <table className="w-full border-separate border-spacing-0 rounded-xl overflow-hidden shadow-lg">
          <thead className="bg-mainDark text-white">
            <tr>
              <th className="p-4 text-left">EmpCode</th>
              <th className="p-4 text-left">Full Name</th>
              <th className="p-4 text-left">Branch</th>
              <th className="p-4 text-left">Department</th>
              <th className="p-4 text-left">Status</th>
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
                <tr key={emp.EmpCode} className="odd:bg-mainLight even:bg-mainNeutral">
                  <td className="p-4">{emp.EmpCode}</td>
                  <td className="p-4">
                    {emp.Lastname}, {emp.Firstname} {emp.Middlename}
                  </td>
                  <td className="p-4">{emp.BranchCode ?? "-"}</td>
                  <td className="p-4">{emp.Department ?? "-"}</td>
                  <td className="p-4">{emp.EmploymentStatus}</td>
                  <td className="p-4">
                    <GenButton
                      variant="outline"
                      onClick={() => router.push(`/profile/${emp.EmpCode}`)}
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
              <GenButton variant="secondary"
                disabled={page === 1} onClick={() => goToPage(page - 1)}
                className="px-3 py-1 rounded disabled:opacity-50"
              >
                Prev
              </GenButton>

              <GenButton variant="secondary"
                disabled={page === data.meta.totalPages}
                onClick={() => goToPage(page + 1)}
                className="px-3 py-1 rounded disabled:opacity-50"
              >
                Next
              </GenButton>
            </div>
          </div>
        )}
      </div>

      <FilterModal
        open={open}
        onClose={() => setOpen(false)}
        filters={filters}
        onToggle={toggleFilter}
      />
    </div>
  );
}
