
"use client";

import { useState } from "react";
import { Pencil, Plus, Search } from "lucide-react";

import { useDebounce } from "@/app/helper/useDebounce";
import { useFetchSignatoryList } from "@/app/hooks/useAllowance";

import type {
  SignatoryProps,
} from "@/app/types/allowanceType";

import type { Column } from "@/app/types/preparePayroll";

import Datatable from "../Datatable";
import { Pagination } from "../Pagination";
import RequestModal from "../Modal";

import AddSignatory, {
  EditSignatory,
} from "./addSignatory";

const PAGE_SIZE = 10;

const formatLabel = (value: string) =>
  value.replaceAll("_", " ");

export default function SignatoryList() {
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedSignatory, setSelectedSignatory] =
    useState<SignatoryProps | null>(null);

  const {
    data: signatoryData,
    isLoading,
    refetch,
  } = useFetchSignatoryList({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
  });

  const tableData: SignatoryProps[] =
    signatoryData?.data ?? [];

  function handleEdit(signatory: SignatoryProps) {
    setSelectedSignatory(signatory);
    setIsEditOpen(true);
  }

  function closeEditModal() {
    setIsEditOpen(false);
    setSelectedSignatory(null);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const columns: Column<SignatoryProps>[] = [
    {
      header: "ID",
      accessor: (row) => row.id,
    },
    {
      header: "Name",
      accessor: (row) => row.name ?? "-",
    },
    {
      header: "Position",
      accessor: (row) => row.position ?? "-",
    },
    {
      header: "Signatory Type",
      render: (row) => (
        <span className="text-xs font-medium text-slate-700">
          {formatLabel(row.signatory_type)}
        </span>
      ),
    },
    {
      header: "Category",
      render: (row) => (
        <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
          {row.category}
        </span>
      ),
    },
    {
      header: "Order",
      accessor: (row) => row.sortOrder,
    },
    {
      header: "Status",
      render: (row) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            row.isActive
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <button
          type="button"
          onClick={() => handleEdit(row)}
          className="rounded-lg bg-blue-600 p-2 text-white transition hover:bg-blue-500"
          title="Edit signatory"
        >
          <Pencil size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="w-full space-y-5 px-2">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase text-slate-800">
            Signatory List
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage report signatories and their positions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600"
        >
          <Plus size={16} />
          Add Signatory
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-sm">
        <Search
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search name, position, type or category..."
          value={search}
          onChange={(event) =>
            handleSearchChange(event.target.value)
          }
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto">
        {isLoading ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Loading signatories...
          </div>
        ) : (
          <Datatable
            columns={columns}
            data={tableData}
          />
        )}
      </div>

      {/* PAGINATION */}
      <Pagination
        page={page}
        totalPages={signatoryData?.meta.totalPages ?? 1}
        totalItems={signatoryData?.meta.total ?? 0}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {/* ADD MODAL */}
      {isAddOpen && (
        <RequestModal
          size="xl"
          title="ADD SIGNATORY"
          onClose={() => setIsAddOpen(false)}
        >
          <AddSignatory
            closeModal={() => setIsAddOpen(false)}
            onSuccess={() => {
              refetch();
            }}
          />
        </RequestModal>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && selectedSignatory && (
        <RequestModal
          size="xl"
          title="EDIT SIGNATORY"
          onClose={closeEditModal}
        >
          <EditSignatory
            signatory={selectedSignatory}
            closeModal={closeEditModal}
            onSuccess={() => {
              refetch();
            }}
          />
        </RequestModal>
      )}
    </div>
  );
}
