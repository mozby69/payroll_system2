"use client";

import { useState } from "react";
import SpreadSheet from "../reports/SpreadSheet";
import { printPayroll } from "@/app/utils/printPayrollUtils";
import { dummySummary } from "@/app/types/dummyData";

interface Props {
  onBack: () => void;
}

export default function StepReviewSave({ onBack }: Props) {
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="space-y-4">
      {/* NON-PRINT CONTENT */}
      <div className="print:hidden">
        <h2 className="text-lg font-semibold text-slate-800">
          Review & Save Payroll
        </h2>

        <div className="text-sm text-slate-600">
          Final payroll summary and confirmation.
        </div>
      </div>

      <div className="print-area">
        <div className="print-page min-w-56 overflow-x-auto">
            <SpreadSheet />
        </div>
   </div>


      {/* ACTION BUTTONS */}
      <div className="flex justify-between print:hidden">
        <button
          onClick={onBack}
          className="rounded-lg border px-5 py-2 text-sm"
        >
          Back
        </button>

        <div className="flex gap-2">
          {/* <button
            onClick={handlePrint}
            className="rounded-lg bg-slate-800 px-6 py-2 text-sm text-white"
          >
            Print
          </button> */}
    <button
      onClick={handlePrint}
      disabled={loading}
      className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
    >
      {loading ? "Generating PDF..." : "Print Payroll"}
    </button>


          <button className="rounded-lg bg-green-600 px-6 py-2 text-sm text-white">
            Save Payroll
          </button>
        </div>
      </div>
    </div>
  );
}
