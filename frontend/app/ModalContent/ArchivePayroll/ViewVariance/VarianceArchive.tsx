import Datatable from "@/app/components/Datatable";
import RequestModal from "@/app/components/Modal";
import { Pagination } from "@/app/components/Pagination";
import { useDebounce } from "@/app/helper/useDebounce";
import { useMainVarianceArchiveList } from "@/app/hooks/useVariance";
import { Column } from "@/app/types/preparePayroll";
import { MainArchiveVarianceProps } from "@/app/types/varianceType";
import { useState } from "react";
import VariancePerCompanyArchive from "./InerModalVariance/VariancePerCompany";





export default function VarianceArchive() {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [search, setSearch] = useState("");

  const debouncedSearch =
    useDebounce(search, 400);

  const [openModal, setOpenModal] =
    useState(false);

  const [
    selectedArchive,
    setSelectedArchive,
  ] =
    useState<MainArchiveVarianceProps | null>(
      null
    );

  const { data: varianceData } =
    useMainVarianceArchiveList({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch,
    });

  const tableData: MainArchiveVarianceProps[] =
    varianceData?.data ?? [];

  const handleOpenModal = (
    archive: MainArchiveVarianceProps
  ) => {
    setSelectedArchive(archive);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedArchive(null);
  };

  const handleSearchChange = (
    value: string
  ) => {
    setSearch(value);
    setPage(1);
  };

  const columns: Column<MainArchiveVarianceProps>[] =
    [
      {
        header: "Paycode",
        accessor: (row) => row.paycode,
      },

      {
        header: "Cycle",
        accessor: (row) => row.cycle,
      },

      {
        header: "Actions",

        render: (row) => (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                handleOpenModal(row)
              }
              className="px-4 py-2.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded"
            >
              View
            </button>
          </div>
        ),
      },
    ];

  return (
    <div>
      <div className="py-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) =>
            handleSearchChange(
              e.target.value
            )
          }
          className="w-64 px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
      </div>

      <Datatable
        columns={columns}
        data={tableData}
      />

      <Pagination
        page={page}
        totalPages={
          varianceData?.meta.totalPages ?? 1
        }
        totalItems={
          varianceData?.meta.total ?? 0
        }
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {openModal && selectedArchive && (
        <RequestModal
          size="xxxl"
          title={`Variance Archive - ${selectedArchive.paycode}`}
          onClose={handleCloseModal}
        >
          <VariancePerCompanyArchive
            mainArchiveId={
              selectedArchive.id
            }
          />
        </RequestModal>
      )}
    </div>
  );
}