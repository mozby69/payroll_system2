import Datatable from "@/app/components/Datatable";
import RequestModal from "@/app/components/Modal";
import { Pagination } from "@/app/components/Pagination";
import { useDebounce } from "@/app/helper/useDebounce";
import { useFetchPagibigList } from "@/app/hooks/useStatutory";
import EditPagibigData from "@/app/ModalContent/Statutory/EditPagibig";
import { Column } from "@/app/types/preparePayroll";
import { PagibigProps } from "@/app/types/statutoryType";
import { Pencil } from "lucide-react";
import { useState } from "react";



export default function PagibigPage(){
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 400);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPagibig,setSelectedPagibig] = useState<PagibigProps | null>(null);
    const { data: pagibig_data } = useFetchPagibigList({
                        page,
                        limit: 10,
                        search: debouncedSearch,
                    });

    const tableData: PagibigProps[] = pagibig_data?.data ?? [];    
    
    
    const columns: Column<PagibigProps>[] = [
                {
                    header: "EmpCode",
                    accessor: (row) => row.EmpCodeId,
                },
                {
                  header: "Name",
                  accessor: (row) => row.Name,
                },
                {
                  header: "Employee Share",
                  accessor: (row) => row.pagibig_employee_share,
                },
                {
                    header: "Employer Share",
                    accessor: (row) => row.pagibig_employer_share,
                },
                {
                    header:"Actions",
                    render: (row) => (
                      <div className="flex gap-2">
                        <button
                        onClick={() => openModal(row)}
                        className="px-3 py-2.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded">
                        <Pencil/>
                        </button>
                      </div>
                    ),
                  }
             
];



                const openModal = (row:PagibigProps) => {
                    setSelectedPagibig(row);
                    setIsModalOpen(true);
                };
                        
                const closeModal = () => {
                    setIsModalOpen(false);
                };

                const handleSearchChange = (value: string) => {
                  setSearch(value);
                  setPage(1);
                };
          

    return(
        <>

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
                                totalPages={pagibig_data?.meta.totalPages ?? 1}
                                totalItems={pagibig_data?.meta.total ?? 0}
                                pageSize={PAGE_SIZE}
                                onPageChange={setPage}
                            />


                                {isModalOpen && selectedPagibig &&(
                                            <RequestModal size="xl" title={`Pagibig Contributions`} onClose={closeModal}>
                                             <EditPagibigData data={selectedPagibig} onClose={closeModal} />
                                            </RequestModal>
                                          )}
                                      
        </>
    );
}