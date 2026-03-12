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
import { useDisburseCompanies, useUpdateCompanySetup, useUpdateEmployeeSetup } from "@/app/hooks/disburse";
import { useRouter, useSearchParams } from "next/navigation";
import { PayrollCycle } from "@/app/types/disburseType";

type PayrollStep = 1 | 2 | 3;

type SideModalTabKey = "employees" | "branches";

const SIDEMODALTABS : {key:SideModalTabKey; label:string}[] = [
    { key: "employees", label: "Employees" },
    { key: "branches", label: "Branches" },
];

type SetupState = {
    EmpCode: string;
    Disbursing: boolean;
    WithAtm: boolean;
    Taxable: boolean;
};

type Setupcompanies ={
    CompanyCode:number;
    isDisburse: boolean;
}

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

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };



  // Disburse Code ↓
  const [shouldCheckModal, setShouldCheckModal] = useState(false);


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

  
  const {data: disburseCompanies = [],isFetching: isFetchingDisburseCompany,} = useDisburseCompanies({
    cycle: branchCycle as PayrollCycle,
    isDisburse: true,
  });

  const {data: notDisburseCompanies = [],isFetching: isFetchingNoDisburseCompany,} = useDisburseCompanies({
    cycle: branchCycle as PayrollCycle,
    isDisburse: false,
  });
      

  const originalEmployees = useMemo<Record<string, SetupState>>(() => {
    const combined = [
      ...(newEmployee?.data ?? []),
      ...(setupEmployee?.data ?? []),
    ];

    const map: Record<string, SetupState> = {};

    combined.forEach((emp) => {
      map[emp.EmpCode] = {
        EmpCode: emp.EmpCode,
        Disbursing: emp.Disbursing,
        WithAtm: emp.WithAtm,
        Taxable: emp.Taxable,
      };
    });

    return map;
  }, [newEmployee?.data, setupEmployee?.data]);

  const originalCompanies = useMemo<Record<number, Setupcompanies>>(() => {
    const combined = [...disburseCompanies, ...notDisburseCompanies];

    const map: Record<number, Setupcompanies> = {};

    combined.forEach((c) => {
      map[c.CompanyCode] = {
        CompanyCode: c.CompanyCode,
        isDisburse: c.isDisburse,
      };
    });

    return map;
  }, [disburseCompanies, notDisburseCompanies]);

  const [editedEmployees, setEditedEmployees] = useState<Record<string, SetupState>>({});
  const [baselineEmployees, setBaselineEmployees] = useState<Record<string, SetupState>>({});

  const [editedCompanies, setEditCompanies] = useState<Record<number, Setupcompanies>>({});
  const [baselineCompanies, setBaselineCompanies] = useState<Record<number, Setupcompanies>>({});
  


  const initialTab =
  (searchParams.get("tab") as SideModalTabKey) ?? "employees";


  const [active, setActive] = useState<SideModalTabKey>(initialTab);


  // Disburse Code ↑

  const { data: employee } = useEmployeesByCycle({
    cycle: branchCycle,
    page,
    limit: 6,
    search: debouncedSearch,
  });

  // Disburse Code ↓

  const {mutateAsync:saveSetup} = useUpdateEmployeeSetup();

  const { mutateAsync: saveCompanySetup } = useUpdateCompanySetup();

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
  if (
    isFetchingNew ||
    isFetchingSetup ||
    isFetchingDisburseCompany ||
    isFetchingNoDisburseCompany
  )
    return;

  const hasEmployees =
    (newEmployee?.data?.length ?? 0) > 0 ||
    (setupEmployee?.data?.length ?? 0) > 0;

  const hasCompanies =
    (disburseCompanies?.length ?? 0) > 0 ||
    (notDisburseCompanies?.length ?? 0) > 0;

  if (hasEmployees || hasCompanies) {
    queueMicrotask(() => {
      setEditedEmployees(originalEmployees);
      setBaselineEmployees(originalEmployees);

      setEditCompanies(originalCompanies);
      setBaselineCompanies(originalCompanies);

      setOpen(true);
    });
  }

  queueMicrotask(() => setShouldCheckModal(false));
}, [
  shouldCheckModal,
  isFetchingNew,
  isFetchingSetup,
  isFetchingDisburseCompany,
  isFetchingNoDisburseCompany,
  newEmployee?.data,
  setupEmployee?.data,
  disburseCompanies,
  notDisburseCompanies,
  originalEmployees,
  originalCompanies,
]);

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

