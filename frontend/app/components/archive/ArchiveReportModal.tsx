"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Column } from "@/app/types/preparePayroll"
import { useGetEmployeeArchived, usePayrollArchiveReport } from "@/app/hooks/usePayrollArchive"
import { useDebounce } from "@/app/utils/useDebounce"
import Datatable from "@/app/components/Datatable"
import { Pagination } from "@/app/components/Pagination"
import { Eye, Printer } from "lucide-react"
import { formatCurrency } from "@/app/utils/currencyConverter"
import GenButton from "@/app/components/Buttons"
import { EmployeeArchivedType, TotalPayroll } from "@/app/types/totalPayroll"
import { ProcessingOverlay } from "@/app/ui/loader/ProcessingOverlay"
import { useFetchBranchesByCompany, useFetchCompanies } from "@/app/hooks/useAllowance"
import { printEmployeeArchivedService } from "@/app/services/archive.services"
import RequestModal from "../Modal"
import ViewEmployeeList from "@/app/ModalContent/ArchivePayroll/ViewEmployee/ViewEmployeeList"
import ArchiveReportTable from "./ArchiveReportTable"
import { useCompaniesByCycle } from "@/app/hooks/useGeneral"
import { useReactToPrint } from "react-to-print"
import ArchiveReportView from "./ArchiveReportView"
import ArchivePayrollPrintView from "./ArchivePayrollPrint"
import { PayrollArchiveEmployee } from "@/app/types/archiveTypes"

type PayslipProps = {
  totalPayrollId: number
  archiveData: TotalPayroll
}
export default function ArchiveReportModal({
  totalPayrollId, archiveData
}: PayslipProps) {

  const PAGE_SIZE = 10
  const [loading, setLoading] = useState(false)
  const [isModalViewOpen, setIsModalViewOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeArchivedType | null>(null);
  const printRef = useRef<HTMLDivElement>(null)
  const [selectedBranch, setSelectedBranch] = useState<string>("");


  const { data: company } = useCompaniesByCycle(archiveData?.cycle_category);

  const [selectedCompany, setSelectedCompany] = useState<string>("");
  
  useEffect(() => {
    if (company?.data?.length && !selectedCompany) {
      setSelectedCompany(company.data[0].CompanyCode);
    }
  }, [company, selectedCompany]);
  

  const { data: branches = [] } = useFetchBranchesByCompany(selectedCompany);


  const companies = company?.data

  const { data: report, isLoading } = usePayrollArchiveReport(
    totalPayrollId,
    selectedCompany
  );

  const preselectedbranch = branches.length === 1 ? branches[0].branchCode : selectedBranch;
   const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Payroll Archive Report"
  })


  

  const handleView = (row: EmployeeArchivedType) => {
    setSelectedEmployee(row);
    setIsModalViewOpen(true);
  };

  const closeModal2 = () => {
    setIsModalViewOpen(false);
    setSelectedEmployee(null);
  };


  const grandTotals = useMemo(() => {
    if (!report) return null;
  
    const allEmployees = [
      ...(report.boardEmployees ?? []),
      ...(report.mancomEmployees ?? []),
      ...(report.holdingEmployees ?? []),
      ...Object.values(report.branchGroups ?? {}).flat()
    ];
  
    const toNumber = (v: unknown) => {
      const n = Number(v);
      return isNaN(n) ? 0 : n;
    };
  
    return allEmployees.reduce(
      (acc, e: PayrollArchiveEmployee) => ({
        halfBasic: acc.halfBasic + toNumber(e.halfBasic),
        overtime: acc.overtime + toNumber(e.overtime),
        late: acc.late + toNumber(e.late),
        absences: acc.absences + toNumber(e.absences),
        total: acc.total + toNumber(e.total),
        pagibig: acc.pagibig + toNumber(e.pagIbigEmployeer),
        sss: acc.sss + toNumber(e.sssEmployeer),
        philhealth: acc.philhealth + toNumber(e.philhealthEmployeer),
      }),
      {
        halfBasic: 0,
        overtime: 0,
        late: 0,
        absences: 0,
        total: 0,
        pagibig: 0,
        sss: 0,
        philhealth: 0,
      }
    );
  }, [report]);

  
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
              Generate Payroll Report
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
            <Printer size={16} onClick={handlePrint}/>
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
            {companies?.map((company) => (
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
        </div>
      </div>
  
      {isLoading && <div>Loading payroll report...</div>}

      {report && (
  <div  className="print-wrapper">

    <h2 className="text-center text-xl font-bold mb-6">
      PAYROLL ARCHIVE REPORT
    </h2>
{grandTotals && (
  <div>
    <ArchiveReportView grandTotals={grandTotals}  report = {report}/>
    <div style={{ display: "none" }}>
        <div ref={printRef}>
          <ArchivePayrollPrintView
            report={report}
            grandTotals={grandTotals}
          />
        </div>
      </div>
  </div>
)}
   


  </div>
)}


      {isModalViewOpen && selectedEmployee && (
            <RequestModal size="xl" title={`VIEW EMPLOYEE`} onClose={closeModal2}>
                <ViewEmployeeList employee={selectedEmployee}/>
            </RequestModal>
          )}

  
    </div>
  );
}
