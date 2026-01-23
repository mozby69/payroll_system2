"use client";

import dynamic from "next/dynamic";
import "flatpickr/dist/flatpickr.min.css";
import { useEffect, useState } from "react";
import DateRangePicker from "../../ui/DateRangePicker";
import { DateRange } from "../../types/utilsTypes";
import { useFetchApiAttendance } from "../../hooks/useApiProcess";
import { ProcessingOverlay } from "../../ui/loader/ProcessingOverlay";
import SweetAlert from "../../components/Swal";
import Stepper, { Step } from "../../components/Stepper";
import StepConfirmEmployees from "../../components/payroll/StepConfirmEmployees";
import StepComputePayroll from "../../components/payroll/StepComputePayroll";
import StepReviewSave from "../../components/payroll/StepReviewSave";
import { useEmployeesByCycle, useImportBranches } from "../../hooks/usePreparePayroll";
import { useDebounce } from "../../utils/useDebounce";

type PayrollStep = 1 | 2 | 3;

export default function PreparePayroll() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [range, setDateRange] = useState<DateRange | null>(null);
  const [branchCycle, setBranchCycle] = useState("");
  const [showProcessing, setShowProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<PayrollStep>(1);
  const { mutate, isPending} = useImportBranches();

  const { data: employee } = useEmployeesByCycle({
    cycle: branchCycle,
    page,
    limit: 6,
    search: debouncedSearch,
  });

      const handleCycleChanges = (cycle: string) => {
        if (isPending) return;
        SweetAlert.loadingAlert("Importing data");
        mutate(undefined, {
          onSuccess: () => {
            setBranchCycle(cycle);
            setPage(1);
            SweetAlert.successAlert("Import successful");
          },
        });
      };

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

  const steps: Step[] = [
    {
      id: 1,
      title: "Confirm Employees",
      status:
        currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "pending",
    },
    {
      id: 2,
      title: "Compute Payroll",
      status:
        currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "pending",
    },
    {
      id: 3,
      title: "Review & Save",
      status: currentStep === 3 ? "current" : "pending",
    },
  ];

  const goToStep2 = () => {
    if (!branchCycle) {
      SweetAlert.warningAlert(
        "Payroll Cycle Required",
        "Please select a payroll cycle before proceeding."
      );
      return;
    }
  
    setCurrentStep(2);
  };
  

  return (
    <div className="relative min-h-screen bg-slate-100 px-6 py-8">
      {showProcessing && (
        <ProcessingOverlay message="Fetching HR data and computing payroll…" />
      )}
   
  
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">
          Prepare Payroll
        </h1>
      
      </div>
  
 
      <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Payroll Cycle
              </label>
              <select
                onChange={(e)=>handleCycleChanges(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white w-50 px-3 py-2.5
                           text-sm text-slate-700 shadow-sm
                           focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100">
                <option value="">Select Payroll Cycle</option>
                <option value="10-25-Cycle">10–25 Cycle</option>
                <option value="15-30-Cycle">15–30 Cycle</option>
              </select>
            </div>
  
          
         


          </div>
  
      
          <div className="text-xs text-slate-500">
            {range
              ? `Selected: ${range.startDate} → ${range.endDate}`
              : "No payroll period selected"}
          </div>
        </div>
        <div className="flex justify-center items-center mt-2">
          <div className="w-300">
             <Stepper steps={steps} />
          </div>
        </div>
      </div>


      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm border border-gray-200">

        <div className={currentStep === 1 ? "block" : "hidden"}>
          <StepConfirmEmployees
            data={employee?.data ?? []}
            meta={employee?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 }}
            search={search}
            onSearchChange={setSearch}
            page={page}
            onPageChange={setPage}
            onNext={() => setCurrentStep(2)}
          />
        </div>

        <div className={currentStep === 2 ? "block" : "hidden"}>
          <StepComputePayroll
          range={range}
          setRange={setDateRange}
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        </div>

        <div className={currentStep === 3 ? "block" : "hidden"}>
          <StepReviewSave onBack={() => setCurrentStep(2)} />
        </div>

        </div>



    </div>
  );
  
}
