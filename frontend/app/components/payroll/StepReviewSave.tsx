"use client";

import {  useState } from "react";
import SpreadSheet, { SpreadsheetRow } from "../reports/SpreadSheet";
import { printPayroll } from "@/app/utils/printPayrollUtils";
import { dummySummary } from "@/app/types/dummyData";
import { useDisplayPayroll, useSavePayroll } from "@/app/hooks/usePayrollArchive";

import SweetAlert from "../Swal";
import { toNumber } from "@/app/helper/SpreadsheetHelper";
import CompanyFilter from "../CompanyFilter";
import RequestModal from "../Modal";
import FinancialVarianceModal from "@/app/ModalContent/Financial/financialVariance";
import GenButton from "../Buttons";
import { useAuth } from "../UserContext";





interface Props {
  onBack: () => void;
}

export default function StepReviewSave({ onBack }: Props) {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);


  const { hasPermission,user } = useAuth()

  const companyId = user?.company_id;

  const { data, isLoading } = useDisplayPayroll(companyId);
  
  const savePayroll = useSavePayroll();

  const payCode = data?.data?.[0]?.PayCode ?? "-";
  const companyCode = data?.data?.[0]?.EmpCode.BranchCode.company_id ?? "-";

  const currentCycle = data?.data?.[0]?.CycleCategory ?? "";

  const [editedWtax, setEditedWtax] = useState<Record<string, number>>({});

  const buildKey = (
    payCode: string,
    empId: string,
    period: string
    ): string => `${payCode}_${empId}_${period}`;


  const handleSave = () => {
    SweetAlert.confirmationAlert(
      "Confirm Save Payroll",
      "Are you sure you want to save this payroll?",
      () => {
        savePayroll.mutate(companyId ?? "");
      }
    );
  };

  



  const rows: SpreadsheetRow[] = (data?.data ?? [])
  .filter((emp) => {
    if (!selectedCompany) return true;
    return emp.EmpCode.BranchCode?.company_id === selectedCompany;
  })
  .map((emp) => {
    const key = buildKey(
      emp.PayCode,
      emp.EmpCodeId,
      emp.PayrollPeriod
    );

    const finalWtax = editedWtax[key] ?? Number(emp.wtax);

    const net = Number(
      (
        Number(emp.gross_pay) -
        (
          finalWtax +
          Number(emp.sss_contrib_employee) +
          Number(emp.philhealth_contrib_employee) +
          Number(emp.pagibig_contrib_employee) +
          Number(emp.are_loan) +
          Number(emp.rfc_loan) +
          Number(emp.fch_loan) +
          Number(emp.sss_loan) +
          Number(emp.pagibig_loan)
        )
      ).toFixed(2)
    );

    return {
      name: `${emp.EmpCode.Lastname}, ${emp.EmpCode.Firstname}`,
      basicPay: emp.semi_monthly,
      overtime: emp.overtime,
      late: emp.late_count,
      undertime: emp.undertime,
      absence: emp.absence,
      gross: emp.gross_pay,
      wtax: finalWtax,
      sss: emp.sss_contrib_employee,
      philhealth: emp.philhealth_contrib_employee,
      pagibig: emp.pagibig_contrib_employee,
      arE: emp.are_loan,
      rfc: emp.rfc_loan,
      fch: emp.fch_loan,
      salaryLoan: emp.sss_loan,
      calamityLoan: 0,
      pagibigSalaryLoan: emp.pagibig_loan,
      netPayable: net,
      sssEmployer: emp.sss_contrib_employer,
      philEmployer: emp.philhealth_contrib_employer,
      pagibigEmployer: emp.pagibig_contrib_employer,

    
      rowKey: key,
      PayCode: emp.PayCode,
      EmpCodeId: emp.EmpCodeId,
      PayrollPeriod: emp.PayrollPeriod,
      computedWtax: Number(emp.computedWtax)
          };
        });




  

  const totals = rows.reduce(
    (acc, row) => {
      acc.basicPay += toNumber(row.basicPay);
      acc.overtime += toNumber(row.overtime);
      acc.late += toNumber(row.late);
      acc.undertime += toNumber(row.undertime);
      acc.absence += toNumber(row.absence);
      acc.gross += toNumber(row.gross);
      acc.wtax += toNumber(row.wtax);
      acc.sss += toNumber(row.sss);
      acc.philhealth += toNumber(row.philhealth);
      acc.pagibig += toNumber(row.pagibig);
      acc.netPayable += toNumber(row.netPayable);
      acc.sssEmployer += toNumber(row.sssEmployer);
      acc.philEmployer += toNumber(row.philEmployer);
      acc.pagibigEmployer += toNumber(row.pagibigEmployer);
      return acc;
    },
    {
      basicPay: 0,
      overtime: 0,
      late: 0,
      undertime:0,
      absence: 0,
      gross: 0,
      wtax: 0,
      sss: 0,
      philhealth: 0,
      pagibig: 0,
      netPayable: 0,
      sssEmployer: 0,
      philEmployer: 0,
      pagibigEmployer: 0,
    }
  );

  const handlePrint = async () => {
    try {
      setLoading(true);
      await printPayroll(
        rows
      );
    } catch (err) {
      console.error(err);
      alert("Failed to print payroll");
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {;
    setIsModalOpen(true);
  };

  const closeModal = () => {;
    setIsModalOpen(false);
  };
  

  return (
    <div className="space-y-4">

      <div className="print:hidden flex justify-between">

        <div className="flex justify-between w-full">
         

          <div className="text-sm text-slate-600">
          <h2 className="text-lg font-semibold text-slate-800">
            Review & Save Payroll
          </h2>
            Final payroll summary and confirmation.
          </div>

          <div className="mt-4">
            <h2 className="text-gray-700"><span className="font-semibold">For Payroll Period:</span> {payCode}</h2>
          </div>

        </div>

        

      </div>

      <div className="flex justify-between px-4 pt-4">

      <div>
      {hasPermission("SAVE_PAYROLL") && (
           <div className="flex gap-x-2">
                <GenButton variant="primary" onClick={openModal}>View Variance</GenButton>
                <GenButton variant="positive" onClick={handleSave}   disabled={!companyId || savePayroll.isPending}>
                  {savePayroll.isPending ? "Saving..." : "Save Payroll"}
                </GenButton>
            </div>
              )}
      </div>
      <div>
            <h2><span className="font-bold">Company:</span> {companyCode}</h2>
      </div> 

      </div>

 

      <div className="print-area">
        <div className="print-page min-w-56 overflow-x-auto">
          {isLoading ? (
            <div className="p-4 text-sm">Loading payroll...</div>
          ) : (
            <SpreadSheet
            data={rows}
            totals={totals}
            onWtaxChange={(key, val) =>
              setEditedWtax((prev) => ({
                ...prev,
                [key]: val
              }))
            }
          />
          )}
        </div>
      </div>


      <div className="flex justify-between print:hidden pt-10">
        <button
        
          onClick={onBack}
          className="rounded-lg border px-5 py-2 text-sm">
          Back
        </button>

        <div className="flex gap-2">

          <button
            onClick={handlePrint}
            disabled={loading}
            className="rounded bg-blue-600 hover:bg-blue-500 px-4 py-2 text-white disabled:opacity-50">
            {loading ? "Generating PDF..." : "Print Payroll"}
          </button>


        </div>
      </div>



        {isModalOpen && (
            <RequestModal size="xxxl" title="VIEW VARIANCE" onClose={closeModal}>
              <FinancialVarianceModal paycode={payCode} cycle={currentCycle}/>
            </RequestModal>
          )}

    </div>
  );
}
