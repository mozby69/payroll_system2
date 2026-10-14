"use client";
import Datatable from "@/app/components/Datatable";
import RequestModal from "@/app/components/Modal";
import { Pagination } from "@/app/components/Pagination";
import { useDebounce } from "@/app/helper/useDebounce";
import { ManualPayrollProps, useGetExistingPaycode, useManualPayrollList } from "@/app/hooks/useManualPayroll";
import CreatePayroll from "@/app/ModalContent/ManualPayroll/CreatePayroll";
import ViewExistingPaycode from "@/app/ModalContent/ManualPayroll/ViewExisintingPaycode";
import { Column } from "@/app/types/preparePayroll";
import { useState } from "react";





export default function ManualPayroll() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);

    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 400);
    //const [selectedData,setSelectedData] = useState<ManualPayrollProps | null>(null);
    const { data: data_list } = useManualPayrollList({
        page,
        limit: 10,
        search: debouncedSearch,
    });

    const tableData: ManualPayrollProps[] = data_list?.data ?? [];


    const columns: Column<ManualPayrollProps>[] = [
        {
            header: "EmpCode",
            accessor: (row) => row.EmpCodeId,
        },
        {
            header: "Name",
            accessor: (row) => row.Name,
        },
        {
            header: "Paycode",
            accessor: (row) => row.paycode,
        },
        {
            header: "Cycle",
            accessor: (row) => row.cycle,
        },
        {
            header: "Payroll Period",
            accessor: (row) => row.payroll_period,
        },
         {
            header: "Branch",
            accessor: (row) => row.branch,
        },

    ];

    const { data: existing_paycode = [] } = useGetExistingPaycode();


    const handleCloseModal = () => (
        setIsModalOpen(false)
    );

    const handleCloseModal2 = () => (
        setIsModalOpen2(false)
    );



    console.log(existing_paycode);


    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };


    return (
        <div className="py-4 px-8">



            <div className="py-4">
                <h1 className="font-semibold text-xl text-gray-800">Payroll</h1>
                <h1 className="text-md text-gray-600">Encoding data</h1>
            </div>


            <div>
                <div className="py-4 flex justify-between">
                    <button
                        onClick={() => setIsModalOpen2(true)}
                        className="bg-emerald-700 hover:bg-emerald-600 shadow text-white rounded px-4 py-2.5">
                        Create Payroll
                    </button>
                    <div className="flex gap-x-2">

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-amber-700 hover:bg-amber-500 text-white rounded shadow px-4 py-2.5">View Paycode
                        </button>
                        <button className="bg-blue-800 hover:bg-blue-600 rounded shadow text-white py-2.5 px-8">
                            Save
                        </button>
                    </div>

                </div>
            </div>


            <div className="mt-4">
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-64 px-4 py-2.5 mb-4 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />

                <Datatable columns={columns} data={tableData} />

                <Pagination
                    page={page}
                    totalPages={data_list?.meta.totalPages ?? 1}
                    totalItems={data_list?.meta.total ?? 0}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
                />
            </div>


            {isModalOpen && (
                <RequestModal size="md" title="Existing Paycode List" onClose={handleCloseModal}>
                    <ViewExistingPaycode data={existing_paycode} />
                </RequestModal>
            )}

            {isModalOpen2 && (
                <RequestModal size="xxl" title="Create Payroll" onClose={handleCloseModal2}>
                    <CreatePayroll closeModal={()=> setIsModalOpen2(false)}/>
                </RequestModal>

            )
            }



        </div>

    );
}
