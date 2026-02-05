"use client"

import { useEffect, useState } from "react";
import { useAddLoan, useLoans} from "../../hooks/useLoans";
import { useEmployeeSearch } from "../../hooks/usePreparePayroll"
import SweetAlert from "../../components/Swal";
import GenButton from "@/app/components/Buttons";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import ActiveFilters from "@/app/components/FilterObject";
import FilterModal from "@/app/components/Filter";
import LoanCard from "@/app/components/loans/loanCard";
import RequestModal from "@/app/components/Modal";


type TabKey = "apply" | "loan-list";

const TABS: {key: TabKey, label: string}[]=[
    {key:"apply", label:"Loan Application"},
    {key:"loan-list", label:"Loan Applicants"}
]

export default function EmployeeLoan(){
    const router = useRouter();
    const searchParams = useSearchParams();
    const addLoan = useAddLoan();

    // Apply Loan
    const [searchloan, setSearch] = useState("");
    const [loanType, setLoanType] = useState<"FCH_LOAN" | "SSS_LOAN" | "PAGIBIG_LOAN">("FCH_LOAN");
    const [principal, setPrincipal] = useState<number | "">("");
    const [termValue, setTermValue] = useState(1);
    const [termUnit, setTermUnit] = useState<"MONTHS" | "YEARS">("MONTHS");
    const [startDate, setStartDate] = useState("");
    const [deductAllowance, setDeductAllowance] = useState(false);

    const [selectedEmp, setSelectedEmp] = useState<{
        EmpCode: string;
        Firstname: string;
        Lastname: string;
    } | null>(null);

    const { data: employees } = useEmployeeSearch(searchloan);

    // Applicants Loan
    const [activeTab, setActiveTab] = useState<TabKey>("apply");
   
    const search = searchParams.get("search") ?? "";
    const page = Number(searchParams.get("page") ?? 1);
    const limit = 3;

    const [open, setOpen] = useState(false);

    const FILTER_KEYS = ["department", "company", "status","loanStatus"] as const;

    type FilterKey = (typeof FILTER_KEYS)[number];

    const filters = FILTER_KEYS.reduce<Record<FilterKey, string[]>>(
      (acc, key) => {
        acc[key] = searchParams.getAll(key);
        return acc;
      },
      {} as Record<FilterKey, string[]>
    );

    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    const toggleExpand = (id: number) => {
        setExpanded(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
        };
    


    const isLoanList = activeTab === "loan-list";

    const { data, isLoading, isError } = useLoans(
    page,
    limit,
    search,
    filters,
    isLoanList
    );



    useEffect(()=>{
        const tab = searchParams.get("tab") as TabKey | null;

        if (tab && TABS.some(t => t.key === tab)) {
        setActiveTab(tab);
        }

    },[searchParams]);

    const updateParams = (fn: (params: URLSearchParams) => void) => {
        const params = new URLSearchParams(searchParams.toString());
        fn(params);
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    const handleSearch = (value: string) => {
        updateParams((params) => {
        value ? params.set("search", value) : params.delete("search");
        params.set("page", "1");
        });
    };

    const handleSave = async () => {
        if (!selectedEmp || !principal || !startDate) return;
    
        try {
        const result = await addLoan.mutateAsync({
            empCode: selectedEmp.EmpCode,
            loan_type: loanType,
            principal: Number(principal),
            term_value: termValue,
            term_unit: termUnit,
            start_date: startDate,
            deduct_allowance: deductAllowance,
        });
    
        if (!result?.loan_id) {
            throw new Error("Loan not saved");
        }
        
        SweetAlert.successAlert("Loan added");
        } catch {
        SweetAlert.errorAlert("Failed to add loan");
        }
    };

    const handleTabChange = (tab:TabKey) =>{
        setActiveTab(tab)
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);


        router.replace(`?${params.toString()}`, { scroll: false });
    }

    const toggleFilter = (key: string, value: string) => {
        updateParams((params) => {
        const values = params.getAll(key);

        params.delete(key);
        if (!values.includes(value)) {
            [...values, value].forEach((v) => params.append(key, v));
        } else {
            values.filter((v) => v !== value).forEach((v) => params.append(key, v));
        }

        });
    };

    const goToPage = (p: number) => {
        updateParams((params) => {
            params.set("page", String(p));
        });
    };


    const removeFilter = (key: string, value: string) => {
        updateParams((params) => {
        const values = params.getAll(key).filter((v) => v !== value);
        params.delete(key);
        values.forEach((v) => params.append(key, v));
        });
    };


    const clearAll = () => {
        updateParams((params) => {
        ["department", "company", "status","loanStatus"].forEach((k) => params.delete(k));
        });
    };


    return(
        <div className="relative w-full min-h-screen flex flex-col items-center py-8 text-mainGray">
            
            <div className="w-[95%] flex flex-col gap-y-8">
               
                <div className="flex justify-between items-end flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Employee Loan Application</h1>
                        <p className="text-sm text-mainLightGray">
                        Apply, review, and track your loan requests
                        </p>
                    </div>
                    {activeTab === "loan-list" &&(
                    <div className="flex gap-3 w-full md:w-auto">
                        <input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="px-4 py-2 rounded-md bg-mainNeutral w-full"
                        />

                        <GenButton variant="primary" onClick={() => setOpen(true)}>
                            <Filter size={16} /> Filter
                        </GenButton>
                    </div>
                    )}
                </div>

                <ul className="flex gap-x-4 bg-mainBg py-3 px-4 rounded-lg text-mainLight mt-2">
                    {TABS.map(({key,label})=>(
                        <li
                            key={key}
                            onClick={() => handleTabChange(key)}
                            className={`px-6 py-2 rounded-md font-semibold cursor-pointer text-sm ${
                            activeTab === key
                                ? "bg-mainLight text-mainBg"
                                : "hover:bg-mainLight hover:text-mainBg"
                            }`}>
                                {label}
                        </li>
                    ))}
                </ul>

                {activeTab === "apply" &&(

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
                            {employees.map((emp: any) => (
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
                                onChange={e => setLoanType(e.target.value as any)}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-mainNeutral focus:outline-none focus:ring-2 focus:ring-mainDark focus:border-transparent transition-all"
                            >
                                <option value="FCH_LOAN">FCH Loan</option>
                                <option value="SSS_LOAN">SSS Loan</option>
                                <option value="PAGIBIG_LOAN">Pag-IBIG Loan</option>
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
                                onChange={e => setTermUnit(e.target.value as any)}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-mainNeutral focus:outline-none focus:ring-2 focus:ring-mainDark focus:border-transparent transition-all">
                                <option value="MONTHS">Months</option>
                                <option value="YEARS">Years</option>
                            </select>
                        </div>

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

                    </div>

                        
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <GenButton 
                        onClick={handleSave} 
                        className="px-8 py-2 font-semibold">
                        Apply Loan
                        </GenButton>
                    </div>

                    </div>
                )}

                {activeTab === "loan-list" &&(
                    <div className="flex flex-col gap-y-8">
                        
                        <ActiveFilters
                        filters={filters}
                        onRemove={removeFilter}
                        onClearAll={clearAll}
                        />

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
                                    onToggle={() => toggleExpand(loan.loan_id)}
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
                                Page {data.meta.page} of {data.meta.totalPages}
                                </span>

                                <GenButton
                                variant="secondary"
                                disabled={page === data.meta.totalPages}
                                onClick={() => goToPage(page + 1)}
                                >
                                Next
                                </GenButton>

                            </div>
                            )}



                    </div>
                )}
                

            </div>
                <FilterModal
                  open={open}
                  onClose={() => setOpen(false)}
                  filters={filters}
                  onToggle={toggleFilter}
                  filterKeys={FILTER_KEYS}
                />

         
        </div>
    );
}