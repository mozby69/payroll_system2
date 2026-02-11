"use client"

import { useState } from "react"
import { Filter, Printer, PrinterIcon, Eye } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { formatCurrency } from "../../utils/currencyConverter"
import { paySlipDummyData } from "@/app/types/dummyData"

import FilterModal from "@/app/components/Filter"
import ActiveFilters from "@/app/components/FilterObject"
import GenButton from "@/app/components/Buttons"

const GeneratePayslipModal = () => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  // ---------------- FILTER LOGIC ----------------

  const filters = {
    department: searchParams.getAll("department"),
    company: searchParams.getAll("company"),
    status: searchParams.getAll("status"),
  }

  const updateParams = (fn: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString())
    fn(params)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const toggleFilter = (key: string, value: string) => {
    updateParams((params) => {
      const values = params.getAll(key)
      params.delete(key)

      if (!values.includes(value)) {
        [...values, value].forEach((v) => params.append(key, v))
      } else {
        values
          .filter((v) => v !== value)
          .forEach((v) => params.append(key, v))
      }

      params.set("page", "1")
    })
  }

  const removeFilter = (key: string, value: string) => {
    updateParams((params) => {
      const values = params.getAll(key).filter((v) => v !== value)
      params.delete(key)
      values.forEach((v) => params.append(key, v))
    })
  }

  const clearAll = () => {
    updateParams((params) => {
      ["department", "company", "status"].forEach((k) =>
        params.delete(k)
      )
      params.set("page", "1")
    })
  }

  // ---------------- PRINT LOGIC ----------------

  const handlePrint = async () => {
    const printWindow = window.open("", "_blank")
    try {
      setLoading(true)

      const res = await fetch("/api/print/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payslip",
          paper: "A4",
          orientation: "portrait",
          data: paySlipDummyData,
        }),
      })

      if (!res.ok) throw new Error("Print failed")

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)

      printWindow!.location.href = url

      printWindow!.onbeforeunload = () => {
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error(err)
      printWindow?.close()
      alert("Failed to print payroll")
    } finally {
      setLoading(false)
    }
  }

  // ---------------- UI ----------------

  return (
    <div className="w-full flex flex-col gap-6 text-slate-700">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Generate Payslip
          </h1>
          <p className="text-sm text-slate-500">
            Complete list of employees payslip
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">

          <input
            placeholder="Search..."
            className="px-3 py-2 text-sm rounded-md border border-slate-300 
                       bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <GenButton variant="primary" onClick={() => setOpen(true)}>
            <span className="flex items-center gap-1">
              <Filter size={15} />
              Filter
            </span>
          </GenButton>

          <GenButton
            variant="positive"
            onClick={handlePrint}
          >
            <PrinterIcon size={15} />
            <span>{loading ? "Printing..." : "Print"}</span>
          </GenButton>
        </div>
      </div>

      {/* ACTIVE FILTERS */}
      <ActiveFilters
        filters={filters}
        onRemove={removeFilter}
        onClearAll={clearAll}
      />

      {/* TABLE */}
      <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm">
        <table className="w-full text-sm">

          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Code</th>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Gross Pay</th>
              <th className="px-4 py-3 text-left font-medium">Total Deduction</th>
              <th className="px-4 py-3 text-left font-medium">Net Payable</th>
              <th className="px-4 py-3 text-center font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {paySlipDummyData.map((row) => (
              <tr
                key={row.employeeCode}
                className="hover:bg-slate-50 transition"
              >
                <td className="px-4 py-3">
                  {row.employeeCode}
                </td>
                <td className="px-4 py-3">
                  {row.name}
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatCurrency(row.grossPay)}
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatCurrency(row.totalDeduction)}
                </td>
                <td className="px-4 py-3 font-semibold text-emerald-600">
                  {formatCurrency(row.netPayable)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition">
                      <Printer size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* FILTER MODAL */}
      {/* <FilterModal
        open={open}
        onClose={() => setOpen(false)}
        filters={filters}
        onToggle={toggleFilter}
      /> */}
    </div>
  )
}

export default GeneratePayslipModal
