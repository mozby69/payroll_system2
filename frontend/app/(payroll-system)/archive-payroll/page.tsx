"use client"

import { useState, useMemo } from "react"
import Datatable from "../../components/Datatable"
import { Pagination } from "../../components/Pagination"
import { useDebounce } from "../../utils/useDebounce"
import { generatePayCodeOptions } from "../../utils/payCode"
import { TotalPayroll } from "@/app/types/totalPayroll"
import { useTotalPayroll } from "@/app/hooks/usePayrollArchive"
import { Column } from "@/app/types/preparePayroll"
import { BookOpenCheck, Eye } from "lucide-react"
import RequestModal from "@/app/components/Modal"
import GeneratePayslipModal from "@/app/components/archive/GeneratePayslipModal"

export default function ArchivePayroll() {
  const PAGE_SIZE = 7

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [payCycle, setPayCycle] = useState("")
  const [payslipModal, setPayslipModal] = useState(false)

  const debouncedSearch = useDebounce(search, 400)

  const payCodeOptions = useMemo(() => generatePayCodeOptions(5), [])

  const { data, isFetching } = useTotalPayroll(
    page,
    PAGE_SIZE,
    debouncedSearch || undefined,
    payCycle || undefined
  )

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1) // reset immediately when typing
  }

  const handlePayCycleChange = (value: string) => {
    setPayCycle(value)
    setPage(1)
  }

  const handleView = (data: TotalPayroll) => {
      console.log("id: ", data)
  }

  const handleGeneratePayslip = (data: TotalPayroll) => {
     console.log("id: ", data)
    setPayslipModal(true)
}

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
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">

        <button
          onClick={() => handleView(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                     text-blue-700 bg-blue-50 hover:bg-blue-100 
                     border border-blue-200 rounded-md 
                     transition-colors duration-200"
        >
          <Eye size={15} />
          View
        </button>
      
        <button
          onClick={() => handleGeneratePayslip(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium 
                     text-emerald-700 bg-emerald-50 hover:bg-emerald-100 
                     border border-emerald-200 rounded-md 
                     transition-colors duration-200"
        >
          <BookOpenCheck size={15} />
          Payslip
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
        <RequestModal size="xxl" title="Generate Payslip" onClose={()=>setPayslipModal(false)}>
             <GeneratePayslipModal />
        </RequestModal>
      )

      }
    </div>
  )
}
