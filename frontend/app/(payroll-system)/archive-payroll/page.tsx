"use client"

import { useState, useMemo } from "react"
import Datatable from "../../components/Datatable"
import { Pagination } from "../../components/Pagination"
import { useDebounce } from "../../utils/useDebounce"
import { generatePayCodeOptions } from "../../utils/payCode"
import { TotalPayroll } from "@/app/types/totalPayroll"
import { useFetchBank, useTotalPayroll } from "@/app/hooks/usePayrollArchive"
import { Column } from "@/app/types/preparePayroll"
import RequestModal from "@/app/components/Modal"
import GeneratePayslipModal from "@/app/components/archive/GeneratePayslipModal"
import ViewBank from "@/app/ModalContent/ArchivePayroll/BankRelease/ViewBank"
import { BanknoteArrowDown, BookOpenCheck, PrinterCheckIcon } from "lucide-react"
import ArchiveReportModal from "@/app/components/archive/ArchiveReportModal"


export default function ArchivePayroll() {
  const PAGE_SIZE = 7

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [payCycle, setPayCycle] = useState("")
  const [payslipModal, setPayslipModal] = useState(false)
  const [totalPayrollId, setTotalPayrollId] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openReportModal, setOpenReportModal] = useState(false);
  const [selectedPayCode, setSelectedPayCode] = useState<string | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const [selectedArchive, setSelectedArchive] = useState<TotalPayroll>()
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  
  const debouncedSearch = useDebounce(search, 400)

  const payCodeOptions = useMemo(() => generatePayCodeOptions(5), [])

  const { data, isFetching } = useTotalPayroll(
    page,
    PAGE_SIZE,
    debouncedSearch || undefined,
    payCycle || undefined
  )

  // const paycycle = data?.data?.[0]?.PayCycle ?? "";
  // const cycleCategory = data?.data?.[0]?.cycle_category ?? "";

  const { data: bank_data = [] } = useFetchBank(selectedPayCode,selectedCycle,selectedCompany);

  

  

 




  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1) // reset immediately when typing
  }

  const handlePayCycleChange = (value: string) => {
    setPayCycle(value)
    setPage(1)
  }


      const handleGeneratePayslip = (data: TotalPayroll) => {
          setTotalPayrollId(data.id)
          setPayslipModal(true)
      }

    const handleGenerateReport = (data: TotalPayroll) => {
      setTotalPayrollId(data.id)
      setOpenReportModal(true)
      setSelectedArchive(data)
    }


  const closeModal = () => {
    setIsModalOpen(false);
  };


  

  const columns: Column<TotalPayroll>[] = [
    {
      header: "Pay Cycle",
      accessor: (row) => row.PayCycle,
    },
    {
      header: "Category",
      accessor: (row) => row.cycle_category,
    },
    {
      header: "Payroll Period",
      accessor: (row) => row.payroll_period,
    },
    {
      header: "Total Gross",
      accessor: (row) =>
        Number(row.Total_GrossPay).toLocaleString(),
    },
    {
      header: "Total Net",
      accessor: (row) =>
        Number(row.Total_NetPay).toLocaleString(),
    },
    {
      header: "Status",
      render: (row) => {
        const status = row.status?.toLowerCase();
        const baseClass = "px-2.5 py-1 text-xs font-semibold rounded-full inline-block";
        const statusClass = status === "completed"
            ? "bg-green-100 text-green-700 border border-green-200"
            : status === "in_progress"
            ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
            : "bg-gray-100 text-gray-600 border border-gray-200";

        return (
          <span className={`${baseClass} ${statusClass}`}>
            {row.status}
          </span>
        );
      },
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
          onClick={() => handleGenerateReport(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                     text-emerald-700 bg-emerald-50 hover:bg-emerald-100 
                     border border-emerald-200 rounded-md 
                     transition-colors duration-200"
        >
          <PrinterCheckIcon size={15} />
          Report
        </button>
      
        <button
          onClick={() => handleGeneratePayslip(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                     text-emerald-700 bg-emerald-50 hover:bg-emerald-100 
                     border border-emerald-200 rounded-md 
                     transition-colors duration-200">
          <BookOpenCheck size={15} />
          Payslip
        </button>

        <button
          onClick={() => {
            setSelectedPayCode(row.PayCycle);
            setSelectedCycle(row.cycle_category);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
          text-cyan-700 bg-cyan-50 hover:bg-cyan-100 
          border border-cyan-200 rounded-md 
          transition-colors duration-200"
        >
          <BanknoteArrowDown size={15}/>Bank
        </button>
      
      </div>
      
     
      ),
    },
  ]
  

  return (
    <div className="py-10 px-8 bg-gray-50 min-h-screen">

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search PayCycle..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-64 px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm"
          />

          <select
            value={payCycle}
            onChange={(e) => handlePayCycleChange(e.target.value)}
            className="border border-slate-300 py-2.5 px-4 rounded-lg bg-white shadow-sm"
          >
            <option value="">All Cycles</option>
            {payCodeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Datatable
        columns={columns}
        data={data?.data ?? []}
        loading={isFetching}
      />

      <Pagination
        page={page}
        totalPages={data?.meta.totalPages ?? 0}
        totalItems={data?.meta.total ?? 0}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
      

    {payslipModal && (
            <RequestModal 
              size="xxl" 
              title="Generate Payslip"
              onClose={()=>{
                setPayslipModal(false); 
                setTotalPayrollId(0)}
              }>
                <GeneratePayslipModal totalPayrollId={totalPayrollId} />
            </RequestModal>
          )
          }

          {openReportModal && selectedArchive && (
            <RequestModal 
            size="xxxl" 
            title="Archive Report"
            onClose={()=>{
              setOpenReportModal(false); 
              setTotalPayrollId(0)}
            }>
              <ArchiveReportModal totalPayrollId={totalPayrollId} archiveData={selectedArchive} />
          </RequestModal>
          )}

 

        {isModalOpen && (
            <RequestModal size="xxxl" title={`VIEW BANK RELEASE`} onClose={closeModal}>
              <ViewBank
                  data2={bank_data}
                  cycleCategory={selectedCycle}
                  company={selectedCompany}
                  paycode={selectedPayCode}
                  setCompany={setSelectedCompany}
                />
            </RequestModal>
          )}


    


    </div>
  )
}
