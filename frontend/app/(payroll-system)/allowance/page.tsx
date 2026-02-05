"use client";
import Datatable from "@/app/components/Datatable";
import { AllowanceProps } from "@/app/types/allowanceType";
import { Column } from "@/app/types/preparePayroll";
import { useAllowanceSummary, useFetchAllowance, useSaveAllowance } from "@/app/hooks/useAllowance";
import { useState } from "react";
import { useDebounce } from "@/app/utils/useDebounce";
import { Pagination } from "@/app/components/Pagination";
import SweetAlert from "@/app/components/Swal";
import AllowanceArchiveTab from "@/app/components/allowance/archiveTab";


type AllowanceTab = "current" | "archive";


export default function AllowancePage(){
        const [activeTab, setActiveTab] = useState<AllowanceTab>("current");
        const PAGE_SIZE = 8;
        const [page, setPage] = useState(1);
        const [search, setSearch] = useState("");
        const debouncedSearch = useDebounce(search, 400);
        const [month, setMonth] = useState("");
        const saveAllowance = useSaveAllowance(month);
        const { data: allowance_data } = useFetchAllowance({
                page,
                limit: 8,
                search: debouncedSearch,
                month,
            });
        const tableData: AllowanceProps[] = allowance_data?.data ?? [];
        
        const { data: summary } = useAllowanceSummary(month);

        const handleSave = () => {
            SweetAlert.confirmationAlert(
            "Confirm Save Payroll",
            "Are you sure you want to save this payroll?",
            () => {
                saveAllowance.mutate();
            }
            );
        };
        
        

        const columns: Column<AllowanceProps>[] = [
            {
              header: "Employee",
              render: (row) => `${row.Firstname}, ${row.Lastname}`,
              footer: "TOTAL",
            },
            {
              header: "EMPCODE",
              accessor: (row) => row.EmpCode,
            },
            {
              header: "ABSENT",
              accessor: (row) => row.totalAbsentHours ?? '0',
            },
            {
              header: "Cash Allowance",
              render: (row) => `${row.cash_assistance}`,
              footer: `₱ ${summary?.cash_allowance.toFixed(2) ?? "0.00"}`,
            },
            {
              header: "Ecola",
              render: (row) => `${row.ecola}`,
              footer: `₱ ${summary?.ecola.toFixed(2) ?? "0.00"}`,
            },
            {
              header: "TOTAL",
              accessor: (row) => row.total ?? '0',
              footer: (
                <span className="text-lg font-bold">
                  ₱ {summary?.total.toFixed(2) ?? "0.00"}
                </span>
              ),
            },
          ];
          



      
    return(
        <>
            <div className="p-8">

            <div className="flex border-b border-slate-200 mb-6">
              <button onClick={() => setActiveTab("current")}
                className={`px-6 py-3 text-sm font-semibold transition
                  ${
                    activeTab === "current"
                      ? "border-b-2 border-blue-600 text-blue-700"
                      : "text-slate-500 hover:text-slate-700"
                  }`}>
                Employee Allowance
              </button>

              <button onClick={() => setActiveTab("archive")}
                className={`px-6 py-3 text-sm font-semibold transition
                  ${ activeTab === "archive"
                      ? "border-b-2 border-blue-600 text-blue-700"
                      : "text-slate-500 hover:text-slate-700"
                  }`}>
                Allowance Archive
              </button>
            </div>


            {activeTab === "current" && (
              <>
                  <div className="mb-4">
                      <h1 className="font-semibold text-xl text-gray-800">BENEFITS</h1>
                      <h1 className="text-md text-gray-600">Employees Allowance</h1>
                  </div>

                  <div className="flex justify-between py-4">
                      <div className="flex gap-x-4">
                          <input
                          type="text"
                          placeholder="Search..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-64 px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                          />  
                          <input
                          type="month"
                          value={month}
                          onChange={(e) => {
                              setMonth(e.target.value);
                              setPage(1);
                          }}
                          className="bg-gray-500 text-white py-2 px-4 rounded-lg shadow-lg"/>
                    </div>
                    <div>
                      <button onClick={handleSave} disabled={!month}
                          className="bg-sky-700 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed py-2.5 px-4 rounded-lg text-white shadow cursor-pointer">
                          Save Allowance
                      </button>
                    </div>
                  </div>

                
          
                  <Datatable columns={columns} data={tableData} showFooter/>
            
                  <Pagination
                      page={page}
                      totalPages={allowance_data?.meta.totalPages ?? 1}
                      totalItems={allowance_data?.meta.total ?? 0}
                      pageSize={PAGE_SIZE}
                      onPageChange={setPage}
                  />

              </>
              )}


        {activeTab === "archive" && (
          <AllowanceArchiveTab/>

        )}
                  
           </div>
        </>
    );


}