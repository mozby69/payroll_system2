import Datatable from "@/app/components/Datatable";
import RequestModal from "@/app/components/Modal";
import { Pagination } from "@/app/components/Pagination";
import { useAuth } from "@/app/components/UserContext";
import { useDebounce } from "@/app/helper/useDebounce";
import { useDisplayConversionArchive } from "@/app/hooks/useConversion";
import { conversionArchiveProps } from "@/app/types/conversionType";
import { Column } from "@/app/types/preparePayroll";
import { useState } from "react";
import ConversionArchive from "./conversionArchive";
import { formatCurrency } from "@/app/utils/currencyConverter";





export default function ArchivedConversionTab() {

    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 400);
    const { user } = useAuth();
    const company_id = user?.company_id;
    const { data: conversion_archive } = useDisplayConversionArchive({ page, limit: 10, search: debouncedSearch, company_id });
    const [openModal, setOpenModal] = useState(false);
    const [openModal2, setOpenModal2] = useState(false);
    const [selectedArchiveId, setSelectedArchiveId] = useState<number | null>(null);
    const tableData: conversionArchiveProps[] = conversion_archive?.data ?? [];


    const columns: Column<conversionArchiveProps>[] = [
        {
            header: "Year",
            accessor: (row) => row.created_at,
        },
        {
            header: "Total Amount",
            accessor: (row) => formatCurrency(row.total_amount),
        },
        {
            header: "Actions",
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleOpenModal(row.id)}
                        className="px-8 py-2.5 text-sm bg-green-800 hover:bg-green-700 hover:cursor-pointer text-white rounded">
                        View
                    </button>

                    <button className="px-8 py-2.5 text-sm bg-blue-800 hover:bg-blue-600 hover:cursor-pointer text-white rounded">
                        Bank
                    </button>
                </div>
            ),
        }

    ];

    const closeModal = () => {
        setOpenModal(false);
    }

    const handleOpenModal = (id:number) => {
        setSelectedArchiveId(id);
        setOpenModal(true);
    }

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    return (
        <div className="p-4">

            <div className="py-8">
                <h1 className="font-semibold text-xl text-gray-800">CONVERSION</h1>
                <h1 className="text-md text-gray-600">Archive List</h1>
            </div>

            <div className="pb-4">
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-64 px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />

            </div>
            <Datatable columns={columns} data={tableData} />
            <Pagination
                page={page}
                totalPages={conversion_archive?.meta.totalPages ?? 1}
                totalItems={conversion_archive?.meta.total ?? 0}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
            />



        {openModal && selectedArchiveId &&(
          <RequestModal size="xxxl" title="VIEW CONVERSION ARCHIVE" onClose={closeModal}>
            <ConversionArchive archiveId={selectedArchiveId}/>
          </RequestModal>
        )}


        </div>
    );
}