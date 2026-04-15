"use client";

import React, { useRef, useState } from "react";
import {
  useAddLoan,
  useBonusRules,
  useLoans
} from "../../hooks/useLoans";
import { useEmployeeSearch ,useLoanSummary } from "../../hooks/useLoans";
import SweetAlert from "../../components/Swal";
import GenButton from "@/app/components/Buttons";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Filter, Printer } from "lucide-react";
import ActiveFilters from "@/app/components/FilterObject";
import FilterModal from "@/app/components/Filter";
import LoanCard from "@/app/components/loans/loanCard";
import { FilterProvider, useFilters } from "@/app/components/FilterContext";
import { ApiErrorResponse, AreType, EmployeeSearchItem, LoanType, TermUnit } from "@/app/types/loanTypes";
import { AxiosError } from "axios";
import RequestModal from "@/app/components/Modal";
import { useCompanies, useLoanTypes } from "@/app/hooks/useGeneral";
import { useReactToPrint } from "react-to-print";
import { useAuth } from "@/app/components/UserContext";


type TabKey = "apply"| "are" | "loan-list" ;
type SubTabKey = "monitoring"| "accounts";

const FILTER_KEYS = [
  "department",
  "company",
  "status",
  "loanStatus"
] as const;

const TABS: { key: TabKey; label: string }[] = [
  { key: "apply", label: "Loan Application" },
  { key: "are", label: "ARE Application"},
  { key: "loan-list", label: "Loan Applicants" }
];

const SUBTABS: { key: SubTabKey; label: string }[] = [
  { key: "monitoring", label: "LOAN MONITORING"},
  { key: "accounts", label: "LOAN ACCOUNTS"},
];


