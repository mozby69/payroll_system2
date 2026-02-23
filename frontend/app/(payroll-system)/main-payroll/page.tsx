"use client";

import "flatpickr/dist/flatpickr.min.css";
import { useEffect, useState } from "react";
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
  //const [showProcessing, setShowProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<PayrollStep>(1);
  const { mutate, isPending} = useImportBranches();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);


  // Disburse Code ↓
  const [shouldCheckModal, setShouldCheckModal] = useState(false);
  const [editedEmployees, setEditedEmployees] = useState<Record<string,SetupState>>({});
  const [originalEmployees, setOriginalEmployees] = useState<Record<string,SetupState>>({});
  // Disburse Code ↑




  const { data: employee } = useEmployeesByCycle({
    cycle: branchCycle,
    page,
    limit: 6,
    search: debouncedSearch,
  });

  // Disburse Code ↓
  const { data: newEmployee, isFetching: isFetchingNew } = useEmployeesByCycle({
    cycle: branchCycle,
    page,
    limit: 500,
    search: debouncedSearch,
    onlyNew: true,
  });

  const { data: setupEmployee, isFetching: isFetchingSetup } = useEmployeesByCycle({
    cycle: branchCycle,
    page,
    limit: 500,
    search: debouncedSearch,
    onlyMissingSetup: true,
  });

  const {mutateAsync:saveSetup} = useUpdateEmployeeSetup();



  const handleCycleChanges = (cycle: string) => {
    if (isPending) return;

    SweetAlert.loadingAlert("Importing data");

    mutate(undefined, {
      onSuccess: () => {
        setDateRange(null);
        setBranchCycle(cycle);
        setPage(1);

        SweetAlert.successAlert("Import successful");

      
        setShouldCheckModal(true);
      },
    });
  };



  // Disburse Code ↑


  const { isFetching,isSuccess,error  } = useFetchApiAttendance(
    range
      ? {
          startDate: range.startDate,
          endDate: range.endDate,
          branchCycle,
        }
      : null
  );

  const showProcessing = isFetching && !!range;

  // Disburse Code ↓
  useEffect(() => {
    if (!shouldCheckModal) return;


    if (isFetchingNew || isFetchingSetup) return;

    if (
      newEmployee?.data?.length ||
      setupEmployee?.data?.length
    ) {
      setOpen(true);
    }

    setShouldCheckModal(false);
  }, [
    shouldCheckModal,
    isFetchingNew,
    isFetchingSetup,
    newEmployee,
    setupEmployee,
  ]);

  useEffect(() => {
    const combined = [
      ...(newEmployee?.data ?? []),
      ...(setupEmployee?.data ?? [])
    ];

    if (combined.length === 0) return;

    const initial: Record<string, SetupState> = {};

    combined.forEach(emp => {
      initial[emp.EmpCode] = {
        EmpCode: emp.EmpCode,
        Disbursing: emp.Disbursing,
        WithAtm: emp.WithAtm,
        Taxable: emp.Taxable,
      };
    });

    setEditedEmployees(initial);
    setOriginalEmployees(initial);
  }, [newEmployee, setupEmployee]);


  // Disburse Code ↑

  useEffect(() => {
    if (!error || !range) return;
  
    const axiosError = error as AxiosError<{ message?: string }>;
  
    const message =
      axiosError.response?.data?.message ??
      "Payroll cannot be recomputed because it is already for approval.";
  
    SweetAlert.warningAlert(
      "There is a pending payroll",
      message
    );

    queueMicrotask(() => {
      setDateRange(null);
    });
  
  }, [error, range]);

 

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({
        queryKey: ["employees-computed"],
      });
    }
  }, [isSuccess, queryClient]);
  
  // useEffect(() => {
  //   if (!isFetching && showProcessing) {
  //     const timer = setTimeout(() => {
  //       setShowProcessing(false);
  
  //       if (isSuccess) {
  //         queryClient.invalidateQueries({
  //           queryKey: ["employees-computed"],
  //         });
  //       }
  //     }, 800);
  //     return () => clearTimeout(timer);
  //   }
  // }, [isFetching, showProcessing, isSuccess, queryClient]);


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

    // if ((employee?.meta?.zeroSalaryCount ?? 0) > 0) {
    //   SweetAlert.warningAlert(
    //     "Invalid Basic Salary",
    //     "There are employees with 0 basic salary. Please update before proceeding."
    //   );
    //   return;
    // }
  
    setCurrentStep(2);
  };

