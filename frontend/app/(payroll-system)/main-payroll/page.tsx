"use client";

import "flatpickr/dist/flatpickr.min.css";
import { useEffect, useMemo, useState } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import SideModalLayout from "../../components/SideModal";
import { useUpdateEmployeeSetup } from "@/app/hooks/disburse";
import { useAuth } from "@/app/components/UserContext";

type PayrollStep = 1 | 2 | 3;

type SetupState = {
    EmpCode: string;
    Disbursing: boolean;
    WithAtm: boolean;
    Taxable: boolean;
};

export default function PreparePayroll() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [range, setDateRange] = useState<DateRange | null>(null);
  const [branchCycle, setBranchCycle] = useState("");
  const [currentStep, setCurrentStep] = useState<PayrollStep>(1);
  const { mutate, isPending} = useImportBranches();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { hasPermission,user } = useAuth()


  const companyId = user?.company_id;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const { data: employee } = useEmployeesByCycle({
    company_id: companyId ?? "",
    page,
    limit: 6,
    search: debouncedSearch,
  });





  

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





  

  return (
    <div className="relative min-h-screen bg-slate-100 px-6 py-8 text-mainGray">
   

     
  
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">
          Prepare Payroll
        </h1>
      </div>
  
 
      <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-200">
       
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
            onSearchChange={handleSearchChange}
            page={page}
            onPageChange={setPage}
            onNext={() => setCurrentStep(2)}
          />
        </div>

        <div className={currentStep === 2 ? "block" : "hidden"}>
          <StepComputePayroll
          range={range}
          setRange={setDateRange}
          cycle={branchCycle}
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