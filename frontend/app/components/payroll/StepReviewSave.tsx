"use client";

import { useEffect, useState } from "react";
import SpreadSheet, { SpreadsheetRow } from "../reports/SpreadSheet";
import { printPayroll } from "@/app/utils/printPayrollUtils";
import { dummySummary } from "@/app/types/dummyData";
import { useDisplayPayroll, useSavePayroll } from "@/app/hooks/usePayrollArchive";
import { useQueryClient } from "@tanstack/react-query";
import SweetAlert from "../Swal";
import { usePayrollRealtime } from "@/app/hooks/useRealtime";

interface Props {
  onBack: () => void;
}

export default function StepReviewSave({ onBack }: Props) {
  usePayrollRealtime();
  const [loading, setLoading] = useState(false);
  const { data, isLoading } = useDisplayPayroll();
  const savePayroll = useSavePayroll();

  const handleSave = () => {
    SweetAlert.confirmationAlert(
      "Confirm Save Payroll",
      "Are you sure you want to save this payroll?",
      () => {
        savePayroll.mutate();
      }
    );
  };

  

  const handlePrint = async () => {
    try {
      setLoading(true);
      await printPayroll(
    dummySummary
      );
    } catch (err) {
      console.error(err);
      alert("Failed to print payroll");
    } finally {
      setLoading(false);
    }
  };

  const rows: SpreadsheetRow[] = (data?.data ?? []).map((emp) => ({
    name: `${emp.EmpCode.Lastname}, ${emp.EmpCode.Firstname}`,
    basicPay: emp.semi_monthly,
    overtime: emp.overtime,
    late: emp.late_count,
    absence: emp.absence,
    gross: emp.gross_pay,
    wtax: emp.wtax,
    sss: emp.sss_contrib_employee,
    philhealth: emp.philhealth_contrib,
    pagibig: emp.pagibig_contrib_employee,
    arE: 0,
    rfc:emp.rfc_loan,
    fch: emp.fch_loan,
    salaryLoan: emp.sss_loan,
    calamityLoan: 0,
    pagibigSalaryLoan: emp.pagibig_loan,
    netPayable: emp.net_pay,
    sssEmployer: emp.sss_contrib_employer,
    philEmployer: emp.philhealth_contrib,
    pagibigEmployer: emp.pagibig_contrib_employer,

  }));

  

  return (
    <div className="space-y-4">

      <div className="print:hidden">
        <h2 className="text-lg font-semibold text-slate-800">
          Review & Save Payroll
        </h2>

        <div className="text-sm text-slate-600">
          Final payroll summary and confirmation.
        </div>
      </div>

      <div className="flex justify-end px-4">
      <button
        onClick={handleSave}
        disabled={savePayroll.isPending}
        className="rounded-lg bg-green-600 hover:bg-green-500 px-6 py-2 text-sm text-white disabled:opacity-50"
      >
        {savePayroll.isPending ? "Saving..." : "Save Payroll"}
      </button>

      </div>

      <div className="print-area">
        <div className="print-page min-w-56 overflow-x-auto">
          {isLoading ? (
            <div className="p-4 text-sm">Loading payroll...</div>
          ) : (
            <SpreadSheet data={rows} />
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



    </div>
  );
}
