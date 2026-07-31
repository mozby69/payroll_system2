"use client";
import Datatable from "@/app/components/Datatable";
import { AllowanceProps } from "@/app/types/allowanceType";
import { Column } from "@/app/types/preparePayroll";
import { useFetchAllowance, useSaveAllowance } from "@/app/hooks/useAllowance";
import { useState } from "react";
import { useDebounce } from "@/app/utils/useDebounce";
import { Pagination } from "@/app/components/Pagination";
import SweetAlert from "@/app/components/Swal";
import AllowanceArchiveTab from "@/app/components/allowance/archiveTab";
import { TabItem, Tabs } from "@/app/components/Tab";
import RequestModal from "@/app/components/Modal";
import ViewAllList from "@/app/ModalContent/Allowance/ViewAllList";
import { Pencil } from "lucide-react";
import EditBranchAllowance from "@/app/ModalContent/Allowance/EditBranch";
import ConfigTab from "@/app/components/allowance/configTab";

type AllowanceTab = "current" | "archive" | "config";

export default function AllowancePage() {
  const [activeTab, setActiveTab] = useState<AllowanceTab>("current");
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [month, setMonth] = useState("");
  const saveAllowance = useSaveAllowance(month);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [selectedAllowance, setSelectedAllowance] = useState<AllowanceProps | null>(null);
  const { data: allowance_data } = useFetchAllowance({
    page,
    limit: 10,
    search: debouncedSearch,
    month,
  });
  const tableData: AllowanceProps[] = allowance_data?.data ?? [];

  //const { data: summary } = useAllowanceSummary(month);

  const handleSave = () => {
    SweetAlert.confirmationAlert(
      "Confirm Save Payroll",
      "Are you sure you want to save this payroll?",
      () => {
        saveAllowance.mutate();
      },
    );
  };

  const columns: Column<AllowanceProps>[] = [
    {
      header: "Employee",
      render: (row) => `${row.Lastname}, ${row.Firstname}`,
    },
    {
      header: "Branch",
      render: (row) => `${row.BranchCode.branchCode}`,
    },
    {
      header: "EMPCODE",
      accessor: (row) => row.EmpCode,
    },

    {
      header: "Allowance",
      render: (row) => `${row.cash_assistance}`,
    },
    {
      header: "Ecola",
      render: (row) => `${row.ecola}`,
    },
    // {
    //   header: "DEDUCTIONS",
    //   accessor: (row) => row.deduct ?? "0",
    // },
    // {
    //   header: "Loan",
    //   render: (row) => `${row.loan ?? "0"}`,
    // },
    // {
    //   header:"TOTAL DEDUCTION",
    //   render: (row) => `${row.totalDeduction}`,

    // },
    {
      header: "TOTAL",
      accessor: (row) => row.total ?? "0",
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              openModal2();
              setSelectedAllowance(row);
            }}
            className="px-3 py-2.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded"
          >
            <Pencil />
          </button>
        </div>
      ),
    },
  ];

  const tabs: TabItem<AllowanceTab>[] = [
    { key: "current", label: "Employee Allowance" },
    { key: "archive", label: "Allowance Archive" },
    { key: "config", label: "Config" },
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

  const openModal2 = () => {
    setIsModalOpen2(true);
  };

  const closeModal2 = () => {
    setIsModalOpen2(false);
  };

  return (
    <>
      <div className="p-8">
        <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />

        {activeTab === "current" && (
          <>
            <div className="py-4">
              <h1 className="font-semibold text-xl text-gray-800">BENEFITS</h1>
              <h1 className="text-md text-gray-600">Employees Allowance</h1>
            </div>

            <div className="flex justify-between py-4">
              <div className="flex gap-x-4">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-64 px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                <input
                  type="month"
                  value={month}
                  onChange={(e) => {
                    setMonth(e.target.value);
                    setPage(1);
                  }}
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg shadow-lg"
                />
              </div>

              <div className="flex gap-x-2">
                <button
                  onClick={openModal}
                  disabled={!month}
                  className="bg-cyan-800 hover:bg-cyan-600 text-white py-2.5 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  View
                </button>
                <button
                  onClick={handleSave}
                  disabled={!month}
                  className="bg-sky-700 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed py-2.5 px-4 rounded-lg text-white shadow cursor-pointer"
                >
                  Save Allowance
                </button>
              </div>
            </div>

            <Datatable columns={columns} data={tableData} showFooter />

            <Pagination
              page={page}
              totalPages={allowance_data?.meta.totalPages ?? 1}
              totalItems={allowance_data?.meta.total ?? 0}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}

        {activeTab === "archive" && <AllowanceArchiveTab />}

        {activeTab === "config" && <ConfigTab />}

        {isModalOpen && (
          <RequestModal size="xxxl" title={`VIEW ALL`} onClose={closeModal}>
            <ViewAllList selectedMonth={month} />
          </RequestModal>
        )}

        {isModalOpen2 && (
          <RequestModal size="sm" title={`EDIT BRANCH`} onClose={closeModal2}>
            <EditBranchAllowance
              onClose={closeModal2}
              data={selectedAllowance}
              selectedMonth={month}
            />
          </RequestModal>
        )}
      </div>
    </>
  );
}




