"use client";

import dynamic from "next/dynamic";
import "flatpickr/dist/flatpickr.min.css";
import { useEffect, useState } from "react";
import DateRangePicker from "../ui/DateRangePicker";
import { DateRange } from "../types/utilsTypes";
import { useFetchApiAttendance } from "../hooks/useApiProcess";
import { ProcessingOverlay } from "../ui/loader/ProcessingOverlay";
import SweetAlert from "../components/Swal";


export default function PreparePayroll() {
  const [range, setDateRange] = useState<DateRange | null>(null);
  const [branchCycle, setBranchCycle] = useState("15-30-Cycle");
  const [showProcessing, setShowProcessing] = useState(false);

  const { data, isLoading, isFetching } = useFetchApiAttendance(
    range
      ? {
          startDate: range.startDate,
          endDate: range.endDate,
          branchCycle,
        }
      : null
  );
  useEffect(() => {
    if (isFetching && range) {
      setShowProcessing(true);
    }
  }, [isFetching, range]);
  
  useEffect(() => {
    if (!isFetching && showProcessing) {
      const timer = setTimeout(() => {
        setShowProcessing(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isFetching, showProcessing]);



  return (
    <div className="relative min-h-screen bg-slate-100 px-6 py-8">
      {showProcessing && (
        <ProcessingOverlay message="Fetching HR data and computing payroll…" />
      )}
  
  
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">
          Prepare Payroll
        </h1>
  
        <button
          className="rounded-lg bg-green-700 px-6 py-2 text-sm font-medium text-white
                     shadow-sm hover:bg-green-600 transition-colors"
        >
          Save Payroll
        </button>
      </div>
  
 
      <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
  
      
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
         
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Payroll Cycle
              </label>
              <select
                onChange={(e) => setBranchCycle(e.target.value)}
                className="w-56 rounded-lg border border-slate-300 bg-white px-3 py-2
                           text-sm text-slate-700 shadow-sm
                           focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
              >
                <option value="">Select Payroll Cycle</option>
                <option value="15-30-Cycle">15–30 Cycle</option>
                <option value="10-25-Cycle">10–25 Cycle</option>
              </select>
            </div>
  
          
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Payroll Period
              </label>
              <DateRangePicker
                onChange={(range) => {
                  SweetAlert.confirmationAlert(
                    "Confirm Payroll Period",
                    `${range.startDate} → ${range.endDate}`,
                    () => setDateRange(range)
                  );
                }}
              />
            </div>
          </div>
  
      
          <div className="text-xs text-slate-500">
            {range
              ? `Selected: ${range.startDate} → ${range.endDate}`
              : "No payroll period selected"}
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="text-sm text-slate-500">
          Attendance and payroll preview will appear here.
        </div>
      </div>
    </div>
  );
  
}
