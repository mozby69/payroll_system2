"use client"

import { useState } from "react"
import { Column } from "@/app/types/preparePayroll"
import { useGetEmployeeArchived } from "@/app/hooks/usePayrollArchive"
import { useDebounce } from "@/app/utils/useDebounce"
import Datatable from "@/app/components/Datatable"
import { Pagination } from "@/app/components/Pagination"
import { Eye, Mail, Printer } from "lucide-react"
import { formatCurrency } from "@/app/utils/currencyConverter"
import GenButton from "@/app/components/Buttons"
import { EmployeeArchivedType } from "@/app/types/totalPayroll"
import { ProcessingOverlay } from "@/app/ui/loader/ProcessingOverlay"
import { useFetchBranchesByCompany, useFetchCompanies } from "@/app/hooks/useAllowance"
import { printEmployeeArchivedService } from "@/app/services/archive.services"
import RequestModal from "../Modal"
import ViewEmployeeList from "@/app/ModalContent/ArchivePayroll/ViewEmployee/ViewEmployeeList"
import EmployeeGmail from "@/app/ModalContent/ArchivePayroll/ViewEmployee/ViewGmail"

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
  const [isModalViewOpen, setIsModalViewOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeArchivedType | null>(null);

  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const { data: companies = [] } = useFetchCompanies();
  const { data: branches = [] } = useFetchBranchesByCompany(selectedCompany);
  const { data, isFetching } = useGetEmployeeArchived({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    totalPayrollId,
    selectedCompany,
    selectedBranch
  })

  const preselectedbranch = branches.length === 1 ? branches[0].branchCode : selectedBranch;
  const handlePrint = async () => {
    try {
      setLoading(true);
  
      const fullData = await printEmployeeArchivedService({
        totalPayrollId,
        search,
        selectedCompany,
        selectedBranch
      });
  
      if (!fullData || fullData.length === 0) {
        setLoading(false);
        return;
      }
  
      const res = await fetch("/api/print/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payslip",
          paper: "A4",
          orientation: "portrait",
          data: fullData,
        }),
      });
  
      if (!res.ok) throw new Error("Print failed");
  
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
  
      setLoading(false);
  
      const printWindow = window.open(url, "_blank");
  
      if (!printWindow) {
        alert("Popup blocked. Please allow popups.");
        URL.revokeObjectURL(url);
        return;
      }
  
    } catch (err) {
      console.error(err);
      alert("Failed to print payroll");
      setLoading(false);
    }
  };
  

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
    setSelectedEmployee(row);
    setIsModalViewOpen(true);
  };



  const handleOpenModal = (row: EmployeeArchivedType) => {
    setSelectedEmployee(row);
    setIsModalOpen(true);
  };

  const closeModal3 = () => {
    setIsModalOpen(false);
  }



  const closeModal2 = () => {
    setIsModalViewOpen(false);
    setSelectedEmployee(null);
  };

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
        formatCurrency(Number(row.total_deductions)
         
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

          <button
            onClick={() => handleOpenModal(row)}
            className="p-2 text-cyan-600 hover:text-cyan-400 hover:cursor-pointer rounded-md transition">
            <Mail size={16}/>
          </button>

        </div>
      ),
    },
  ]
  

  return (
    <div className="space-y-6">
  
      {loading && (
        <ProcessingOverlay
          title="Generating Payslips"
          message="Please wait while we prepare the employee payslip document."
        />
      )}
  
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
  
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Generate Payslip
            </h2>
            <p className="text-sm text-slate-500">
              Employee archived payroll list
            </p>
          </div>
  
          <GenButton
            variant="positive"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer size={16} />
            Print All
          </GenButton>
  
        </div>
  
        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Company */}
          
          <select
            value={selectedCompany}
            onChange={(e) => {
              setSelectedCompany(e.target.value);
              setSelectedBranch("");
            }}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 
                       text-sm bg-white focus:outline-none focus:ring-2 
                       focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="">Choose Company</option>
            {companies.map((company) => (
              <option
                key={company.CompanyCode}
                value={company.CompanyCode}
              >
                {company.CompanyName}
              </option>
            ))}
          </select>
  
          {/* Branch */}
          <select
            value={preselectedbranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            disabled={branches.length === 1}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 
                       text-sm bg-white focus:outline-none focus:ring-2 
                       focus:ring-blue-500 focus:border-blue-500 
                       disabled:bg-slate-100 transition"
          >
            <option value="">Choose Branch</option>
            {branches.map((branch) => (
              <option
                key={branch.branchCode}
                value={branch.branchCode}
              >
                {branch.branchCode}
              </option>
            ))}
          </select>
  
          {/* Search */}
          <input
            placeholder="Search employee..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 
                       text-sm focus:outline-none focus:ring-2 
                       focus:ring-blue-500 focus:border-blue-500 transition"
          />
  
        </div>
      </div>
  
      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <Datatable
          columns={columns}
          data={data?.data ?? []}
          loading={isFetching}
        />
  
        {data && data.meta.totalPages > 0 && (
          <div className="mt-6">
            <Pagination
              page={page}
              totalPages={data.meta.totalPages}
              totalItems={data.meta.total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>


      {isModalViewOpen && selectedEmployee && (
            <RequestModal size="xl" title={`VIEW EMPLOYEE`} onClose={closeModal2}>
                <ViewEmployeeList employee={selectedEmployee}/>
            </RequestModal>
          )}


      {isModalOpen && selectedEmployee &&(
            <RequestModal size="md" title={`VIEW GMAIL`} onClose={closeModal3}>
                <EmployeeGmail employee={selectedEmployee}/>
            </RequestModal>
          )}
  
    </div>
  );
}
