




'use client';
import Datatable from "@/app/components/Datatable";
import RequestModal from "@/app/components/Modal";
import { Pagination } from "@/app/components/Pagination";
import SweetAlert from "@/app/components/Swal";
import { useDebounce } from "@/app/helper/useDebounce";
import { useFetchConversion } from "@/app/hooks/useConversion";
import { useImportAttendanceCount } from "@/app/hooks/usePreparePayroll";
import EditLeave from "@/app/ModalContent/Conversion/EditLeave";
import { conversionProps } from "@/app/types/conversionType";
import { Column } from "@/app/types/preparePayroll";
import { Pencil } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";




export default function ConversionPage(){
        const [page, setPage] = useState(1);
        const PAGE_SIZE = 10;
        const [search, setSearch] = useState("");
        const debouncedSearch = useDebounce(search, 400);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [hasGenerated, setHasGenerated] = useState(false);
        const {data: pagibig_data,} = useFetchConversion({page,limit: 10,search: debouncedSearch},hasGenerated);
    
        const {mutate: generateAttendance,isPending} = useImportAttendanceCount();

        const tableData: conversionProps[] = pagibig_data?.data ?? []; 

        const handleGenerate = () => {
            SweetAlert.loadingAlert(
              "Generating Conversion...",
              "Please wait while processing data."
            );
          
            generateAttendance(undefined, {
              onSuccess: () => {
                Swal.close();
                setHasGenerated(true);
          
                Swal.fire({
                  icon: "success",
                  title: "Success",
                  text: "Conversion generated successfully.",
                });
              },
              onError: (err) => {
                Swal.close();
                Swal.fire({
                  icon: "error",
                  title: "Import Failed",
                  text: err.message,
                });
              },
            });
          };
        
         const columns: Column<conversionProps>[] = [
                {
                    header: "EmpCode",
                    accessor: (row) => row.EmpCode,
                },
                {
                  header: "Name",
                  render: (row) => `${row.lastname}, ${row.firstname}`,
                },
                  {
                  header: "Vacation Leave",
                  render: (row) => `${row.vacation}`,
                },
                {
                  header: "Sick Leave",
                  render: (row) => `${row.sick}`,
                },
                 {
                  header: "Amount",
                  render: (row) => `${row.total}`,
                },
              {
                    header:"Actions",
                    render: () => (
                      <div className="flex gap-2">
                        <button
                        onClick={() => openModal()}
                        className="px-3 py-2.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded">
                        <Pencil/>
                        </button>
                      </div>
                    ),
                  }
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

                   <div className="py-8">
                      <h1 className="font-semibold text-xl text-gray-800">BENEFITS</h1>
                      <h1 className="text-md text-gray-600">Employees Leave Conversion</h1>
                  </div>

                        <div className="mb-4 flex justify-between">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-64 px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                               />  

                            <button
                            onClick={handleGenerate}
                            disabled={isPending}
                            className="py-2 px-6 shadow-md rounded-lg bg-green-700 text-white hover:bg-green-600 disabled:opacity-50"
                            >
                            {isPending ? "Generating..." : "Generate"}
                            </button>
                        </div>
                               
             
                        {!hasGenerated ? (
                        <div className="p-10 text-center text-gray-500 border border-gray-300 rounded-lg bg-gray-50">
                            Click <span className="font-semibold">Generate</span> to load conversion data.
                        </div>
                        ) : (
                        <>
                            <Datatable columns={columns} data={tableData} />
                            <Pagination
                            page={page}
                            totalPages={pagibig_data?.meta.totalPages ?? 1}
                            totalItems={pagibig_data?.meta.total ?? 0}
                            pageSize={PAGE_SIZE}
                            onPageChange={setPage}
                            />
                        </>
                        )}




                {isModalOpen && (
                    <RequestModal size="xxl" title={`EDIT LEAVE`} onClose={closeModal}>
                        <EditLeave/>
                    </RequestModal>
                    )}

   
   
                </div>    
                                         
           </>
       );
}