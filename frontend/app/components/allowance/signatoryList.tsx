import { useDebounce } from "@/app/helper/useDebounce";
import { useFetchSignatoryList } from "@/app/hooks/useAllowance";
import { Signatory, SignatoryProps } from "@/app/types/allowanceType";
import { Column } from "@/app/types/preparePayroll";
import { Pencil } from "lucide-react";
import { useState } from "react";
import Datatable from "../Datatable";
import { Pagination } from "../Pagination";
import RequestModal from "../Modal";
import AddSignatory, { EditSignatory } from "./addSignatory";

export default function SignatoryList() {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);

  const [selectedSignatory, setSelectedSignatory] =
    useState<SignatoryProps | null>(null);

  const { data: signatory_data } = useFetchSignatoryList({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
  });

  const tableData: SignatoryProps[] =
    signatory_data?.data ?? [];

  function handleEdit(signatory: SignatoryProps) {
    setSelectedSignatory(signatory);
    setIsModalOpen2(true);
  }

  const columns: Column<SignatoryProps>[] = [
    {
      header: "ID",
      accessor: (row) => row.id,
    },
    {
      header: "Signatory Type",
      accessor: (row) => row.signatory_type,
    },
    {
      header: "Category",
      accessor: (row) => row.category ?? "",
    },
    {
      header: "Name",
      accessor: (row) => row.name ?? "",
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleEdit(row)}
            className="
              px-3
              py-2.5
              text-sm
              bg-blue-600
              hover:bg-blue-500
              text-white
              rounded
            "
          >
            <Pencil />
          </button>
        </div>
      ),
    },
  ];

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function openModal() {
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function closeModal2() {
    setIsModalOpen2(false);
    setSelectedSignatory(null);
  }

  return (
    <div className="px-8">
      <div className="flex justify-between">
        <div className="px-1">
          <h2 className="uppercase text-slate-800 font-bold">
            Signatory List
          </h2>

          <p className="text-slate-500 text-sm">
            Add & modify list of signatory
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={openModal}
            className="
              bg-blue-800
              text-white
              px-8
              py-2.5
              rounded
              hover:bg-blue-700
              hover:cursor-pointer
            "
          >
            Add
          </button>
        </div>
      </div>

      <div className="py-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(event) =>
            handleSearchChange(event.target.value)
          }
          className="
            w-64
            px-4
            py-2.5
            bg-white
            border
            border-slate-300
            rounded-lg
            shadow-sm
            focus:outline-none
            focus:ring-2
            focus:ring-slate-500
          "
        />
      </div>

      <Datatable
        columns={columns}
        data={tableData}
      />

      <Pagination
        page={page}
        totalPages={
          signatory_data?.meta.totalPages ?? 1
        }
        totalItems={
          signatory_data?.meta.total ?? 0
        }
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {isModalOpen && (
        <RequestModal
          size="xl"
          title="ADD SIGNATORY"
          onClose={closeModal}
        >
          <AddSignatory
            closeModal={closeModal}
          />
        </RequestModal>
      )}

      {isModalOpen2 && selectedSignatory && (
        <RequestModal
          size="xl"
          title="EDIT SIGNATORY"
          onClose={closeModal2}
        >
          <EditSignatory
            signatory={selectedSignatory}
            closeModal={closeModal2}
          />
        </RequestModal>
      )}
    </div>
  );
}