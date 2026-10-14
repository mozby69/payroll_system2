import SweetAlert from "@/app/components/Swal";
import { useCompaniesByCycle } from "@/app/hooks/useGeneral";
import { useCreatePayroll } from "@/app/hooks/useManualPayroll";
import {  useMemo, useState } from "react";



type PayrollRange = {
    label: string;
    value: string;
};

type CreatePayrollProps = {
    closeModal: () => void;
};


export default function CreatePayroll({ closeModal }: CreatePayrollProps) {
    const { mutate, isPending } = useCreatePayroll();

    const [selectedMonth, setSelectedMonth] = useState("2026-05");
    const [selectedRange, setSelectedRange] = useState("1-15");
    //const [cycleCategory, setCycleCategory] = useState("10-25-Cycle");
    const [payrollPeriod, setPayrollPeriod] = useState("10-pay-cycle");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    //const [companyCode, setCompanyCode] = useState("EMB");


    const [cycleCategory, setCycleCategory] = useState("10-25-Cycle");

    const [companyCode, setCompanyCode] = useState("");

    const ranges: PayrollRange[] = useMemo(() => {
        if (!selectedMonth) return [];

        const [year, month] = selectedMonth.split("-").map(Number);

        const lastDay = new Date(year, month, 0).getDate();

        return [
            {
                label: "1-15",
                value: "1-15",
            },
            {
                label: `16-${lastDay}`,
                value: `16-${lastDay}`,
            },
        ];
    }, [selectedMonth]);


    const {data: companies} = useCompaniesByCycle(cycleCategory);





    const handleSave = () => {
        mutate(
            {
                selectedMonth,
                selectedRange,
                cycleCategory,
                payrollPeriod,
                fromDate,
                toDate,
                companyCode,
            },
            {
                onSuccess: () => {
                    SweetAlert.successAlert("Payroll saved successfully");
                    closeModal();
                },

                onError: () => {
                    SweetAlert.errorAlert(
                        "Failed to save payroll"
                    );
                },
            }
        );
    };



    return (
        <div className="p-6 bg-white rounded-xl">

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    Create Payroll
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                    Configure payroll period and payroll cycle settings.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                <div className="flex flex-col">
                    <label className="mb-2 text-sm font-semibold text-slate-700">Month</label>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="mb-2 text-sm font-semibold text-slate-700">
                        Select Range
                    </label>

                    <select
                        value={selectedRange}
                        onChange={(e) => setSelectedRange(e.target.value)}
                        className="border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500">
                        {ranges.map((range) => (
                            <option key={range.value} value={range.value}>
                                {range.label}
                            </option>
                        ))}
                    </select>
                </div>



                <div className="flex flex-col">
                    <label className="mb-2 text-sm font-semibold text-slate-700">
                        Payroll Period
                    </label>

                    <select
                        value={payrollPeriod}
                        onChange={(e) => setPayrollPeriod(e.target.value)}
                        className="border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="10-pay-cycle">
                            10-pay-cycle
                        </option>

                        <option value="15-pay-cycle">
                            15-pay-cycle
                        </option>

                        <option value="25-pay-cycle">
                            25-pay-cycle
                        </option>

                        <option value="30-pay-cycle">
                            30-pay-cycle
                        </option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="mb-2 text-sm font-semibold text-slate-700">
                        From Payroll Period
                    </label>

                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="mb-2 text-sm font-semibold text-slate-700">
                        To Payroll Period
                    </label>

                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="border border-slate-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>







                <div className="flex flex-col">
                    <label className="mb-2 text-sm font-semibold text-slate-700">
                        Select Cycle
                    </label>

                    <select value={cycleCategory}
                        onChange={(e) =>setCycleCategory(e.target.value)}
                        className="border border-slate-300 rounded-lg py-2.5 px-4">
                        <option value="10-25-Cycle">
                            10-25-Cycle
                        </option>

                        <option value="15-30-Cycle">
                            15-30-Cycle
                        </option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="mb-2 text-sm font-semibold text-slate-700">
                        Company
                    </label>

                    <select
                        value={companyCode}
                        onChange={(e) =>
                            setCompanyCode(e.target.value)
                        }
                        className="border border-slate-300 rounded-lg py-2.5 px-4">

                        <option value="">
                            Select Company
                        </option>

                        {companies?.data?.map((company) => (
                            <option key={company.CompanyCode} value={company.CompanyCode}>
                                {company.CompanyCode}
                            </option>
                        ))}

                    </select>
                </div>

            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 mt-8 pt-5">

                <button
                    onClick={closeModal}
                    className="bg-slate-600 hover:bg-slate-500 text-white px-5 py-2.5 rounded-lg transition-all">
                    Close
                </button>

                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="bg-green-600 hover:bg-green-500 disabled:bg-green-300 text-white px-5 py-2.5 rounded-lg transition-all">
                    {isPending ? "Saving..." : "Save Payroll"}
                </button>

            </div>

        </div>
    );
}





