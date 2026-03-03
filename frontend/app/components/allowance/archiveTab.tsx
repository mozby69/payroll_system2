import { useFetchAllowanceSummary } from "@/app/hooks/useAllowance";
import { AllowanceSummary } from "@/app/types/allowanceType";
import { useDebounce } from "@/app/utils/useDebounce";
import { useState } from "react";
import Datatable from "../Datatable";
import { Column } from "@/app/types/preparePayroll";
import { FileText, Printer } from "lucide-react";
import RequestModal from "../Modal";
import { ViewEmployeeListAllowance } from "@/app/ModalContent/Allowance/ViewEmployeeList";
import { Pagination } from "../Pagination";

import CompanyBranchSelector from "@/app/ModalContent/Allowance/ViewPrint";




export default function AllowanceArchiveTab(){
            const PAGE_SIZE = 5;
            const [page, setPage] = useState(1);
            const [search, setSearch] = useState("");
            const [isModalOpen, setIsModalOpen] = useState(false);
            const [isModalOpenPrint, setIsModalOpenPrint] = useState(false);
            const debouncedSearch = useDebounce(search, 400);
            const [selectedRow, setSelectedRow] = useState<AllowanceSummary | null>(null);
       

            const { data: allowance_data } = useFetchAllowanceSummary({
                            page,
                            limit: 5,
                            search: debouncedSearch,
                            
                        });

             const tableData: AllowanceSummary[] = allowance_data?.data ?? [];


               const columns: Column<AllowanceSummary>[] = [
                         {
                           header: "Allowance name",
                           accessor: (row) => row.allowance_name ?? '0',
                         },
                         {
                            header: "Total cash allowance",
                            accessor: (row) => row.total_cash_allowance ?? '0',
                          },
                          {
                            header: "Total ecola",
                            accessor: (row) => row.total_ecola ?? '0',
                          },
                          {
                            header: "Total Deduction",
                            accessor: (row) => row.totalDeduction ?? '0',
                          },
                          {
                            header: "Grand total",
                            accessor: (row) => row.grand_total ?? '0',
                          },
                          {
                            header:"Actions",
                            render: (row) => (
                              <div className="flex gap-2">
                                <button
                                onClick={ () => openModal(row)}
                                className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-500 hover:cursor-pointer text-white rounded">
                                <FileText/>
                                </button>

                                <button
                                  onClick={() => {openModalPrint(row) }}
                                  className="px-3 py-2 text-sm bg-cyan-800 hover:bg-cyan-600 hover:cursor-pointer text-white rounded">
                                 <Printer/>
                                </button>
                              </div>
                            ),
                          }
                          
                       ];
                       
                  const openModal = (row: AllowanceSummary) => {
                    setSelectedRow(row);
                    setIsModalOpen(true);
                  };

                  const closeModal = () => {
                    setIsModalOpen(false);
                    setSelectedRow(null);
                  };

                  const openModalPrint = (row:AllowanceSummary) => {
                    setSelectedRow(row);
                    setIsModalOpenPrint(true);
                  };
                  

                  const closeModalPrint = () => {
                    setIsModalOpenPrint(false);
                  };
            

            return(
        
                <div className="p-4">

                    <input
                      type="text"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-64 px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />  


                    <div className="py-4">
                      <Datatable columns={columns} data={tableData}/>
                      <Pagination
                        page={page}
                        totalPages={allowance_data?.meta.totalPages ?? 1}
                        totalItems={allowance_data?.meta.total ?? 0}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                      />
                    </div>
                   



            {isModalOpen && selectedRow && (
                <RequestModal size="xxxl" title={`Employee Allowance List`} onClose={closeModal}>
                  <ViewEmployeeListAllowance
                    allowanceSummary={selectedRow}
                    onClose={closeModal}
                  />
                </RequestModal>
              )}


          {isModalOpenPrint && (
              <RequestModal size="sm" title={`PRINT ALLOWANCE`} onClose={closeModalPrint}>
                  <CompanyBranchSelector selectedMonth={selectedRow?.selectedMonth ?? ""}/>
              </RequestModal>
            )}


                </div>
                
            );
}