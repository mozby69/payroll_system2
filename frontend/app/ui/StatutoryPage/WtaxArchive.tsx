import Datatable from "@/app/components/Datatable";
import RequestModal from "@/app/components/Modal";
import { Pagination } from "@/app/components/Pagination";
import { useDebounce } from "@/app/helper/useDebounce";
import { useFetchWtaxTaxPeriod } from "@/app/hooks/useStatutory";
import ArchiveTax from "@/app/ModalContent/Statutory/ViewArchiveTax";
import { Column } from "@/app/types/preparePayroll";
import { taxPeriodListProps } from "@/app/types/statutoryType";
import { FileText } from "lucide-react";
import { useState } from "react";







export default function WtaxArchive(){
        const [page, setPage] = useState(1);
        const PAGE_SIZE = 5;
        const [search, setSearch] = useState("");
        const debouncedSearch = useDebounce(search, 400);
        const [isModal, setIsModal] = useState(false);
        const [selectedWtaxData, setSelectedWtaxData] = useState<taxPeriodListProps | null>(null);
        const { data: wtax_list_data } = useFetchWtaxTaxPeriod({ page, limit: PAGE_SIZE, search: debouncedSearch, });

        const tableData: taxPeriodListProps[] = wtax_list_data?.data ?? [];
            const columns: Column<taxPeriodListProps>[] = [
        {
            header: "Year",
            accessor: (row) => row.year,
        },
        {
            header: "Month",
            accessor: (row) => row.month,
        },
        {
            header: "Actions",
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => openModal(row)}
                        className="px-3 py-2.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded">
                        <FileText />
                    </button>
                </div>
            ),
        }

    ];


    const openModal = (row: taxPeriodListProps) => {
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



    
                <div className="py-4 flex justify-between">
                    <div>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-64 px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                        />
                    </div>
                </div>
    
    
                <Datatable columns={columns} data={tableData} />
    
                <Pagination
                    page={page}
                    totalPages={wtax_list_data?.meta?.totalPages ?? 1}
                    totalItems={wtax_list_data?.meta?.total ?? 0}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
                />




                    {isModal && selectedWtaxData && (
                                <RequestModal size="xxxl" title={`Wtax Contributions`} onClose={closeModal}>
                                    <ArchiveTax data={selectedWtaxData} />
                                </RequestModal>
                            )}
                


        </div>
    );
}

