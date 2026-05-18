"use client";
import Datatable from "@/app/components/Datatable";
import RequestModal from "@/app/components/Modal";
import { Pagination } from "@/app/components/Pagination";
import { useDebounce } from "@/app/helper/useDebounce";
import { useFetchWtaxComputationList } from "@/app/hooks/useStatutory";
import WtaxComputationModal from "@/app/ModalContent/Statutory/WtaxComputationModal";
import { Column } from "@/app/types/preparePayroll";
import { WtaxComputationListProps } from "@/app/types/statutoryType";
import { FileText } from "lucide-react";
import { useState } from "react";





export default function WtaxComputation(){
        const [page, setPage] = useState(1);
        const PAGE_SIZE = 5;
        const [search, setSearch] = useState("");
        const debouncedSearch = useDebounce(search, 400);
        const [isModal,setIsModal] = useState(false);
        const [selectedWtaxData,setSelectedWtaxData] = useState<WtaxComputationListProps | null>(null);
        const { data: wtax_list_data } = useFetchWtaxComputationList({page,limit: PAGE_SIZE,search: debouncedSearch,});


        const tableData: WtaxComputationListProps[] = wtax_list_data?.data ?? [];    

        const columns: Column<WtaxComputationListProps>[] = [
            {
                header: "EmpCode",
                accessor: (row) => row.EmpCode,
            },
            {
                header: "Name",
                accessor: (row) => row.Name,
            },
            {
                header:"Actions",
                render: (row) => (
                    <div className="flex gap-2">
                    <button
                    onClick={() => openModal(row)}
                    className="px-3 py-2.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded">
                    <FileText/>
                    </button>
                    </div>
                ),
                }
            
            ];


            const openModal = (row:WtaxComputationListProps) => {
                setIsModal(true);
                setSelectedWtaxData(row);
            };

            const handleSearchChange = (value: string) => {
                setSearch(value);
                setPage(1);
            };

                const closeModal = () => {
                setIsModal(false);
            };
          


    return(

            <div className="p-2">

  
                <div className="py-4">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-64 px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />  
                </div>
                    

                <Datatable columns={columns} data={tableData}/>
                
                <Pagination
                    page={page}
                    totalPages={wtax_list_data?.meta?.totalPages ?? 1}
                    totalItems={wtax_list_data?.meta?.total ?? 0}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
                />


            { isModal && selectedWtaxData &&(
                <RequestModal size="xxxl" title={`Wtax Contributions`} onClose={closeModal}>
                    <WtaxComputationModal data={selectedWtaxData}/>
                </RequestModal>
                )}



            </div>


    );
}