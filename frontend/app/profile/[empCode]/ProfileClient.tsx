"use client";

import GenButton from "@/app/components/Buttons";
import SweetAlert from "@/app/components/Swal";
import { useEmployeeProfile } from "@/app/hooks/employees";
import { useUpdateEmployeePayroll } from "@/app/hooks/employees";
import { PayrollFormState } from "@/app/types/empTypes";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, useRef} from "react";


type ProfileClientProps = {
  empCode: string;
};

type TabKey = "personal" | "job-pay" | "loans";

const TABS: { key: TabKey; label: string }[] = [
  { key: "personal", label: "Personal" },
  { key: "job-pay", label: "Job & Pay" },
  { key: "loans", label: "Loans" },
];

export default function ProfileClient({ empCode }: ProfileClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data, isLoading, isError } = useEmployeeProfile(empCode);

  const salaryPrompted = useRef(false);
  
  const updatePayroll = useUpdateEmployeePayroll();
  
  const details = data?.employeepr?.[0] ?? null;
  const payInfo = data?.employeepayroll;
  const loans = data?.loan_details ?? [];


  const initialValues = useMemo<PayrollFormState>(() => {
    return {
      basicSalary: String(payInfo?.BasicSalary ?? ""),
      cashAssistance: String(payInfo?.CashAssistance ?? ""),
      ecola: String(payInfo?.Ecola ?? ""),
      pagibigEmployeeShare: String(payInfo?.pagibigEmployeeShare ?? ""),
      WithAtm: Boolean(data?.WithAtm ?? false),
      Disbursing: Boolean(data?.Disbursing ?? false),
      Taxable:Boolean(data?.Taxable ?? false),
      bankAccount: String(payInfo?.bankAccount ?? ""),
    };
  }, [payInfo, data]);

  const [formValues, setFormValues] = useState<PayrollFormState>(initialValues);

    
  const initialTab =
  (searchParams.get("tab") as TabKey) ?? "personal";

  const initialPage =
    Number(searchParams.get("page")) || 1;

  const [active, setActive] = useState<TabKey>(initialTab);
  const [loanPage, setLoanPage] = useState(initialPage);


  useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);


  useEffect(() => {
    if (!payInfo) return;

    const basicSalaryValue = Number(initialValues.basicSalary);

    const isSalaryEmpty =
      !initialValues.basicSalary ||
      basicSalaryValue === 0 ||
      isNaN(basicSalaryValue);

    if (isSalaryEmpty && !salaryPrompted.current) {
      salaryPrompted.current = true;
      setActive("job-pay");

      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "job-pay");
      params.delete("page");

      router.replace(`?${params.toString()}`, { scroll: false });

      SweetAlert.warningAlert(
        "Missing Salary",
        "Basic salary is not set. Please update the salary information."
      );
    }
  }, [payInfo, initialValues, router, searchParams]);

  const isDirty =
    initialValues &&
    formValues &&
    JSON.stringify(initialValues) !== JSON.stringify(formValues);


  
  useEffect(() => {
    if (active !== "loans") return;

    const currentTab = searchParams.get("tab");
    const currentPage = searchParams.get("page");

    if (currentTab === "loans" && currentPage === String(loanPage)) {
      return; 
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "loans");
    params.set("page", String(loanPage));

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [active, loanPage, searchParams, router]);

  useEffect(() => {
    if (!empCode || isError) {
      router.replace("/employee-list");
    }
  }, [empCode, isError, router]);



  if (isLoading) {
    return <div className="p-6">Loading employee profile…</div>;
  }

  if (!data) return null;


  const LOANS_PER_PAGE = 3;
  const totalLoanPage = Math.max(1, Math.ceil(loans.length / LOANS_PER_PAGE));

  const paginatedLoans = loans.slice(
    (loanPage - 1) * LOANS_PER_PAGE,
    loanPage * LOANS_PER_PAGE
  );

  const companyCode = data.BranchCode?.CompanyCode?.CompanyCode;

  const changeTab = (tab: TabKey) => {
    setActive(tab);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);

    if (tab !== "loans") {
      params.delete("page");
      setLoanPage(1);
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  };


  const handleTabChange = async (tab: TabKey) => {

    if (isDirty) {
      const result = await SweetAlert.warningAlert(
        "Unsaved Changes",
        "You have unsaved changes. Do you want to save before leaving?"
      );

      if (result.isConfirmed) {
        await handleSave();
        changeTab(tab);
      }

      return;
    }

    changeTab(tab);
  };


  const handleBack = async () => {

    if (isDirty) {
      const result = await SweetAlert.warningAlert(
        "Unsaved Changes",
        "You have unsaved changes. Do you want to save before leaving?"
      );

      if (result.isConfirmed) {
        await handleSave();
        router.back();
      }

      return;
    }

    router.back();
  };


  const handleSave = async () => {
    if (!formValues) return;

    const basicChanged =
      Number(formValues.basicSalary) !== Number(initialValues.basicSalary);

    const cashChanged =
      Number(formValues.cashAssistance) !== Number(initialValues.cashAssistance);

    const ecolaChanged =
      Number(formValues.ecola) !== Number(initialValues.ecola);


    const shouldRequireRemarks = basicChanged || cashChanged || ecolaChanged;

    const payload = {
      empCode,
      basicSalary: Number(formValues.basicSalary),
      cashAssistance: Number(formValues.cashAssistance),
      ecola: Number(formValues.ecola),
      pagibigEmployeeShare: Number(formValues.pagibigEmployeeShare),
      WithAtm: formValues.WithAtm,
      Disbursing: formValues.Disbursing,
      Taxable:formValues.Taxable,
      bankAccount: String(formValues.bankAccount),
    };

    try {
      if (shouldRequireRemarks) {
        SweetAlert.remarksConfirmationAlertDropdown(
          "Salary Adjustment",
          "Please select the reason for modifying salary components.",
          [
            { value: "None", label:"None"},
            { value: "Regularization Increase", label: "Regularization Increase"},
            { value: "Salary Increase", label: "Salary Increase" },
            { value: "Goverment Increase", label: "Goverment Increase" },
            { value: "Merit Increase", label: "Merit Increase" },
            { value: "Transfer Salary", label: "Salary Mod (Transfered Emp)" },
          ],
          async (remarks: string) => {
            await updatePayroll.mutateAsync({
              ...payload,
              remarks,
            });

            SweetAlert.successAlert("Saved Changes Successfully");
          }
        );
      } else {
        await updatePayroll.mutateAsync(payload);
        SweetAlert.successAlert("Saved Changes Successfully");
      }
    } catch (error) {
      console.error("Failed to update payroll", error);
    }
  };

  if (!formValues) {
  return <div className="p-6">Loading employee profile…</div>;
}


  return (
    <div className="w-[90%] flex flex-col gap-y-6">

      <div className="flex justify-between items-end">
        <h1 className="text-2xl font-bold">Employee Details</h1>

      <GenButton
        variant="secondary"
        onClick={handleBack}
      >
        <ArrowLeft size={16} />
        Go back to Employee List
      </GenButton>

      </div>

      <ul className="flex gap-x-4 bg-mainBg py-3 px-4 rounded-lg text-mainLight mt-2">
        {TABS.map(({ key, label }) => (
          <li
            key={key}
            onClick={() => handleTabChange(key)}
            className={`px-6 py-2 rounded-md font-semibold cursor-pointer ${
              active === key
                ? "bg-mainLight text-mainBg"
                : "hover:bg-mainLight hover:text-mainBg"
            }`}
          >
            {label}
          </li>
        ))}
      </ul>

      {active == "personal" && (
        <div className="w-full flex gap-x-6">

          <div className="w-[30%] flex flex-col gap-y-4 py-4 px-8 min-h-screen bg-mainLight rounded-xl shadow-[0px_4px_8px_2px_rgba(0,0,0,0.1)]">
              
            <div className="flex flex-col gap-y-4 justify-center items-center border-b border-mainNeutral py-6">
                
                <Image
                src={companyCode ? `/images/${companyCode}.svg` : "/images/default.svg"}
                alt={companyCode? `${companyCode} LOGO` : ""}
                width={150}
                height={50}
                priority
                />

                <div className="flex flex-col items-center gap-y-2">
                  
                  <h1 className="text-xl font-semibold">{data.Firstname} {data.Middlename} {data.Lastname}</h1>
                  <h1 className="text-lg font-normal">{data.Position ?? "None"}</h1>
                
                </div>
                
            </div>

            <div className="flex flex-col gap-y-4">

              <div className="flex flex-col gap-y-1">
                <span className="text-sm text-gray-500">Employee Code</span>
                <p className="font-semibold">{data.EmpCode}</p>
              </div>

              <div className="flex flex-col gap-y-1">
                <span className="text-sm text-gray-500">Employment Status</span>
                <p className="font-semibold">{data.EmploymentStatus}</p>
              </div>

            </div>
          
          </div>

          <div className="flex-1 flex flex-col gap-y-8 p-8  min-h-screen bg-mainLight rounded-xl shadow-[0px_4px_8px_2px_rgba(0,0,0,0.1)]">
              
              <div className="flex flex-col gap-y-6">
                <div className="flex flex-col gap-y-4">
                    <h1 className="font-bold text-lg">Personal Information</h1>
                </div>
                <div className="grid grid-cols-4 gap-y-8">
                    <div className="flex flex-col gap-y-1">
                      <span className="text-sm text-gray-500">Firstname</span>
                      <p className="font-semibold">{data.Firstname ?? "None"}</p>
                    </div>
                    <div className="flex flex-col gap-y-1">
                      <span className="text-sm text-gray-500">Middle</span>
                      <p className="font-semibold">{data.Middlename ?? "None"}</p>
                    </div>
                    <div className="flex flex-col gap-y-1">
                      <span className="text-sm text-gray-500">Surename</span>
                      <p className="font-semibold">{data.Lastname ?? "None"}</p>
                    </div>
                    <div className="flex flex-col gap-y-1">
                      <span className="text-sm text-gray-500">Suffix</span>
                      <p className="font-semibold">None</p>
                    </div>
                    <div className="flex flex-col gap-y-1 ">
                      <span className="text-sm text-gray-500">Department</span>
                      <p className="font-semibold">{data.Department ?? "None"}</p>
                    </div>
                    <div className="flex flex-col gap-y-1 col-span-3">
                      <span className="text-sm text-gray-500">Branch Code</span>
                      <p className="font-semibold">{data.BranchCode?.branchCode ?? "None"}</p>
                    </div>
                    <div className="flex flex-col gap-y-1 col-span-4">
                      <span className="text-sm text-gray-500">Address</span>
                      <p className="font-semibold">{data.Address ?? "None"}</p>
                    </div>
                </div>
              </div>

              <div className="flex flex-col gap-y-6">
                <div className="flex flex-col gap-y-4">
                    <h1 className="font-bold text-lg">Employee Identification</h1>
                </div>
                <div className="grid grid-cols-4 gap-y-8">
                  <div className="flex flex-col gap-y-1 col-span-2">
                    <span className="text-sm text-gray-500">SSS Identification</span>
                    <p className="font-semibold">{details?.EmpSSSNo?.trim() || "None"}</p>
                  </div>

                  <div className="flex flex-col gap-y-1 col-span-2">
                    <span className="text-sm text-gray-500">PhilHealth Identification</span>
                    <p className="font-semibold">
                      {details?.EmpPhilhlthNo?.trim() || "None"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-y-1 col-span-2">
                    <span className="text-sm text-gray-500">TIN</span>
                    <p className="font-semibold">
                      {details?.EmpTin ?? "None"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-y-1 col-span-2">
                    <span className="text-sm text-gray-500">Pag-Ibig</span>
                    <p className="font-semibold">
                      {details?.EmpPagibigNo ?? "None"}
                    </p>
                  </div>
                </div>

              </div>

          </div>

          

          
          

        </div>
      )}
    
      {active == "job-pay" && (

        <div className="w-full flex">
          
          <div className="w-full flex flex-col min-h-screen gap-y-4 py-8 px-8 bg-mainLight rounded-xl shadow-[0px_4px_8px_2px_rgba(0,0,0,0.1)]">
              
              <div className="grid grid-cols-2 gap-x-8">

                 {/* Payroll Breakup */}
                <div className="flex flex-col gap-y-8 border-r border-mainNeutral">

                  <div className="flex flex-col gap-y-6 ">

                    <div className="flex flex-col gap-y-4">
                        <h1 className="font-bold text-lg">Employee Identification</h1>
                    </div>

                    <div className="grid grid-cols-4 gap-y-4">
                     
                      
                      <div className="flex flex-col gap-y-1 col-span-2">
                        <span className="text-sm text-gray-500">Salary Structure Alloted</span>
                        <p className="font-semibold">{data?.Position?.trim() || "None"}</p>
                      </div>

                      <div className="flex flex-col gap-y-1 col-span-2">
                        <span className="text-sm text-gray-500">Cost To Company</span>
                        <p className="font-semibold">{payInfo?.TotalSalary || "None"}</p>
                      </div>

                       <div className="flex flex-col gap-y-1 col-span-3">
                        <span className="text-sm text-gray-500 ">Bank Account</span>
                          
                          <input
                            type="text"
                            value={formValues.bankAccount}
                            onChange={(e) =>
                              setFormValues(prev => ({
                                ...prev,
                                bankAccount: e.target.value
                              }))
                            }
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white"
                          />

                      </div>

                    </div>

                  <div className="inline-flex gap-x-8 justify-start items-center">
                  
                    <div className="flex items-center gap-x-3 col-span-2">
                      <input
                        type="checkbox"
                        checked={formValues.WithAtm}
                        onChange={(e) =>
                          setFormValues(prev => ({
                            ...prev,
                            WithAtm: e.target.checked
                          }))
                        }

                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        With ATM
                      </span>
                    </div>
                    <div className="flex items-center gap-x-3 col-span-2">
                      <input
                        type="checkbox"
                        checked={formValues.Disbursing}
                        onChange={(e) =>
                          setFormValues(prev => ({
                            ...prev,
                            Disbursing: e.target.checked
                          }))
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        Disbursing
                      </span>
                    </div>
                    <div className="flex items-center gap-x-3 col-span-2">
                      <input
                        type="checkbox"
                        checked={formValues.Taxable}
                        onChange={(e) =>
                          setFormValues(prev => ({
                            ...prev,
                            Taxable: e.target.checked
                          }))
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        Taxable
                      </span>
                    </div>
                </div>

                  </div>
                  
                  <div className="border-b border-mainNeutral"></div>

                  <div className="flex flex-col gap-y-6">
                    
                    <div className="flex flex-col gap-y-4">
                        <h1 className="font-bold text-lg">CTC Breakup Information</h1>
                    </div>

                    <div className="grid grid-cols-4 gap-x-8 pr-8">

                      <div className="flex flex-col gap-y-1 col-span-2">
                        <span className="text-sm text-gray-500 ">Basic Salary</span>
                      
                      <input
                        type="number"
                        value={formValues.basicSalary}
                        onChange={(e) =>
                          setFormValues(prev => ({
                            ...prev,
                            basicSalary: e.target.value
                          }))
                        }
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white"
                      />

                      </div>

                      <div className="flex flex-col gap-y-1 col-span-2">
                        <span className="text-sm text-gray-500">Cash Assistance</span>
                        <input
                          type="number"
                          value={formValues.cashAssistance}
                          onChange={(e) =>
                            setFormValues(prev => ({
                              ...prev,
                              cashAssistance: e.target.value
                            }))
                          }
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white"
                        />

                      </div>

                    </div>

                    <div className="grid grid-cols-4 gap-x-8 pr-8">

                      <div className="flex flex-col gap-y-1 col-span-2">
                        <span className="text-sm text-gray-500">ECOLA</span>
                        <input
                          type="number"
                          value={formValues.ecola}
                          onChange={(e) =>
                            setFormValues(prev => ({
                              ...prev,
                              ecola: e.target.value
                            }))
                          }
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white"
                        />

                      </div>

                      <div className="flex flex-col gap-y-1 col-span-2">
                        <span className="text-sm text-gray-500">Total E-share Deductions</span>
                 
                        <input
                          type="text"
                          value={payInfo?.totalEdeduction || "None"}
                          readOnly
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white"
                        />
                      </div>

                     


                    </div>

                  </div>

                </div>

                {/* Deduction Breakup */}
                <div className="flex flex-col gap-y-4">

                  <div className="flex flex-col gap-y-6">

                      <div className="flex flex-col gap-y-4">
                          <h1 className="font-bold text-lg">E-Share Deduction Breakup Information</h1>
                      </div>

                      <div className="grid grid-cols-4 gap-x-8 pr-8">

                        <div className="flex flex-col gap-y-1 col-span-2">
                          <span className="text-sm text-gray-500">SSS Contribution</span>
                          <input
                            type="text"
                            value={payInfo?.sssContribEmployee || "None"}
                            readOnly
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white"
                          />
                        </div>

                        <div className="flex flex-col gap-y-1 col-span-2">
                          <span className="text-sm text-gray-500">Pag-ibig Contribution</span>
                            <input
                              type="number"
                              value={formValues.pagibigEmployeeShare}
                              onChange={(e) =>
                                setFormValues(prev => ({
                                  ...prev,
                                  pagibigEmployeeShare: e.target.value
                                }))
                              }
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white"
                          />
                        </div>

                      </div>

                      <div className="grid grid-cols-4 gap-x-8 pr-8">

                        <div className="flex flex-col gap-y-1 col-span-2">
                          <span className="text-sm text-gray-500">Phil-Health Contribution</span>
                          <input
                            type="text"
                            value={payInfo?.philhealthRateEmployee || "None"}
                            readOnly
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white"
                          />
                        </div>

                  
                      </div>

                  </div>
                          
                  <div className="flex justify-end mt-6 mx-8">
                        <GenButton
                          disabled={!isDirty}
                          onClick={handleSave}
                        >
                          Save Changes
                        </GenButton>
                  </div>
                  
                </div>

               

              </div>

          </div>

        </div>
      )}
      
      {active === "loans" && (
        <div className="w-full flex flex-col">
          <div className="w-full flex flex-col min-h-screen gap-y-6 py-8 px-8 bg-mainLight rounded-xl shadow-[0px_4px_8px_2px_rgba(0,0,0,0.1)]">

            <h1 className="text-lg font-bold">Employee Loans</h1>

            {loans.length === 0 ? (
              <p className="text-gray-500 w-full bg-mainNeutral py-4 flex justify-center items-center rounded-lg">No loan records found.</p>
            ) : (
              <div className="flex flex-col gap-y-4">
                {paginatedLoans.map((loan) => (
                  <div
                    key={loan.loan_id}
                    className="grid grid-cols-4 gap-y-4 gap-x-6 p-6 border border-mainNeutral rounded-lg"
                  >
                    <div>
                      <span className="text-sm text-gray-500">Loan Type</span>
                      <p className="font-semibold">{loan.loan_type}</p>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500">Principal</span>
                      <p className="font-semibold">{loan.principal}</p>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500">Term</span>
                      <p className="font-semibold">
                        {loan.term_value} {loan.term_unit}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500">Start Date</span>
                      <p className="font-semibold">
                        {new Date(loan.start_date).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500">Per Payroll Deduction</span>
                      <p className="font-semibold">{loan.per_payroll_deduct}</p>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500">Deduct Allowance</span>
                      <p className="font-semibold">
                        {loan.deduct_allowance ? "Yes" : "No"}
                      </p>
                    </div>

                    <div className="inline-flex items-end">
                        <span
                          className={`text-sm font-medium px-2 py-1 rounded ${
                            loan.status === "ACTIVE" ? "bg-positive" : "bg-negative"
                          } text-white`}
                          >
                          {loan.status}
                        </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {loans.length !== 0 && (
              <div className="flex justify-end gap-x-2 mt-6">

                <GenButton
                  variant="secondary"
                  disabled={loanPage === 1}
                  onClick={() => setLoanPage(p => p - 1)}
                >
                  Previous
                </GenButton>

                <GenButton
                  variant="secondary"
                  disabled={loanPage === totalLoanPage}
                  onClick={() => setLoanPage(p => p + 1)}
                >
                  Next
                </GenButton>


              </div>
            )}
              



          </div>
          
        </div>
        
        
      )}


      
      
  
    </div>
  );
}


