"use client";

import { WtaxComputationListProps } from "@/app/types/statutoryType";
import { formatAmount, formatCurrency } from "@/app/utils/currencyConverter";
import { useState } from "react";
import { MonthSidebar } from "@/app/components/TabVertical";
import { TabItem } from "@/app/components/Tab";
import SweetAlert from "@/app/components/Swal";
import { useDisplayWtax, useDisplayWtaxFetch, useSaveMonthlyTax } from "@/app/hooks/useStatutory";



type WTaxComputationProps = {
    data: WtaxComputationListProps;
};

type AllowanceTab = "January" | "February" | "March" | "April" | "May" | "June"
    | "July" | "August" | "September" | "October" | "November" | "December";

export default function WtaxComputationModal({ data }: WTaxComputationProps) {
    const [activeTab, setActiveTab] = useState<AllowanceTab>("January");
    const { mutate } = useSaveMonthlyTax();
    const { data: WtaxData } = useDisplayWtax(data.EmpCode);

    const paidTaxMap = new Map(
        WtaxData?.data.map((item) => [
            `${item.taxPeriod.year}-${item.taxPeriod.month}`,
            Number(item.taxAmount),
        ]) ?? []
    );

    const totalTaxPaid = WtaxData?.data.reduce(
        (sum, item) =>
            sum + Number(item.taxAmount),
        0
    ) ?? 0;

    const MONTH_TABS: TabItem<AllowanceTab>[] = [
        { key: "January", label: "January" },
        { key: "February", label: "February" },
        { key: "March", label: "March" },
        { key: "April", label: "April" },
        { key: "May", label: "May" },
        { key: "June", label: "June" },
        { key: "July", label: "July" },
        { key: "August", label: "August" },
        { key: "September", label: "September" },
        { key: "October", label: "October" },
        { key: "November", label: "November" },
        { key: "December", label: "December" },
    ];

    const MONTH_MAP: Record<AllowanceTab, number> = {
        January: 1,
        February: 2,
        March: 3,
        April: 4,
        May: 5,
        June: 6,
        July: 7,
        August: 8,
        September: 9,
        October: 10,
        November: 11,
        December: 12,
    };


    const month = MONTH_MAP[activeTab];
    const year = new Date().getFullYear();
    const { data: wtax_data } = useDisplayWtaxFetch(data.EmpCode, month, year);


    const generateMonthlyTax = (totalTax: number): number[] => {
        const monthly = Number((totalTax / 12).toFixed(2));
        const months = Array.from(
            { length: 11 },
            () => monthly
        );
        const totalFirst11 = Number((monthly * 11).toFixed(2));
        const december = Number((totalTax - totalFirst11).toFixed(2));

        return [...months, december];
    };


    const monthlyTaxes = generateMonthlyTax(wtax_data?.data?.j3 ?? 0);


    const handleSaveTax = () => {
        mutate(
            {
                month,
                year: new Date().getFullYear(),
                taxAmount: monthlyTaxes[month - 1],
                empCodeId: data.EmpCode,
            },
            {
                onSuccess: () => {
                    SweetAlert.successAlert("Tax record saved successfully");
                },
                onError: () => {
                    SweetAlert.errorAlert("Failed to save tax record");
                },
            }
        );
    };





    const openSweetModal = () => {
        SweetAlert.confirmationAlert(
            "Save Tax",
            `Save tax for Month of ${activeTab}?`,
            () => {
                handleSaveTax();
            },
            () => {
                //console.error("error occured");
            }
        );
    };


    // const displayedMonthlyTaxes =
    //     MONTH_TABS.map((tab, index) => {
    //         const monthNumber =
    //             MONTH_MAP[tab.key];

    //         const currentYear = new Date().getFullYear();

    //         const dbAmount = paidTaxMap.get(
    //             `${currentYear}-${monthNumber}`
    //         );

    //         return (
    //             dbAmount ??
    //             monthlyTaxes[index]
    //         );
    //     });

    // const monthList = wtax_data?.data?.month_list;

    // const displayedMonthlyTaxes = MONTH_TABS.map((tab) => {
    // const monthNumber = MONTH_MAP[tab.key];
    // const dbAmount = paidTaxMap.get(`${year}-${monthNumber}`);

    // return dbAmount ?? monthList?.[tab.key] ?? 0;
    // });
    const totalTaxAmount = MONTH_TABS.reduce((sum, tab) => {
        const monthNumber = MONTH_MAP[tab.key];
        const dbAmount = paidTaxMap.get(`${year}-${monthNumber}`);
        const taxAmount = dbAmount ?? wtax_data?.data?.month_list?.[tab.key] ?? 0;

        return sum + Number(taxAmount);
    }, 0);


    return (

        <>

            <div className="flex justify-end p-2">
                <button onClick={openSweetModal}
                    className="bg-green-700 hover:bg-green-600 text-white px-4 py-2.5 rounded font-semibold">Save Tax</button>
            </div>

            <div className="flex gap-6 p-4 border border-slate-300 rounded">

                <MonthSidebar
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    tabs={MONTH_TABS}
                />

                <div className="flex-1">

                    <div className="flex justify-between">
                        <div className="flex py-8">
                            <h2 className="text-xl font-bold mb-4">
                                {activeTab}
                            </h2>
                        </div>

                        <div className="pt-8 mb-8">
                            <h2 className="uppercase font-semiboldpx-4 py-2 rounded px-4">
                                <span className="font-bold text-slate-600 text-xl">{`${data?.EmpCode} -`}</span> {data?.Name}
                            </h2>
                        </div>
                    </div>







                    <div className="flex justify-between gap-x-2">
                        <table className="w-full border-collapse rounded-lg overflow-hidden">
                            <thead>
                                <tr>
                                    <th colSpan={2}></th>
                                    <th className="border border-slate-400 p-1">PHILHEALTH</th>
                                    <th className="border border-slate-400 p-1">SSS</th>
                                    <th className="border border-slate-400 p-1">PAG-IBIG</th>
                                </tr>
                                <tr>
                                    <th colSpan={2} className="invisible">s</th>
                                    <th className="border border-slate-400 p-1">{formatAmount(wtax_data?.data?.philhealth_contrib ?? 0)}</th>
                                    <th className="border border-slate-400 p-1">{formatAmount(wtax_data?.data?.sss_employe_contrib ?? 0)}</th>
                                    <th className="border border-slate-400 p-1">{formatAmount(wtax_data?.data?.pagibig_contrib ?? 0)}</th>
                                </tr>
                                <tr>
                                    <th className="invisible">s</th>
                                </tr>
                                <tr>
                                    <th className="invisible">s</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td></td>
                                    <td className="text-center p-1 border border-slate-400">{formatAmount(wtax_data?.data?.a2 ?? 0)}</td>
                                </tr>
                                <tr>
                                    <td className="text-center border border-slate-400">{formatAmount(wtax_data?.data?.basic_salary ?? 0)}</td>
                                    <td className="text-center border border-slate-400 p-1">{formatCurrency(wtax_data?.data?.b2)}</td>
                                    <td className="text-center border border-slate-400">{formatCurrency(wtax_data?.data?.b3)}</td>
                                    <td className="text-center border border-slate-400">{formatCurrency(wtax_data?.data?.b4)}</td>
                                    <td className="text-center border border-slate-400">{formatCurrency(wtax_data?.data?.b5)}</td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td className="text-center p-1 border border-slate-400">{formatCurrency(wtax_data?.data?.c2)}</td>
                                    <td className="text-center p-1 border border-slate-400">{formatCurrency(wtax_data?.data?.c3)}</td>
                                    <td className="text-center p-1 border border-slate-400">{formatCurrency(wtax_data?.data?.c4)}</td>
                                    <td className="text-center p-1 border border-slate-400">{formatCurrency(wtax_data?.data?.c5)}</td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td className="text-center p-1 border border-slate-400">{formatCurrency(wtax_data?.data?.d2)}</td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td className="text-center p-1 border border-slate-400">{formatCurrency(wtax_data?.data?.e2)}</td>
                                </tr>
                                <tr>
                                    <td className="font-semibold">FIXED</td>
                                    <td className="text-center p-1 border border-slate-400">{formatAmount(wtax_data?.data?.f2 ?? 0)}</td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td className="text-center p-1 border border-slate-400">{formatAmount(wtax_data?.data?.g2 ?? 0)}</td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td className="text-right font-semibold py-1 px-4 border border-slate-400">{wtax_data?.data?.h2}%</td>
                                    <td className="text-center border border-slate-400">{formatAmount(wtax_data?.data?.h3 ?? 0)}</td>
                                </tr>
                                <tr>
                                    <td colSpan={2}></td>
                                    <td className="text-center border border-slate-400 p-1">{formatAmount(wtax_data?.data?.i3 ?? 0)}</td>
                                </tr>
                                <tr>
                                    <td colSpan={2} className="font-semibold">W/TAX PAYABLE</td>
                                    <td className="text-center border border-slate-400 p-1">{formatAmount(wtax_data?.data?.j3 ?? 0)}</td>
                                    <td className="text-center border border-slate-400 p-1">{wtax_data?.data?.j4}</td>
                                    <td className="text-center border border-red-300 p-1 bg-red-300 font-semibold">{formatAmount(wtax_data?.data?.j5 ?? 0)}</td>
                                </tr>
                                <tr>
                                    <td colSpan={2} className="font-semibold">LESS: TOTAL W/TAX PAID</td>
                                    <td className="text-center border border-slate-400 p-1"> ({formatAmount(wtax_data?.data?.k3 ?? 0)})</td>
                                </tr>
                                <tr>
                                    <td colSpan={2} className="font-semibold">REMAINING W/TAX PAID</td>
                                    <td className="text-center border border-slate-400 p-1">{formatAmount(wtax_data?.data?.l3 ?? 0)}</td>
                                </tr>
                            </tbody>
                        </table>


                        <div className="w-full">

                            <div className="border border-slate-300 rounded p-3 w-full">
                                <div className="flex flex-col items-center mb-4">
                                    <div className="font-semibold uppercase">
                                        TAX PAID TO DATE
                                    </div>

                                    <div className="font-semibold bg-yellow-500 px-4 py-1 rounded mt-1">
                                        {formatCurrency(totalTaxPaid)}
                                    </div>
                                </div>

                                <div className="border-t border-slate-400 pt-2">
                                    {MONTH_TABS.map((tab) => {
                                        const monthNumber = MONTH_MAP[tab.key];
                                        const dbAmount = paidTaxMap.get(`${year}-${monthNumber}`);
                                        const taxAmount = dbAmount ?? wtax_data?.data?.month_list?.[tab.key] ?? 0;

                                        return (
                                            <div
                                                key={tab.key}
                                                className="grid grid-cols-[1fr_auto_70px] gap-4 py-1 font-semibold">
                                                <div>{tab.label}</div>

                                                <div className="text-right">
                                                    {formatCurrency(taxAmount)}
                                                </div>

                                                <div>
                                                    {dbAmount !== undefined && (
                                                        <span className="text-green-600">
                                                            PAID
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="border-t border-slate-300 mt-2 pt-2">
                                    <div className="grid grid-cols-[1fr_auto_70px] gap-4 font-bold">
                                        <div>TOTAL</div>
                                        <div className="text-right">
                                            {formatCurrency(totalTaxAmount)}
                                        </div>
                                        {/* <div /> */}
                                    </div>
                                </div>
                            </div>
                        </div>



                    </div>

                </div>

            </div>

        </>
    );
}