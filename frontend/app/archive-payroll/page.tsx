"use client";
//pay code , emp code, basic pay, late, absent, gross pay , overtime, monthly rate, action 
import { useEffect, useMemo, useState } from "react";
import Datatable from "../components/Datatable";
import { useFetchSummary } from "../hooks/usePreparePayroll"; 
import { PayrollSummary } from "../types/preparePayroll";
import { Column } from "../types/preparePayroll";
import { Pagination } from "../components/Pagination";
import { useDebounce } from "../utils/useDebounce";
import { generatePayCodeOptions } from "../utils/payCode";
import { FileText } from "lucide-react";
import RequestModal from "../components/Modal";
import { ViewEmployeePayroll } from "../ModalContent/main_payroll";

export default function PreparePayroll() {
  const PAGE_SIZE = 7;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [payCode, setPayCode] = useState<string>("");
  const payCodeOptions = useMemo( () => generatePayCodeOptions(5), []);
  const { data } = useFetchSummary(page, PAGE_SIZE, debouncedSearch || undefined, payCode || undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<PayrollSummary | null>(null);


  const columns: Column<PayrollSummary>[] = [
    {
      header: "EmpCode",
      accessor: (row) => row.EmpCodeId,
    },
    {
      header: "Paycode",
      accessor: (row) => row.PayCode,
    },
    {
      header: "Basic Pay",
      accessor: (row) => Number(row.semi_monthly_rate),
    },
    {
      header: "Absence",
      accessor: (row) => Number(row.absence),
    },
    {
      header: "Late",
      accessor: (row) => Number(row.late_count),
    },
    {
      header: "Overtime",
      accessor: (row) => Number(row.overtime),
    },
    {
      header:"Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
           onClick={() => openModal(row)}
           className="px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded">
          <FileText />
          </button>
        </div>
      ),
    }
  ];

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);


  const openModal = (row: PayrollSummary) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
  };
  


  return (
    <div className="py-10 px-8 bg-gray-50 h-screen">


      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-x-4">
          <input 
            type="text" 
            placeholder="Search..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-slate-700 placeholder-slate-400"
          />

          <select
            value={payCode}
            onChange={(e) => {
              setPayCode(e.target.value);
              setPage(1);
            }}
            className="border border-slate-300 py-2.5 px-4 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 text-slate-700">
            <option value="">All Pay Periods</option>
            {payCodeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button className="bg-green-700 hover:bg-green-600 rounded-lg text-white py-2.5 px-6 shadow-sm transition-colors duration-200 font-medium">
          Save Payroll
        </button>




      </div>
      
      <Datatable
        columns={columns}
        data={data?.data ?? []}
      />

      <Pagination
        page={page}
        totalPages={data?.meta.totalPages ?? 0}
        totalItems={data?.meta.total ?? 0}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />


    

        {isModalOpen && selectedRow && (
          <RequestModal size="xxxl" title={`PAYCYCLE : ${selectedRow.PayCode}`} onClose={closeModal}>
            <ViewEmployeePayroll employeeSummary={selectedRow}/>
          </RequestModal>
        )}




    </div>
  );
}