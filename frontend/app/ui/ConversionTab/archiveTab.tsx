import Datatable from "@/app/components/Datatable";
import { Pagination } from "@/app/components/Pagination";
import { useAuth } from "@/app/components/UserContext";
import { useDebounce } from "@/app/helper/useDebounce";
import { useDisplayConversionArchive } from "@/app/hooks/useConversion";
import { conversionArchiveProps } from "@/app/types/conversionType";
import { Column } from "@/app/types/preparePayroll";
import { Pencil } from "lucide-react";
import { useState } from "react";





export default function ArchivedConversionTab() {

    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 400);
    const { user } = useAuth();
    const company_id = user?.company_id;
    const { data: conversion_archive } = useDisplayConversionArchive({ page, limit: 10, search: debouncedSearch, company_id });

    const tableData: conversionArchiveProps[] = conversion_archive?.data ?? [];


    const columns: Column<conversionArchiveProps>[] = [
        {
            header: "Year",
            accessor: (row) => row.created_at,
        },
        {
            header: "Total Amount",
            accessor: (row) => row.total_amount,
        },
        {
            header: "Actions",
            render: () => (
                <div className="flex gap-2">
                    <button
                        // onClick={() => openModal(row)}
                        className="px-8 py-2.5 text-sm bg-green-800 hover:bg-green-700 text-white rounded">
                            View
                    </button>
                </div>
            ),
        }

    ];


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

        </div>
    );
}