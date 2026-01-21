"use client";

import { useState } from "react";
import { Delete, File, Filter, Printer, Trash, Trash2, View, X } from "lucide-react";
import FilterModal from "../../components/Filter";
import { useEmployees } from "../../hooks/employees";


export default function EmployeeList() {
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading, isError } = useEmployees(page, limit);


    const [open, setOpen] = useState(false);

    const [filters, setFilters] = useState({
        department: [],
        company: [],
        status: [],
    });

    const removeFilter = (key: keyof typeof filters, value: string) => {
        setFilters((prev) => ({
        ...prev,
        [key]: prev[key].filter((v) => v !== value),
        }));
    };

    const clearAll = () => {
        setFilters({
        department: [],
        company: [],
        status: [],
        });
    };

  return (
    <div className="relative w-full min-h-screen flex flex-col gap-y-4 py-8 items-center  text-mainGray">
      <div className="w-[95%] flex flex-col gap-y-8">


        <div className=" flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="font-bold text-2xl ">Employee</h1>
            <p className="text-sm text-mainLightGray">Complete list of employees</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <input
              placeholder="Search..."
              className="px-4 py-2 rounded-md bg-mainNeutral w-full"
            />

            <button
              onClick={() => setOpen(true)}
              className="bg-mainhighlight text-white px-4 py-2 rounded-md flex gap-2 cursor-pointer"
            >
              <Filter size={18} />
              Filter
            </button>
          </div>

 
        </div>


        {(Object.values(filters).flat().length > 0) && (
          <div className="flex flex-wrap gap-x-3 mt-4 justify-start items-center">
            <span className="text-sm font-medium">Filters</span>

            {Object.entries(filters).map(([key, values]) =>
              values.map((value) => (
                <span
                  key={`${key}-${value}`}
                  className="flex items-center justify-end gap-2 bg-mainBg text-white px-3 py-1 rounded-full text-md"
                >
                  {value}
                  <button onClick={() => removeFilter(key as any, value)}>
                    <X size={14} />
                  </button>
                </span>
              ))
            )}

            <button
              onClick={clearAll}
              className="text-sm font-bold text-mainBg underline ml-2 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}

        <table className="w-full border-separate border-spacing-0 rounded-t-xl overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.25)]">
  
            <thead className="sticky top-0 bg-mainDark text-white z-10">
                <tr>
                <th className="p-4 text-left">EmpCode</th>
                <th className="p-4 text-left">Full Name</th>
                <th className="p-4 text-left">Branch</th>
                <th className="p-4 text-left">Department</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
                </tr>
            </thead>


            <tbody className="text-mainGray">
   
                {isLoading && (
                <tr>
                    <td colSpan={6} className="p-6 text-center text-mainDark">
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

                {!isLoading && !isError && data?.data.length === 0 && (
                <tr>
                    <td colSpan={6} className="p-6 text-center text-mainDark">
                    No employees found
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

                    <td className="p-4">{emp.BranchCode ?? "-"}</td>

                    <td className="p-4">{emp.Department ?? "-"}</td>

                    <td className="p-4">{emp.EmploymentStatus}</td>

                    <td className="p-4">
                        <ul className="flex gap-4">
                        <li className="text-mainBg cursor-pointer">
                            <View />
                        </li>
                        <li className="text-negative cursor-pointer">
                            <Trash2 />
                        </li>
                        </ul>
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
                <button
                    disabled={data.meta.page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1 rounded bg-mainNeutral disabled:opacity-50"
                >
                    Prev
                </button>

                <button
                    disabled={data.meta.page === data.meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 rounded bg-mainNeutral disabled:opacity-50"
                >
                    Next
                </button>
                </div>
            </div>
        )}


      </div>

      {/* Modal */}
      <FilterModal
        open={open}
        onClose={() => setOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
}
