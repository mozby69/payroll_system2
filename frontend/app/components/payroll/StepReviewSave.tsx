"use client";

import {  useState } from "react";
import SpreadSheet, { SpreadsheetRow } from "../reports/SpreadSheet";
import { printPayroll } from "@/app/utils/printPayrollUtils";
import { dummySummary } from "@/app/types/dummyData";
import { useDisplayPayroll, useSavePayroll } from "@/app/hooks/usePayrollArchive";

import SweetAlert from "../Swal";
import { toNumber } from "@/app/helper/SpreadsheetHelper";





interface Props {
  onBack: () => void;
}

export default function StepReviewSave({ onBack }: Props) {
  const [loading, setLoading] = useState(false);
  const { data, isLoading } = useDisplayPayroll();
  const savePayroll = useSavePayroll();

  const payCode = data?.data?.[0]?.PayCode ?? "-";

  const handleSave = () => {
    SweetAlert.confirmationAlert(
      "Confirm Save Payroll",
      "Are you sure you want to save this payroll?",
      () => {
        savePayroll.mutate();
      }
    );
  };

  



  const rows: SpreadsheetRow[] = (data?.data ?? []).map((emp) => ({
    name: `${emp.EmpCode.Lastname}, ${emp.EmpCode.Firstname}`,
    basicPay: emp.semi_monthly,
    overtime: emp.overtime,
    late: emp.late_count,
    undertime: emp.undertime,
    absence: emp.absence,
    gross: emp.gross_pay,
    wtax: emp.wtax,
    sss: emp.sss_contrib_employee,
    philhealth: emp.philhealth_contrib_employee,
    pagibig: emp.pagibig_contrib_employee,
    arE: 0,
    rfc:emp.rfc_loan,
    fch: emp.fch_loan,
    salaryLoan: emp.sss_loan,
    calamityLoan: 0,
    pagibigSalaryLoan: emp.pagibig_loan,
    netPayable: emp.net_pay,
    sssEmployer: emp.sss_contrib_employer,
    philEmployer: emp.philhealth_contrib_employer,
    pagibigEmployer: emp.pagibig_contrib_employer,

  }));

  

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

      <div className="flex justify-between px-4 pt-4">

      <button
          onClick={handleSave}
          disabled={savePayroll.isPending}
          className="rounded-lg bg-green-600 hover:bg-green-500 px-6 py-2 text-sm text-white disabled:opacity-50">
          {savePayroll.isPending ? "Saving..." : "Save Payroll"}
        </button>


        <div className=" grid place-items-center">
          <h2 className="text-gray-700"><span className="font-semibold">For Payroll Period:</span> {payCode}</h2>
        </div>

      
      </div>

      <div className="print-area">
        <div className="print-page min-w-56 overflow-x-auto">
          {isLoading ? (
            <div className="p-4 text-sm">Loading payroll...</div>
          ) : (
            <SpreadSheet data={rows} totals={totals}/>
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
