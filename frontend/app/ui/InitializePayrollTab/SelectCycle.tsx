
import Datatable from "@/app/components/Datatable";
import { Pagination } from "@/app/components/Pagination";
import SideModalLayout from "@/app/components/SideModal";
import SweetAlert from "@/app/components/Swal";
import { TabItem, Tabs } from "@/app/components/Tab";
import { useAuth } from "@/app/components/UserContext";
import { normalizeDisabledRanges } from "@/app/helper/flatPickerHelper";
import { useDebounce } from "@/app/helper/useDebounce";
import { useDisburseCompanies, useUpdateCompanySetup, useUpdateEmployeeSetup } from "@/app/hooks/disburse";
import { useRouter, useSearchParams } from "next/navigation";
import { PayrollCycle } from "@/app/types/disburseType";
import { useDisabledPayrollDates, useFetchApiAttendance } from "@/app/hooks/useApiProcess";
import {  usefetchInitializePayroll, useImportBranches } from "@/app/hooks/usePreparePayroll";
import { Column, EmployeeRow } from "@/app/types/preparePayroll";
import { DateRange } from "@/app/types/utilsTypes";
import DateRangePicker from "@/app/ui/DateRangePicker";
import SelectPayroll from "@/app/ui/InitializePayrollTab/SelectDate";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { ProcessingOverlay } from "../loader/ProcessingOverlay";

type SideModalTabKey = "employees" | "branches";

const SIDEMODALTABS : { key:SideModalTabKey; label:string }[] = [
    { key: "employees", label: "Employees" },
    { key: "branches", label: "Branches" },
];


type SetupState = {
    EmpCode: string;
    Disbursing: boolean;
    WithAtm: boolean;
    Taxable: boolean;
};



type Setupcompanies = {
    CompanyCode:number;
    isDisburse: boolean;
}

interface SelectCycleProps {
    branchCycle: string;
    setBranchCycle: React.Dispatch<React.SetStateAction<string>>;
  }

export default function SelectCycle({ setBranchCycle,branchCycle}:SelectCycleProps){
      const { hasPermission } = useAuth()
      const { mutate, isPending} = useImportBranches();
      const [page, setPage] = useState(1);
      const [search, setSearch] = useState("");
      const debouncedSearch = useDebounce(search, 400);
      const [range, setDateRange] = useState<DateRange | null>(null);
      
      const queryClient = useQueryClient();
      const [open, setOpen] = useState(false);
      const PAGE_SIZE = 10;

      const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
      };
    

      const router = useRouter();
      const searchParams = useSearchParams();


    // Disburse Code ↓
    const [shouldCheckModal, setShouldCheckModal] = useState(false);


    const { data: newEmployee, isFetching: isFetchingNew } = usefetchInitializePayroll({
      cycle: branchCycle,
      page,
      limit: 500,
      search: debouncedSearch,
      onlyNew: true,
    });

    const { data: setupEmployee, isFetching: isFetchingSetup } = usefetchInitializePayroll({
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


      
      const { data: employee } = usefetchInitializePayroll({
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
      
        // const showProcessing = isFetching && !!range;
      
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
      
      
      
        const tableData: EmployeeRow[] = employee?.data ?? [];
      
        const columns: Column<EmployeeRow>[] = [
          {
            header: "Employee",
            render: (row) =>
              `${row.Lastname}, ${row.Firstname}`,
          },
          {
            header:"Emp Code",
            accessor: (row) => row.EmpCode,
          },
          {
            header:"Branch",
            render: (row) =>
              `${row.BranchCode?.branchCode}`,
          },
          {
            header:"Basic Pay",
            accessor: (row) => row.basic_salary,
          },
        ]
      
        const { data: disabledRanges = [] } = useDisabledPayrollDates(branchCycle);
        const flatpickrDisabled = normalizeDisabledRanges(disabledRanges);
      
    

    return(

          <div className="shadow-xl border border-slate-200 rounded p-4">

           
        
                        
                        {hasPermission("PAYROLL_INITIALIZE") && (
                            <div className="mb-2 flex justify-between">
        
        
                                <div className="flex flex-col">
                                    <label className="mb-1 text-xs font-medium text-slate-600">Choose Payroll Cycle</label>
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
                            )}
                            
        
        
                
                                <div>
                                <div className="flex justify-end mb-4 pt-2">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="w-64 px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                                    />   
                                </div>
        
                                    <Datatable columns={columns} data={tableData} />
        
                                    <Pagination
                                    page={page}
                                    totalPages={employee?.meta.totalPages ?? 1}
                                    totalItems={employee?.meta.total ?? 0}
                                    pageSize={PAGE_SIZE}
                                    onPageChange={setPage}
                                    />
                                </div>













                                 {/* // Disburse Code ↓ */}
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
                            {setupEmployee?.data?.length === 0 && (
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