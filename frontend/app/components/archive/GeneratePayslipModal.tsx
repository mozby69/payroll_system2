"use client"

import { useState } from "react"
import { Column } from "@/app/types/preparePayroll"
import { useGetEmployeeArchived } from "@/app/hooks/usePayrollArchive"
import { useDebounce } from "@/app/utils/useDebounce"
import Datatable from "@/app/components/Datatable"
import { Pagination } from "@/app/components/Pagination"
import { Eye, Printer } from "lucide-react"
import { formatCurrency } from "@/app/utils/currencyConverter"
import GenButton from "@/app/components/Buttons"
import { EmployeeArchivedType } from "@/app/types/totalPayroll"
import { ProcessingOverlay } from "@/app/ui/loader/ProcessingOverlay"

type PayslipProps = {
  totalPayrollId: number
}
export default function GeneratePayslipModal({
  totalPayrollId,
}: PayslipProps) {

  const PAGE_SIZE = 10
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const debouncedSearch = useDebounce(search, 400)
  const { data, isFetching } = useGetEmployeeArchived({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    totalPayrollId,
  })
  const handlePrint = async () => {
    if (!data?.data || data.data.length === 0) return
    try {
      setLoading(true)
      const res = await fetch("/api/print/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payslip",
          paper: "A4",
          orientation: "portrait",
          data: data.data,
        }),
      })
      if (!res.ok) throw new Error("Print failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setLoading(false)
      const printWindow = window.open(url, "_blank")
      if (!printWindow) {
        alert("Popup blocked. Please allow popups.")
        URL.revokeObjectURL(url)
        return
      }
    } catch (err) {
      console.error(err)
      alert("Failed to print payroll")
      setLoading(false)
    }
  }
  

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handlePrintSingle = async (row: EmployeeArchivedType) => {
    if (!row) return
    try {
      setLoading(true)
      const res = await fetch("/api/print/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payslip",
          paper: "A4",
          orientation: "portrait",
          data: [row],
        }),
      })
      if (!res.ok) throw new Error("Print failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setLoading(false)
      const printWindow = window.open(url, "_blank")
      if (!printWindow) {
        alert("Popup blocked. Please allow popups.")
        URL.revokeObjectURL(url)
        return
      }
    } catch (err) {
      console.error(err)
      alert("Failed to print payroll")
      setLoading(false)
    }
  }

  const handleView = (row: EmployeeArchivedType) => {
    console.log("View payslip:", row.id)
  }

  const columns: Column<EmployeeArchivedType>[] = [
    {
      header: "Code",
      accessor: (row) => row.EmpCodeId,
    },
    {
      header: "Name",
      accessor: (row) =>
        ` ${row.EmpCode.Lastname}, ${row.EmpCode.Firstname}`,
    },
    {
      header: "Gross Pay",
      accessor: (row) =>
        formatCurrency(Number(row.Grosspay)),
    },
    {
      header: "Total Deduction",
      accessor: (row) =>
        formatCurrency(
          Number(row.w_tax) +
          Number(row.sss_loan) +
          Number(row.pagibig_loan) +
          Number(row.sss_calamity_loan)
        ),
    },
    {
      header: "Net Pay",
      accessor: (row) =>
        formatCurrency(Number(row.Netpay)),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
          >
            <Eye size={16} />
          </button>

          <button
            onClick={() => handlePrintSingle(row)}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-md transition"
          >
            <Printer size={16} />
          </button>
        </div>
      ),
    },
  ]
  

  return (
 
    <div className="flex flex-col gap-6">
   {loading && (
      <ProcessingOverlay
      title="Generating Payslips"
      message="Please wait while we prepare the employee payslip document."
    />
    
    )}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Generate Payslip
          </h2>
          <p className="text-sm text-slate-500">
            Employee archived payroll list
          </p>
        </div>

        <div className="flex gap-2">
          <input
            placeholder="Search employee..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="px-3 py-2 text-sm rounded-md border border-slate-300 
                       bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <GenButton
            variant="positive"
            onClick={handlePrint}
          >
            Print All
          </GenButton>
        </div>
      </div>

      {/* Table */}
      <Datatable
        columns={columns}
        data={data?.data ?? []}
        loading={isFetching}
      />

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={data?.meta.totalPages ?? 0}
        totalItems={data?.meta.total ?? 0}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

    </div>
  )
}
