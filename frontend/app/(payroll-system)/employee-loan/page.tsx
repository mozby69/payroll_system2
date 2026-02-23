"use client";

import { useState } from "react";
import {
  useAddLoan,
  useBonusRules,
  useLoans
} from "../../hooks/useLoans";
import { useEmployeeSearch } from "../../hooks/usePreparePayroll";
import SweetAlert from "../../components/Swal";
import GenButton from "@/app/components/Buttons";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import ActiveFilters from "@/app/components/FilterObject";
import FilterModal from "@/app/components/Filter";
import LoanCard from "@/app/components/loans/loanCard";
import { FilterProvider, useFilters } from "@/app/components/FilterContext";
import { AreType, EmployeeSearchItem, LoanType, TermUnit } from "@/app/types/loanTypes";


type TabKey = "apply"| "are" | "loan-list" ;

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


function LoanApplyContent() {
    const addLoan = useAddLoan();



    const [selectedEmp, setSelectedEmp] = useState<{
      EmpCode: string;
      Firstname: string;
      Lastname: string;
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
  };

  const handleSave = async () => {
    if (!selectedEmp || !principal || !startDate)
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
          others_type: selectedBonus
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

                        {!selectedEmp && employees?.length > 0 && (
                        <div className="absolute z-10 bg-mainNeutral border border-gray-200 w-full rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                            {employees.map((emp:EmployeeSearchItem ) => (
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

                              
                        { loanType === "OTHERS" && (
                            <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold">
                                Type of Bonus
                            </label>

                            <select
                                value={selectedBonus}
                                onChange={(e) => setSelectedBonus(e.target.value)}
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
    } | null>(null);

    
    const [searchloanare, setSearchare] = useState("");

    const [areType, setAreType] = useState<AreType>("HOUSING");
    const [principal, setPrincipal] = useState<number | "">("");
    const [termValue, setTermValue] = useState(1);
    const [termUnit, setTermUnit] = useState<"MONTHS" | "YEARS">("MONTHS");
    const [startDate, setStartDate] = useState("");
    const [loanPurpose, setLoanPurpose] = useState("");
    const [deductAllowance, setDeductAllowance] = useState(false);

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

                {!selectedEmpAre && employeesAre?.length > 0 && (
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


                <div className="inline-flex gap-2 w-full items-end">
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
  const { filters } = useFilters();

  const search = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page") ?? 1);
  const limit = 3;

  const { data, isLoading } = useLoans(
    page,
    limit,
    search,
    filters,
    true
  );

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] =
    useState<Record<number, boolean>>({});

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
    </>
  );
}






// ============================
// MAIN COMPONENT
// ============================

export default function EmployeeLoan() {
  const router = useRouter();
  const searchParams = useSearchParams();


  // const [activeTab, setActiveTab] = useState<TabKey>("apply");

  


  // useEffect(() => {
  //   const tab = searchParams.get(
  //     "tab"
  //   ) as TabKey | null;

  //   if (tab && TABS.some(t => t.key === tab)) {
  //     setActiveTab(tab);
  //   }
  // }, [searchParams]);

  // const handleTabChange = (tab: TabKey) => {
  //   setActiveTab(tab);

  //   const params = new URLSearchParams(
  //     searchParams.toString()
  //   );

  //   params.set("tab", tab);

  //   router.replace(`?${params.toString()}`, {
  //     scroll: false
  //   });
  // };

  
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