function LoanApplyContent() {
    const addLoan = useAddLoan();



    const [selectedEmp, setSelectedEmp] = useState<{
      EmpCode: string;
      Firstname: string;
      Lastname: string;
      basic_salary:number
    } | null>(null);


    const {
        data: bonusRules,
        isLoading: bonusLoading,
        isError: bonusError
    } = useBonusRules();
   
    const [searchloan, setSearch] = useState("");
    
    const { data: employees } = useEmployeeSearch(searchloan);

    const [loanType, setLoanType] = useState<LoanType>("FCH_LOAN");
    const [principal, setPrincipal] = useState<number | "">("");
    const [termValue, setTermValue] = useState(1);
    const [termUnit, setTermUnit] = useState<"MONTHS" | "YEARS">("MONTHS");
    const [startDate, setStartDate] = useState("");
    const [deductAllowance, setDeductAllowance] = useState(false);
    const [selectedBonus, setSelectedBonus] = useState("");
    const [calamity, setCalamity] = useState("");

    const [maxBonusPrincipal, setMaxBonusPrincipal] = useState<number | null>(null);


    const resetApplyForm = () => {
      setSelectedEmp(null);
      setSearch("");
      setLoanType("FCH_LOAN");
      setPrincipal("");
      setTermValue(1);
      setTermUnit("MONTHS");
      setStartDate("");
      setDeductAllowance(false);
      setSelectedBonus("");
      setCalamity("");
    };
  


  const handleSave = async () => {
    if (!selectedEmp || !principal)
      return;

    try {
      
      const result =
        await addLoan.mutateAsync({
          empCode: selectedEmp.EmpCode,
          loan_type: loanType,
          principal: Number(principal),
          term_value: termValue,
          term_unit: termUnit,
          start_date: startDate,
          deduct_allowance: deductAllowance,
          others_type:
          loanType === "OTHERS"
            ? selectedBonus
            : ["SSS_LOAN", "PAGIBIG_LOAN"].includes(loanType)
              ? calamity
              : "",
        });

      if (!result?.loan_id)
        throw new Error("Loan not saved");

      SweetAlert.successAlert("Loan added");
      resetApplyForm();
        } catch (error: unknown) {

          if (error instanceof AxiosError) {

            const response = error.response?.data as ApiErrorResponse | undefined;

            if (response?.code === "LOAN_LIMIT_EXCEEDED") {
                SweetAlert.warningAlert(
                    "Loan Application Failed",
                    `
                      Net Salary (Per Payroll): ${response.details?.salary.netPerPayroll.toFixed(2)}
                      Max Allowed (50%): ${response.details?.salary.maxAllowedLoanDeduction.toFixed(2)}

                      Existing Loan Total: ${response.details?.loans.totalExistingLoanDeduction.toFixed(2)}
                      New Loan Deduction: ${response.details?.loans.newLoanDeduction.toFixed(2)}

                      Total With New Loan: ${response.details?.loans.totalWithNewLoan.toFixed(2)}
                      Excess Amount: ${response.details?.loans.excessAmount.toFixed(2)}
                    `
                  );
              return;
            }

            SweetAlert.warningAlert(
              "Loan Application Failed",
              response?.message || "Loan creation failed."
            );
            return;
          }

          SweetAlert.warningAlert(
            "Loan Application Failed",
            "Unexpected error occurred."
          );
        }
  };

  const getBonusPrincipal = (
      e: React.ChangeEvent<HTMLSelectElement>
    ) => {
      const code = e.target.value;
      setSelectedBonus(code);

      if (!selectedEmp || !bonusRules) return;

      const selectedRule = bonusRules.find(
        (rule) => rule.code === code
      );

      if (!selectedRule) return;

      let computedPrincipal = selectedEmp.basic_salary;

      if (selectedRule.formulaType === "BASIC_DIV_2") {
        computedPrincipal = selectedEmp.basic_salary / 2;
      }
      else if (selectedRule.formulaType === "BASIC_DIV_1") {
        computedPrincipal = selectedEmp.basic_salary
      }

      setPrincipal(computedPrincipal);
      setMaxBonusPrincipal(computedPrincipal);
  };

  const editPrincipalBonus = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value =
      e.target.value === "" ? "" : Number(e.target.value);

    if (
      loanType === "OTHERS" &&
      typeof value === "number" &&
      maxBonusPrincipal !== null &&
      value > maxBonusPrincipal
    ) {
      SweetAlert.warningAlert(
        "Invalid Amount",
        `Maximum allowed amount is ${maxBonusPrincipal.toFixed(2)}`
      );
      return;
    }

    setPrincipal(value);
  };
    return(
        <div className="flex flex-col gap-y-8">

                    <div className="relative">
                        <label className="block text-sm font-semibold mb-2">
                        Employee
                        </label>
                        <input
                        type="text"
                        placeholder="Search name or employee code..."
                        value={selectedEmp ? `${selectedEmp.Lastname}, ${selectedEmp.Firstname}` : searchloan}
                        onChange={(e) => {
                            setSelectedEmp(null);
                            setSearch(e.target.value);
                        }}
                        className="w-full border border-gray-300 px-4 py-2.5 rounded-md bg-mainNeutral focus:outline-none focus:ring-2 focus:ring-mainDark focus:border-transparent transition-all"
                        />

                        {!selectedEmp && employees && employees.length > 0 && (
                        <div className="absolute z-10 bg-mainNeutral border border-gray-200 w-full rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                            {employees.map((emp) => (
                            <div
                                key={emp.EmpCode}
                                onClick={() => {
                                setSelectedEmp(emp);
                                setSearch("");
                                }}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0">
                                <div className="font-medium text-gray-900">
                                {emp.Lastname}, {emp.Firstname}
                                </div>
                                <div className="text-sm text-gray-500">
                                {emp.EmpCode}
                                </div>
                            </div>
                            ))}
                        </div>
                        )}
                    </div>



                

                
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">
                            Employee Code
                            </label>
                            <input
                                type="text"
                                disabled
                                value={selectedEmp?.EmpCode ?? ""}
                                readOnly
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-mainNeutral focus:outline-none focus:ring-2 focus:ring-mainDark focus:border-transparent transition-all"
                            />
                        </div>
                            
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">
                                Type of Loan
                            </label>
                            <select 
                                value={loanType} 
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                  setLoanType(e.target.value as LoanType)
                                }
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-mainNeutral focus:outline-none focus:ring-2 focus:ring-mainDark focus:border-transparent transition-all"
                            >
                                <option value="FCH_LOAN">FCH Loan</option>
                                <option value="SSS_LOAN">SSS Loan</option>
                                <option value="PAGIBIG_LOAN">Pag-IBIG Loan</option>
                                <option value="RFC_LOAN">RFC Housing Loan</option>
                                <option value="OTHERS">Others...</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">
                                Principal Amount
                            </label>
                              <input
                                type="number"
                                placeholder="Enter amount"
                                value={principal}
                                onChange={editPrincipalBonus}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-mainNeutral focus:outline-none focus:ring-2 focus:ring-mainDark focus:border-transparent transition-all"
                              />
                        </div>

                      { loanType !== "OTHERS" && (<div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">
                                Start Date
                            </label>
                            <input 
                                type="month" 
                                value={startDate} 
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-mainNeutral focus:outline-none focus:ring-2 focus:ring-mainDark focus:border-transparent transition-all"
                            />
                        </div>)}

                        { loanType !== "OTHERS" && (<div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">
                                Term 
                            </label>
                            <input 
                                type="number" 
                                min={1} 
                                placeholder="Enter duration"
                                value={termValue} 
                                onChange={e => setTermValue(Number(e.target.value))}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-mainNeutral focus:outline-none focus:ring-2 focus:ring-mainDark focus:border-transparent transition-all"
                            />
                        </div>)}

                        { loanType !== "OTHERS" && (<div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">
                                Term Unit
                            </label>
                            <select 
                                value={termUnit} 
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                  setTermUnit(e.target.value as TermUnit)
                                }
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-mainNeutral focus:outline-none focus:ring-2 focus:ring-mainDark focus:border-transparent transition-all">
                                <option value="MONTHS">Months</option>
                                <option value="YEARS">Years</option>
                            </select>
                        </div>)}

                              
                        { loanType === "OTHERS" && (
                            <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">
                                Type of Bonus
                            </label>

                            <select
                                value={selectedBonus}
                                onChange={getBonusPrincipal}
                                disabled={bonusLoading || bonusError}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-mainNeutral focus:outline-none focus:ring-2 focus:ring-mainDark focus:border-transparent transition-all"
                            >
                                <option value="">Select Bonus Type</option>

                                {bonusRules?.map((rule) => (
                                <option key={rule.code} value={rule.code}>
                                    {rule.code} - {rule.name}
                                </option>
                                ))}
                            </select>
                        </div>
                        )}

                        {["SSS_LOAN", "PAGIBIG_LOAN"].includes(loanType)&&(
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">
                                Type of Loan
                            </label>

                            <select
                                value={calamity}
                                onChange={(e) => setCalamity(e.target.value)}
                            
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-mainNeutral focus:outline-none focus:ring-2 focus:ring-mainDark focus:border-transparent transition-all"
                            >
                                <option value="">Optional Selection</option>

                                <option value="Calamity">Calamity</option>
                            </select>
                          </div>
                        )}

                        { ["FCH_LOAN", "RFC_LOAN"].includes(loanType) &&(
                            <div className="inline-flex gap-2 w-full items-center">
                                <input
                                    type="checkbox"
                                    checked={deductAllowance}
                                    onChange={(e) => setDeductAllowance(e.target.checked)}
                                    className="h-4 w-4"
                                />
                                <label className="text-sm font-semibold">
                                    Do you want to deduct in allowance?
                                </label>
                            </div>
                        )}
                        

                    </div>

                        
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <GenButton 
                        onClick={handleSave} 
                        className="px-8 py-2 font-semibold">
                        Apply Loan
                        </GenButton>
                    </div>

            </div>
    );
}

