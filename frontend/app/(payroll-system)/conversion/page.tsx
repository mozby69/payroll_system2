'use client';
import Datatable from "@/app/components/Datatable";
import { Pagination } from "@/app/components/Pagination";
import { useDebounce } from "@/app/helper/useDebounce";
import { useFetchConversion } from "@/app/hooks/useConversion";
import { conversionProps } from "@/app/types/conversionType";
import { Column } from "@/app/types/preparePayroll";
import { Pencil } from "lucide-react";
import { useState } from "react";





export default function ConversionPage(){
        const [page, setPage] = useState(1);
        const PAGE_SIZE = 10;
        const [search, setSearch] = useState("");
        const debouncedSearch = useDebounce(search, 400);
        //const [isModalOpen, setIsModalOpen] = useState(false);
      
        const { data: pagibig_data } = useFetchConversion({
                            page,
                            limit: 10,
                            search: debouncedSearch,
                        });
    
        const tableData: conversionProps[] = pagibig_data?.data ?? []; 
        
        
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
                    render: (row) => (
                      <div className="flex gap-2">
                        <button
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

                               <button className="py-2 px-6 shadow-md rounded-lg bg-green-700 text-white hover:bg-green-600">Generate</button>
                        </div>
                               
             
                            <Datatable columns={columns} data={tableData}/>
           
                             <Pagination
                                   page={page}
                                   totalPages={pagibig_data?.meta.totalPages ?? 1}
                                   totalItems={pagibig_data?.meta.total ?? 0}
                                   pageSize={PAGE_SIZE}
                                   onPageChange={setPage}
                               />
   
   
                </div>    
                                         
           </>
       );
}