// Disburse code ↓

  const handleResetChanges = () => {
    setEditedEmployees(originalEmployees);
  };

  const handleSaveChanges = async () => {
    const changedEmployees = Object.values(editedEmployees).filter(emp => {
      const original = originalEmployees[emp.EmpCode];
      if (!original) return false;

      return (
        emp.Disbursing !== original.Disbursing ||
        emp.WithAtm !== original.WithAtm ||
        emp.Taxable !== original.Taxable
      );
    });

    if (changedEmployees.length === 0) return;

    await saveSetup({
      employees: changedEmployees.map(emp => ({
        empCode: emp.EmpCode,
        Disbursing: emp.Disbursing,
        WithAtm: emp.WithAtm,
        Taxable: emp.Taxable,
      })),
    });

    setOriginalEmployees(prev => ({
      ...prev,
      ...editedEmployees,
    }));

    SweetAlert.successAlert("Employee Setup Updated Successfully")
  };


  const isDirty = Object.keys(editedEmployees).some(code => {
      const edited = editedEmployees[code];
      const original = originalEmployees[code];

      if (!original) return false;

      return (
        edited.Disbursing !== original.Disbursing ||
        edited.WithAtm !== original.WithAtm ||
        edited.Taxable !== original.Taxable
      );
    });

  // Disburse code ↑


  

  return (
    <div className="relative min-h-screen bg-slate-100 px-6 py-8 text-mainGray">
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
              <label className="mb-1 block text-xs font-medium text-slate-600">Payroll Cycle</label>
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
            onNext={() => goToStep2()}
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
     

   {/* // Disburse Code ↓ */}
    {open && (
      <SideModalLayout
        open={open}
        onClose={() => setOpen(false)}
        title="Employee Payroll Setup"
        onSave={handleSaveChanges}
        isSaveDisabled={!isDirty}
        isDirty={isDirty}
        onReset={handleResetChanges}
      >
        <div className=" flex flex-col gap-6">
                <div className="flex flex-col w-full">
                  <div className="w-full text-start py-4">
                    <h6>Recent Employees</h6>
                  </div>
                  <table className="w-full border-separate border-spacing-0 rounded-md overflow-hidden shadow-lg">
                      <thead className="bg-mainDark text-white">
                      <tr className="text-sm">
                        <th className="px-4 py-3 text-left">Fullname</th>
                        <th className="px-4 py-3 text-center">Disbursing</th>
                        <th className="px-4 py-3 text-center">ATM</th>
                        <th className="px-4 py-3 text-center">Taxable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newEmployee?.data?.map((emp) => (
                        <tr key={emp.EmpCode}>
                          <td className="px-4 py-3 text-left">
                            {emp.Firstname} {emp.Lastname}
                          </td>
                          <td className="px-4 py-3  text-center">
                            <input
                              type="checkbox"
                              checked={editedEmployees[emp.EmpCode]?.Disbursing ?? false}
                              onChange={(e) => {
                                setEditedEmployees(prev => ({
                                  ...prev,
                                  [emp.EmpCode]: {
                                    ...prev[emp.EmpCode],
                                    Disbursing: e.target.checked,
                                  },
                                }));
                              }}
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={editedEmployees[emp.EmpCode]?.WithAtm ?? false}
                              onChange={(e) => {
                                setEditedEmployees(prev => ({
                                  ...prev,
                                  [emp.EmpCode]: {
                                    ...prev[emp.EmpCode],
                                    WithAtm: e.target.checked,
                                  },
                                }));
                              }}
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={editedEmployees[emp.EmpCode]?.Taxable ?? false}
                              onChange={(e) => {
                                setEditedEmployees(prev => ({
                                  ...prev,
                                  [emp.EmpCode]: {
                                    ...prev[emp.EmpCode],
                                    Taxable: e.target.checked,
                                  },
                                }));
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                      {newEmployee?.data?.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center p-4 text-gray-500">
                            No new employees found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col w-full">
                  <div className="w-full text-start py-4">
                    <h6>Disburse or No ATM Employees</h6>
                  </div>
        
                   <table className="w-full border-separate border-spacing-0 rounded-md overflow-hidden shadow-lg">
                      <thead className="bg-mainDark text-white">
                      <tr className="text-sm">
                        <th className="px-4 py-3 text-left">Fullname</th>
                        <th className="px-4 py-3 text-center">Disbursing</th>
                        <th className="px-4 py-3 text-center">ATM</th>
                        <th className="px-4 py-3 text-center">Taxable</th>
                      </tr>
                    </thead>
                    <tbody>
                       {setupEmployee?.data?.map((emp) => (
                        <tr key={emp.EmpCode}>
                          <td className="px-4 py-3 text-left">
                            {emp.Firstname} {emp.Lastname}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={editedEmployees[emp.EmpCode]?.Disbursing ?? false}
                              onChange={(e) => {
                                setEditedEmployees(prev => ({
                                  ...prev,
                                  [emp.EmpCode]: {
                                    ...prev[emp.EmpCode],
                                    Disbursing: e.target.checked,
                                  },
                                }));
                              }}
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={editedEmployees[emp.EmpCode]?.WithAtm ?? false}
                              onChange={(e) => {
                                setEditedEmployees(prev => ({
                                  ...prev,
                                  [emp.EmpCode]: {
                                    ...prev[emp.EmpCode],
                                    WithAtm: e.target.checked,
                                  },
                                }));
                              }}
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={editedEmployees[emp.EmpCode]?.Taxable ?? false}
                              onChange={(e) => {
                                setEditedEmployees(prev => ({
                                  ...prev,
                                  [emp.EmpCode]: {
                                    ...prev[emp.EmpCode],
                                    Taxable: e.target.checked,
                                  },
                                }));
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                      {setupEmployee?.data.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center p-4 text-gray-500">
                            No matching employees found.
                          </td>
                        </tr>
                      )}
                  </tbody>
                  </table>
        
                </div>
              </div>
      </SideModalLayout>
    )}

    {/* // Disburse Code ↑ */}



    </div>
  );
  
}