function AreApplyContent(){
    const addLoan = useAddLoan();

    const [selectedEmpAre, setSelectedEmpAre] = useState<{
      EmpCode: string;
      Firstname: string;
      Lastname: string;
      basic_salary:number;
    } | null>(null);

    
    const [searchloanare, setSearchare] = useState("");

    const [areType, setAreType] = useState<AreType>("HOUSING");
    const [principal, setPrincipal] = useState<number | "">("");
    const [termValue, setTermValue] = useState(1);
    const [termUnit, setTermUnit] = useState<"MONTHS" | "YEARS">("MONTHS");
    const [startDate, setStartDate] = useState("");
    const [loanPurpose, setLoanPurpose] = useState("");
    const [deductAllowance, setDeductAllowance] = useState(false);
    const [deductFirstPay, setDeductFirstPay] = useState(true);
    const [deductSecPay, setDeductSecPay] = useState(true);

    const { data: employeesAre } = useEmployeeSearch(searchloanare);


    const handleSave = async () => {
      if (!selectedEmpAre || !principal || !startDate)
        return;

      try {
        const result =
          await addLoan.mutateAsync({
            empCode: selectedEmpAre.EmpCode,
            loan_type: "ARE_LOAN",
            principal: Number(principal),
            term_value: termValue,
            term_unit: termUnit,
            start_date: startDate,
            deduct_allowance: deductAllowance,
            deduct_first_pay: deductFirstPay,
            deduct_sec_pay: deductSecPay,
            others_type: areType + "" + loanPurpose
          });

        if (!result?.loan_id)
          throw new Error("Loan not saved");

        SweetAlert.successAlert("Loan added");
        resetApplyForm();
        } catch (error: unknown) {
          const message =
            error instanceof Error
              ? error.message
              : "Contact MIS for Configuration.";

          SweetAlert.warningAlert(
            "Loan Application Failed",
            message
          ).then(() => resetApplyForm());
        }
    };


    const resetApplyForm = () => {
      setSelectedEmpAre(null);
      setSearchare("");
      setAreType("HOUSING");
      setPrincipal("");
      setTermValue(1);
      setTermUnit("MONTHS");
      setStartDate("");
      setDeductAllowance(false);
    };

  return(
    <>
      <div className="flex flex-col gap-y-8">

          <div className="relative">
                <label className="block text-sm font-semibold mb-2">
                Employee
                </label>
                <input
                type="text"
                placeholder="Search name or employee code..."
                value={selectedEmpAre ? `${selectedEmpAre.Lastname}, ${selectedEmpAre.Firstname}` : searchloanare}
                onChange={(e) => {
                    setSelectedEmpAre(null);
                    setSearchare(e.target.value);
                }}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-md bg-mainNeutral focus:outline-none focus:ring-2 focus:ring-mainDark focus:border-transparent transition-all"
                />

                {!selectedEmpAre && employeesAre && employeesAre.length > 0 && (
                <div className="absolute z-10 bg-mainNeutral border border-gray-200 w-full rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {employeesAre.map((emp:EmployeeSearchItem ) => (
                    <div
                        key={emp.EmpCode}
                        onClick={() => {
                        setSelectedEmpAre(emp);
                        setSearchare("");
                        }}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0">
                        <div className="font-medium text-gray-900">
                        {emp.Lastname}, {emp.Firstname}
                        </div>
                        <div className="text-sm text-gray-500">
                        {emp.EmpCode}
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">
                    Employee Code
                    </label>
                    <input
                        type="text"
                        disabled
                        value={selectedEmpAre?.EmpCode ?? ""}
                        readOnly
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-mainNeutral focus:outline-none focus:ring-2 focus:ring-mainDark focus:border-transparent transition-all"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">
                        Type of Are
                    </label>
                    <select 
                        value={areType} 
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setAreType(e.target.value as AreType)
                        }
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-mainNeutral focus:outline-none focus:ring-2 focus:ring-mainDark focus:border-transparent transition-all"
                    >
                        <option value="HOUSING">Housing Loan</option>
                        <option value="CASH ADV.">Cash Advance</option>
                        <option value="OTHERS">Others...</option>
                    </select>
                </div>


                  { areType === "OTHERS" && (
                            <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">
                                Specify Loan Type or Purpose.
                            </label>
                            <input
                                type="text"
                                placeholder="Specify Loan Purpose"
                                value={loanPurpose}
                                onChange={e => setLoanPurpose(e.target.value === "" ? "" : String(e.target.value))}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-mainNeutral focus:outline-none focus:ring-2 focus:ring-mainDark focus:border-transparent transition-all"
                            />
                          
                        </div>
                      )}


                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">
                        Principal Amount
                    </label>
                    <input
                        type="number"
                        placeholder="Enter amount"
                        value={principal}
                        onChange={e => setPrincipal(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-mainNeutral focus:outline-none focus:ring-2 focus:ring-mainDark focus:border-transparent transition-all"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">
                        Start Date
                    </label>
                    <input 
                        type="month" 
                        value={startDate} 
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-mainNeutral focus:outline-none focus:ring-2 focus:ring-mainDark focus:border-transparent transition-all"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">
                        Term 
                    </label>
                    <input 
                        type="number" 
                        min={1} 
                        placeholder="Enter duration"
                        value={termValue} 
                        onChange={e => setTermValue(Number(e.target.value))}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-mainNeutral focus:outline-none focus:ring-2 focus:ring-mainDark focus:border-transparent transition-all"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">
                        Term Unit
                    </label>
                    <select 
                        value={termUnit} 
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setTermUnit(e.target.value as TermUnit)
                        }
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-mainNeutral focus:outline-none focus:ring-2 focus:ring-mainDark focus:border-transparent transition-all">
                        <option value="MONTHS">Months</option>
                        <option value="YEARS">Years</option>
                    </select>
                </div>

                          
                <div className="flex flex-col gap-4 col-span-full">
                  <label className="text-sm font-semibold">
                    Where do you want to deduct it?
                  </label>

                  <div className="flex flex-wrap gap-8 w-full">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={deductFirstPay} onChange={(e) => setDeductFirstPay(e.target.checked)} className="h-4 w-4" />
                      <label className="text-sm font-semibold">Deduct in First Pay?</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={deductSecPay} onChange={(e) => setDeductSecPay(e.target.checked)} className="h-4 w-4" />
                      <label className="text-sm font-semibold">Deduct in Second Pay?</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={deductAllowance} onChange={(e) => setDeductAllowance(e.target.checked)} className="h-4 w-4" />
                      <label className="text-sm font-semibold">Deduct in Allowance?</label>
                    </div>

                   
                  </div>
                </div>

                

                    

            </div>
          
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <GenButton 
                        onClick={handleSave} 
                        className="px-8 py-2 font-semibold">
                        Apply Loan
                        </GenButton>
                </div>
         
      </div>
    </>
  )
}

function LoanListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user} = useAuth();
  const { filters } = useFilters();

  const { data: companies } = useCompanies()
  const { data: loanTypes = [] } = useLoanTypes();

  const search = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page") ?? 1);
  const limit = 3;

    
  const subtabParam = searchParams.get("subtab") as SubTabKey | null;

  const activeSubTab =
    subtabParam && SUBTABS.some(t => t.key === subtabParam)
      ? subtabParam
      : "monitoring";

  const handleSubTabChange = (subtab: SubTabKey) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("subtab", subtab);

    router.replace(`?${params.toString()}`, {
      scroll: false
    });
  };


  const { data, isLoading } = useLoans(
    page,
    limit,
    search,
    filters,
    true
  );
  const [company, setCompany] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [loanType, setLoanType] = useState("");
  const [open, setOpen] = useState(false);
  const [openSummary, setOpenSummary]  = useState(false);
  const [expanded, setExpanded] =
    useState<Record<number, boolean>>({});


  const summaryRef = useRef<HTMLDivElement>(null);

  const getCurrentMonth = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const [cycle, setCycle] = useState<"10-25-Cycle" | "15-30-Cycle">("10-25-Cycle");
  const [period, setPeriod] = useState<"10" | "25" | "15" | "30">("10");
  const [month, setMonth] = useState(getCurrentMonth());

  const formattedPeriod = (() => {
    const date = new Date(`${month}-01`);
    const year = date.getFullYear();

    const monthName = date.toLocaleString("default", { month: "long" }).toUpperCase();

    const endOfMonth = new Date(year, date.getMonth() + 1, 0).getDate();

    if (cycle== "10-25-Cycle"){
      if (period === "10" ) {
        return `${monthName} 01-15, ${year}`;
      }
      else if (period === "25" ) {
        return `${monthName}  16-${endOfMonth}, ${year}`;
      }
      else{
         return `${monthName} 01-${endOfMonth}, ${year}`;
      }
    }
    else{
      if (period === "15") {
        return `${monthName} 01-15, ${year}`;
      }
      else if (period === "25") {
        return `${monthName} 16-${endOfMonth}, ${year}`;
      }
      else{
         return `${monthName} 01-${endOfMonth}, ${year}`;
      }
    }
    

   
  })();

  const handleCycleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as "10-25-Cycle" | "15-30-Cycle";

    setCycle(value);

    if (value === "10-25-Cycle") {
      setPeriod("10");
    } else {
      setPeriod("15");
    }
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value as "10" | "25" | "15" | "30");
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonth(e.target.value);
  };

 const {
    data: loanSummary = [],
    isLoading: summaryLoading
  } = useLoanSummary(
    month,
    cycle,
    period,
    company,
    loanType,
    Boolean(month && period)
  );

  const toggleExpand = (id: number) => {
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const updateParams = (fn: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );
    fn(params);
    router.replace(`?${params.toString()}`, {
      scroll: false
    });
  };

  const handleSearch = (value: string) => {
    updateParams(params => {
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }

      params.set("page", "1");
    });
  };

  const goToPage = (p: number) => {
    updateParams(params => {
      params.set("page", String(p));
    });
  };

  const totalDeduction = loanSummary.reduce(
    (sum, row) => sum + Number(row.deduction || 0),0
  );

  const overallDeduction = loanSummary.reduce(
    (sum,row) => sum + Number(row.total_deduction || 0),0
  );

  const handlePrintSummary = useReactToPrint({
      contentRef: summaryRef,
      documentTitle: `Summary Ledger - ${formattedPeriod}`,
    })
  

  return (
    <>
      <div className="flex gap-3 w-full md:w-auto">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) =>
            handleSearch(e.target.value)
          }
          className="px-4 py-2 rounded-md bg-mainNeutral w-full"
        />

        <GenButton
          variant="primary"
          onClick={() => setOpen(true)}
        >
          <Filter size={16} /> Filter
        </GenButton>

        <GenButton
          variant="main"
          className="min-w-60 inline-flex items-center justify-center"
          onClick={() => setOpenSummary(true)}
        >
          <BookOpen size={16} /> Open Loan Summary
        </GenButton>

      </div>

      <ActiveFilters />

      {isLoading ? (
        <p className="text-gray-500 w-full bg-mainNeutral py-4 flex justify-center items-center rounded-lg">
          Loading loans...
        </p>
      ) : data?.data.length === 0 ? (
        <p className="text-gray-500 w-full bg-mainNeutral py-4 flex justify-center items-center rounded-lg">
          No loan records found.
        </p>
      ) : (
        <div className="flex flex-col gap-y-4">
          {data?.data.map((loan) => (
            <LoanCard
              key={loan.loan_id}
              loan={loan}
              isOpen={!!expanded[loan.loan_id]}
              onToggle={() =>
                toggleExpand(loan.loan_id)
              }
            />
          ))}
        </div>
      )}

      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-end gap-x-2 mt-6">
          <GenButton
            variant="secondary"
            disabled={page === 1}
            onClick={() => goToPage(page - 1)}
          >
            Previous
          </GenButton>

          <span className="px-4 py-2 text-sm text-gray-600">
            Page {data.meta.page} of{" "}
            {data.meta.totalPages}
          </span>

          <GenButton
            variant="secondary"
            disabled={
              page === data.meta.totalPages
            }
            onClick={() => goToPage(page + 1)}
          >
            Next
          </GenButton>
        </div>
      )}

      <FilterModal
        open={open}
        onClose={() => setOpen(false)}
      />

      {openSummary && (
        <RequestModal
          size="xxxl"
          title={`Overall Loan Summary`}
          onClose={() => setOpenSummary(false)}
        >
        <div className="">
          <ul className="flex gap-x-4 bg-mainBg py-3 px-4 rounded-lg text-mainLight mt-2">
            {SUBTABS.map(({ key, label }) => (
              <li
                key={key}
                onClick={() =>
                  handleSubTabChange(key)
                }
                className={`px-6 py-2 rounded-md font-semibold cursor-pointer text-sm ${
                  activeSubTab === key
                    ? "bg-mainLight text-mainBg"
                    : "hover:bg-mainLight hover:text-mainBg"
                }`}
              >
                {label}
              </li>
            ))}
          </ul>

            <div className="flex flex-col gap-4 bg-mainNeutral justify-center items-start px-6 py-4">
            
              <div className="flex flex-wrap gap-4 items-end w-full">

                <div className="flex flex-col gap-2 flex-1 min-w-30">
                  <label className="text-sm font-semibold">
                    Select Company
                  </label>
                  <select
                    value={company}
                    onChange={(e) => {
                      const value = e.target.value;

                      const selectedCompany = companies?.find(
                        (c) => c.CompanyCode === value
                      );

                      setCompany(value);
                      setCompanyName(selectedCompany?.CompanyName || "");
                    }}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md"
                  >
                    <option value="">All Companies</option>
                    {companies?.map((c) => (
                      <option key={c.CompanyCode} value={c.CompanyCode}>
                        {c.CompanyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2 flex-1 min-w-30">
                  <label className="text-sm font-semibold">
                    Select Loan Type
                  </label>

                  <select
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md"
                  >
                    <option value="">All Loan Types</option>
                    {loanTypes?.map((loan) => (
                      <option key={loan} value={loan}>
                        {loan}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2 flex-1 min-w-30">
                  <label className="text-sm font-semibold">
                    Select Cycle
                  </label>
                  <select
                    value={cycle}
                    onChange={handleCycleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Payroll Cycle</option>
                    <option value="10-25-Cycle">10-25 Cycle</option>
                    <option value="15-30-Cycle">15-30 Cycle</option>
                  </select>
                </div>

              </div>

              <div className="flex flex-wrap gap-4 items-end w-full">
              

                  <div className="flex flex-wrap gap-4 items-end w-full">

                      <div className="flex flex-col gap-2 flex-1 min-w-30">
                          <label className="text-sm font-semibold">
                              Select Month
                          </label>
                          <input
                            type="month"
                            value={month}
                            onChange={handleMonthChange}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-md"
                          />
                      </div>
                           
                    <div className="flex flex-col gap-2 flex-1 min-w-30">
                        <label className="text-sm font-semibold">
                            Select Period
                        </label>
                        {cycle === "10-25-Cycle" && (
                          <select
                            value={period}
                            onChange={handlePeriodChange}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-md"
                          >
                            <option value="">Select Payroll Period</option>
                            <option value="10">10 Period</option>
                            <option value="25">25 Period</option>
                            <option value="30">Allowance</option>
                          </select>
                        )}
                        {cycle === "15-30-Cycle" && (
                          <select
                            value={period}
                            onChange={handlePeriodChange}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-md"
                          >
                            <option value="">Select Payroll Period</option>
                            <option value="15">15 Period</option>
                            <option value="25">30 Period</option>
                            <option value="30">Allowance</option>
                          </select>
                        )}
                    </div>

                      
                    <div className="flex flex-col gap-2 flex-1 min-w-30">
                      <GenButton
                        variant="primary"
                        className="w-full inline-flex items-center justify-center"
                        onClick={handlePrintSummary}
                      >
                        <Printer size={16} /> Print Loan Summary
                      </GenButton>
                    </div>

                  </div>
                </div>
            </div>
            <div className="mb-6">
            {activeSubTab === "monitoring" && (
                <div className="mt-4">
                  {!month || !period ? (
                    <p className="text-gray-500">Select month and period to view summary.</p>
                  ) : summaryLoading ? (
                    <p className="text-gray-500">Loading loan summary...</p>
                  ) : loanSummary?.length === 0 ? (
                    <p className="text-gray-500">No records found.</p>
                  ) : (
                    <div ref={summaryRef} className="print-container">
                      <div className="py-4 px-2 flex flex-col gap-2">
                        <h1 className="text-lg font-bold  text-mainGray">{companyName}</h1>
                        <h1 className="text-md font-semibold  text-mainGray">{loanType} <span>MONITORING</span></h1>
                        <h1 className="text-md font-medium  text-mainGray"><span>PAYROLL</span> {formattedPeriod}</h1>
                      </div>
                     <table className="w-full border border-gray-200 table-fixed">
                        <thead className="bg-mainBg text-mainLight">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs w-[18%] whitespace-nowrap">NAME</th>
                            <th className="px-3 py-2 text-left text-xs w-[10%] whitespace-nowrap">TYPE</th>
                            <th className="px-3 py-2 text-left text-xs w-[12%] whitespace-nowrap">DESCRIPTION</th>
                            <th className="px-3 py-2 text-left text-xs w-[10%] whitespace-nowrap">START</th>
                            <th className="px-3 py-2 text-left text-xs w-[10%] whitespace-nowrap">END</th>
                            <th className="px-3 py-2 text-right text-xs w-[10%] whitespace-nowrap">PRINCIPAL</th>
                            <th className="px-3 py-2 text-right text-xs w-[10%] whitespace-nowrap">DEDUCTION</th>
                            <th className="px-3 py-2 text-right text-xs w-[12%]">
                              TOTAL<br />DEDUCTION
                            </th>

                            <th className="px-3 py-2 text-right text-xs w-[12%]">
                              RUNNING<br />BALANCE
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {loanSummary.map((row) => (
                            <tr key={row.loan_id} className="border-t hover:bg-gray-50 odd:bg-mainLight even:bg-mainNeutral">
                              <td className="px-4 py-2 text-xs">{row.name}</td>
                              <td className="px-4 py-2 text-xs">{row.loan_type}</td>
                              <td className="px-4 py-2 text-xs">{row.description}</td>
                              <td className="px-4 py-2 text-xs">
                                {new Date(row.start).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-2 text-xs">
                                {new Date(row.end).toLocaleDateString()}
                              </td>
                              <td className="px-3 py-2 text-xs text-right">{row.principal}</td>
                              <td className="px-3 py-2 text-xs text-right">{row.deduction}</td>
                              <td className="px-3 py-2 text-xs text-right">{row.total_deduction}</td>
                              <td className="px-3 py-2 text-xs text-right">{row.running_balance}</td>
                            </tr>
                          ))}
                        </tbody>

                        <tfoot className="bg-mainLight font-semibold shadow-md shadow-gray-500/80">
                          <tr>
                            <td colSpan={6} className="px-4 py-2 text-left text-xs">
                              TOTAL
                            </td>

                            <td className="px-4 py-2 text-xs text-right">
                              {totalDeduction.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-xs text-right">
                              {overallDeduction.toLocaleString()}
                            </td>

                            <td colSpan={1}></td>
                          </tr>
                        </tfoot>
                      </table>

                      <div className="print-only mt-8 px-4">
                        <div className="flex flex-col gap-6">
                          <p className="font-normal text-xs">PREPARED BY:</p>
                          <div className="flex flex-col gap-y-1 text-mainLightGray">
                            <hr className="w-52" />
                            <h1 className="font-semibold text-mainGray">{user?.name}</h1>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                
                </div>
              )}
              {activeSubTab == "accounts" &&(
                <div>
                  <h1>display accounts table here</h1>
                </div>
              )}
            </div>
        </div>

        </RequestModal>
      )}
      

    </>
  );
}






// ============================
// MAIN COMPONENT
// ============================

export default function EmployeeLoan() {
  const router = useRouter();
  const searchParams = useSearchParams();

  
  const tabParam = searchParams.get("tab") as TabKey | null;

  const activeTab =
    tabParam && TABS.some(t => t.key === tabParam)
      ? tabParam
      : "apply";

  const handleTabChange = (tab: TabKey) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("tab", tab);

    router.replace(`?${params.toString()}`, {
      scroll: false
    });
  };

 
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center py-8 text-mainGray">
      <div className="w-[95%] flex flex-col gap-y-8">

        <div>
          <h1 className="text-2xl font-bold">
            Employee Loan Application
          </h1>
          <p className="text-sm text-mainLightGray">
            Apply, review, and track your loan requests
          </p>
        </div>

        <ul className="flex gap-x-4 bg-mainBg py-3 px-4 rounded-lg text-mainLight mt-2">
          {TABS.map(({ key, label }) => (
            <li
              key={key}
              onClick={() =>
                handleTabChange(key)
              }
              className={`px-6 py-2 rounded-md font-semibold cursor-pointer text-sm ${
                activeTab === key
                  ? "bg-mainLight text-mainBg"
                  : "hover:bg-mainLight hover:text-mainBg"
              }`}
            >
              {label}
            </li>
          ))}
        </ul>

        {activeTab === "apply" && (
            <LoanApplyContent/>

        )}

        {activeTab === "are" && (
            <AreApplyContent/>
        )}

        {activeTab === "loan-list" && (
          <FilterProvider filterKeys={FILTER_KEYS}>
            <LoanListContent />
          </FilterProvider>
        )}
      </div>
    </div>
  );
}