// Disburse code ↓

  const handleResetChanges = () => {
    setEditedEmployees(baselineEmployees);
    setEditCompanies(baselineCompanies);
  };

  const handleSaveChanges = async () => {
    const changedEmployees = Object.values(editedEmployees).filter(emp => {
      const original = baselineEmployees[emp.EmpCode];
      if (!original) return false;

      return (
        emp.Disbursing !== original.Disbursing ||
        emp.WithAtm !== original.WithAtm ||
        emp.Taxable !== original.Taxable
      );
    });

    const changedCompanies = Object.values(editedCompanies).filter(company => {
      const original = baselineCompanies[company.CompanyCode];
      if (!original) return false;

      return company.isDisburse !== original.isDisburse;
    });

    if (changedEmployees.length === 0 && changedCompanies.length === 0) return;

    if (changedEmployees.length > 0) {
      await saveSetup({
        employees: changedEmployees.map(emp => ({
          empCode: emp.EmpCode,
          Disbursing: emp.Disbursing,
          WithAtm: emp.WithAtm,
          Taxable: emp.Taxable,
        })),
      });
    }

    if (changedCompanies.length > 0) {
      await saveCompanySetup({
        companies: changedCompanies.map(company => ({
          CompanyCode: String(company.CompanyCode),
          isDisburse: company.isDisburse,
        })),
      });
    }

    setBaselineEmployees(editedEmployees);
    setBaselineCompanies(editedCompanies);

    SweetAlert.successAlert("Payroll Setup Updated Successfully");
  };
  const employeeDirty = useMemo(() => {
      return Object.keys(editedEmployees).some((code) => {
        const edited = editedEmployees[code];
        const original = baselineEmployees[code];

        if (!original) return false;

        return (
          edited.Disbursing !== original.Disbursing ||
          edited.WithAtm !== original.WithAtm ||
          edited.Taxable !== original.Taxable
        );
      });
  }, [editedEmployees, baselineEmployees]);

  const companyDirty = useMemo(() => {
        const combined = [...disburseCompanies, ...notDisburseCompanies];

        return combined.some((company) => {
          const code = company.CompanyCode;

          const edited =
            editedCompanies[code]?.isDisburse ?? company.isDisburse;

          const original = baselineCompanies[code]?.isDisburse ?? company.isDisburse;

          return edited !== original;
        });
      }, [
        editedCompanies,
        baselineCompanies,
        disburseCompanies,
        notDisburseCompanies,
  ]);

  const isDirty = employeeDirty || companyDirty;


  const changeTab = (tab: SideModalTabKey) => {
    setActive(tab);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);

    if (tab !== "employees") {
      params.delete("page");
     
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const attemptTabChange = (tab: SideModalTabKey) => {
    if (!isDirty) {
      changeTab(tab);
      return;
    }

    SweetAlert.confirmationAlert(
      "Unsaved Changes",
      "You have unsaved changes. Do you want to save before switching tabs?",
      async () => {
        await handleSaveChanges();
        changeTab(tab);
      },
      () => {
        handleResetChanges();
        changeTab(tab);
      }
    );
  };



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
            onSearchChange={handleSearchChange}
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
            <ul className="flex gap-x-4 text-sm bg-mainLightGray py-2 px-4 rounded-lg text-mainLight mt-2">
                {SIDEMODALTABS.map(({ key, label }) => (
                  <li
                    key={key}
                    onClick={() => attemptTabChange(key)}
                    className={`px-4 py-2 rounded-md font-semibold cursor-pointer ${
                      active === key
                        ? "bg-mainLight text-mainGray"
                        : "hover:bg-mainLight hover:text-mainLightGray"
                    }`}
                  >
                    {label}
                  </li>
                ))}
              </ul>

                  {active == "employees" && (
                    <div className="flex flex-col w-full gap-y-8">
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
                  )}

                {(active == "branches" &&(
                  <div className="flex  flex-col gap-y-8">
                      <div className="flex flex-col w-full">
                        <div className="w-full text-start py-4">
                            <h6>Main Disburse Branches</h6>
                        </div>

                        <table className="w-full border-separate border-spacing-0 rounded-md overflow-hidden shadow-lg">
                            <thead className="bg-mainDark text-white">
                            <tr className="text-sm">
                              <th className="px-4 py-3 text-left">Company Name</th>
                              <th className="px-4 py-3 text-center">Disbursing</th>
                            </tr>
                          </thead>
                          <tbody>
                            {disburseCompanies.map((disburse) => (
                                <tr key={disburse.CompanyCode}>
                                  <td className="px-4 py-3 text-left">
                                    {disburse.CompanyName}
                                  </td>

                                  <td className="px-4 py-3 text-center">
                                    <input
                                      type="checkbox"
                                      checked={
                                        editedCompanies[disburse.CompanyCode]?.isDisburse ??
                                        disburse.isDisburse
                                      }
                                      onChange={(e) => {
                                        setEditCompanies((prev) => ({
                                          ...prev,
                                          [disburse.CompanyCode]: {
                                            CompanyCode: disburse.CompanyCode,
                                            isDisburse: e.target.checked,
                                          },
                                        }));
                                      }}
                                    />
                                  </td>
                                </tr>
                              ))
                            }
                            {disburseCompanies?.length === 0 && (
                              <tr>
                                <td colSpan={4} className="text-center p-4 text-gray-500">
                                  No Disburse Companies found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex flex-col w-full">
                        <div className="w-full text-start py-4">
                            <h6>Optional Disburse Branches</h6>
                        </div>
                        <table className="w-full border-separate border-spacing-0 rounded-md overflow-hidden shadow-lg">
                            <thead className="bg-mainDark text-white">
                            <tr className="text-sm">
                              <th className="px-4 py-3 text-left">Company Name</th>
                              <th className="px-4 py-3 text-center">Disbursing</th>
                            </tr>
                          </thead>
                          <tbody>
                            {notDisburseCompanies.map((disburse) => (
                                <tr key={disburse.CompanyCode}>
                                  <td className="px-4 py-3 text-left">
                                    {disburse.CompanyName}
                                  </td>

                                  <td className="px-4 py-3 text-center">
                                    <input
                                      type="checkbox"
                                      checked={
                                        editedCompanies[disburse.CompanyCode]?.isDisburse ??
                                        disburse.isDisburse
                                      }
                                      onChange={(e) => {
                                        setEditCompanies((prev) => ({
                                          ...prev,
                                          [disburse.CompanyCode]: {
                                            CompanyCode: disburse.CompanyCode,
                                            isDisburse: e.target.checked,
                                          },
                                        }));
                                      }}
                                    />
                                  </td>
                                </tr>
                              ))
                            }
                            {notDisburseCompanies?.length === 0 && (
                              <tr>
                                <td colSpan={4} className="text-center p-4 text-gray-500">
                                  No Companies found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>

                      </div>
                  </div>
                )

                )}


              </div>
      </SideModalLayout>
    )}

    {/* // Disburse Code ↑ */}



    </div>
  );
  
}
