"use client";
import Datatable from "@/app/components/Datatable";
import { AllowanceProps } from "@/app/types/allowanceType";
import { Column } from "@/app/types/preparePayroll";
import {  useFetchAllowance, useSaveAllowance } from "@/app/hooks/useAllowance";
import {  useState } from "react";
import { useDebounce } from "@/app/utils/useDebounce";
import { Pagination } from "@/app/components/Pagination";
import SweetAlert from "@/app/components/Swal";
import AllowanceArchiveTab from "@/app/components/allowance/archiveTab";
import { TabItem, Tabs } from "@/app/components/Tab";
import RequestModal from "@/app/components/Modal";
import ViewAllList from "@/app/ModalContent/Allowance/ViewAllList";



type AllowanceTab = "current" | "archive";


export default function AllowancePage(){
        const [activeTab, setActiveTab] = useState<AllowanceTab>("current");
        const PAGE_SIZE = 10;
        const [page, setPage] = useState(1);
        const [search, setSearch] = useState("");
        const debouncedSearch = useDebounce(search, 400);
        const [month, setMonth] = useState("");
        const saveAllowance = useSaveAllowance(month);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const { data: allowance_data } = useFetchAllowance({
                page,
                limit: 10,
                search: debouncedSearch,
                month,
            });
        const tableData: AllowanceProps[] = allowance_data?.data ?? [];

      
        
        //const { data: summary } = useAllowanceSummary(month);

      

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
              render: (row) => `${row.Lastname}, ${row.Firstname}`,

            },
            {
              header: "EMPCODE",
              accessor: (row) => row.EmpCode,
            },
            {
              header: "DEDUCTIONS",
              accessor: (row) => row.deduct ?? '0',
            },
            {
              header: "Cash Allowance",
              render: (row) => `${row.cash_assistance}`,
           
            },
            {
              header: "Ecola",
              render: (row) => `${row.ecola}`,
      
            },
            {
              header: "Loan",
              render: (row) => `${row.loan ?? '0'}`,
      
            },
            {
              header:"TOTAL DEDUCTION",
              render: (row) => `${row.totalDeduction}`,
           
            },
            {
              header: "TOTAL",
              accessor: (row) => row.total ?? '0',
            
            },
          ];
          

          const tabs: TabItem<AllowanceTab>[] = [
            { key: "current", label: "Employee Allowance" },
            { key: "archive", label: "Allowance Archive" },
          ];

          const handleSearchChange = (value: string) => {
            setSearch(value);
            setPage(1);
          };



          const openModal = () => {
              setIsModalOpen(true);
            };
          
            const closeModal = () => {
              setIsModalOpen(false);
            };

      
    return(
        <>
            <div className="p-8">

            <Tabs
              activeTab={activeTab}
              onChange={setActiveTab}
              tabs={tabs}
            />

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
                          onChange={(e) => handleSearchChange(e.target.value)}
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

                    <div className="flex gap-x-2">
                      <button onClick={openModal} disabled={!month}
                       className="bg-cyan-800 hover:bg-cyan-600 text-white py-2.5 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                        View
                      </button>
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
              

                {isModalOpen && (
                            <RequestModal size="xxl" title={`VIEW ALL`} onClose={closeModal}>
                                <ViewAllList selectedMonth={month}/>
                            </RequestModal>
                          )}


                  
           </div>
        </>
    );


}