import Datatable from "@/app/components/Datatable";
import RequestModal from "@/app/components/Modal";
import { Pagination } from "@/app/components/Pagination";
import { useDebounce } from "@/app/helper/useDebounce";
import { useFetchSSSList } from "@/app/hooks/useStatutory";
import EditSSSData from "@/app/ModalContent/Statutory/EditSSSList";
import { Column } from "@/app/types/preparePayroll";
import { SSSProps } from "@/app/types/statutoryType";
import { Pencil } from "lucide-react";
import { useState } from "react";








export default function SSSPage(){

            const [selectedSSS,setSelectedSSS] = useState<SSSProps | null>(null);
            const [page, setPage] = useState(1);
            const PAGE_SIZE = 10;
            const [search, setSearch] = useState("");
            const debouncedSearch = useDebounce(search, 400);
            const [isModalOpen, setIsModalOpen] = useState(false);
            const { data: sss_data } = useFetchSSSList({
                        page,
                        limit: 10,
                        search: debouncedSearch,
                    });

            const tableData: SSSProps[] = sss_data?.data ?? [];


                    const columns: Column<SSSProps>[] = [
                        {
                            header: "id",
                            accessor: (row) => row.sss_contrib_id,
                          },
                                {
                                  header: "Start Range",
                                  accessor: (row) => row.start_range,
                                },
                                {
                                  header: "End Range",
                                  accessor: (row) => row.end_range,
                                },
                                {
                                  header: "Employer Share",
                                  accessor: (row) => row.employer_share,
                                  },
                                {
                                    header: "Employee Share",
                                    accessor: (row) => row.employee_share,
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
                
                
                
                            const openModal = (row:SSSProps) => {
                                setSelectedSSS(row);
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

        <div>
                
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
                        totalPages={sss_data?.meta.totalPages ?? 1}
                        totalItems={sss_data?.meta.total ?? 0}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                    />



            {isModalOpen && selectedSSS &&(
                <RequestModal size="xl" title={`SSS Contributions`} onClose={closeModal}>
                 <EditSSSData data={selectedSSS} onClose={closeModal} />
                </RequestModal>
              )}
          
                </div>

        </>
    );

}