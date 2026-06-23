"use client";
import { TabItem } from "@/app/components/Tab";
import { MonthSidebar } from "@/app/components/TabVertical";
import { taxPeriodListProps } from "@/app/types/statutoryType";
import { formatAmount, formatCurrency } from "@/app/utils/currencyConverter";
import { useState } from "react";


type WTaxTaxPeriodListProps = {
    data: taxPeriodListProps;
};


export default function ArchiveTax({ data }: WTaxTaxPeriodListProps) {
    const [activeTab, setActiveTab] = useState<string>(
        data.payments?.[0]?.EmpCodeId ?? ""
    );


    const PAYMENT_TABS: TabItem<string>[] =
        data.payments?.map((payment) => ({
            key: payment.EmpCodeId,
            label: payment.name,
        })) ?? [];


    const selectedPayment = data.payments?.find(
        (payment) => payment.EmpCodeId === activeTab
    );

    const totalMonthList = Object.values(
        selectedPayment?.month_list || {}
    ).reduce((sum, value) => sum + Number(value), 0);


    return (
        <div className="p-4">

            <h2 className="font-bold uppercase text-lg py-2">
                {data.month} {data.year}
            </h2>


            <div className="flex gap-x-2">
                <div>
                    <MonthSidebar
                        activeTab={activeTab}
                        onChange={setActiveTab}
                        tabs={PAYMENT_TABS}
                    />
                </div>


                <div>
                    {selectedPayment && (
                        <div className="mt-4">
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
                                        <th className="border border-slate-400 p-1">{formatAmount(selectedPayment.col2?.philhealth_contrib)}</th>
                                        <th className="border border-slate-400 p-1">{formatAmount(selectedPayment?.col3?.sss_employe_contrib ?? 0)}</th>
                                        <th className="border border-slate-400 p-1">{formatAmount(selectedPayment?.col4?.pagibig_contrib ?? 0)}</th>
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
                                        <td className="text-center p-1 border border-slate-400">{formatAmount(selectedPayment.col1?.a2 ?? 0)}</td>
                                    </tr>
                                    <tr>
                                        <td className="text-center border border-slate-400">{formatAmount(selectedPayment?.col1?.basic_salary ?? 0)}</td>
                                        <td className="text-center border border-slate-400 p-2">{formatAmount(selectedPayment?.col1?.b2)}</td>
                                        <td className="text-center border border-slate-400">{formatAmount(selectedPayment?.col2?.b3)}</td>
                                        <td className="text-center border border-slate-400">{formatAmount(selectedPayment?.col3?.b4)}</td>
                                        <td className="text-center border border-slate-400">{formatAmount(selectedPayment?.col4?.b5)}</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td className="text-center p-1 border border-slate-400">{formatAmount(selectedPayment?.col1?.c2)}</td>
                                        <td className="text-center p-1 border border-slate-400">{formatAmount(selectedPayment?.col2?.c3)}</td>
                                        <td className="text-center p-1 border border-slate-400">{formatAmount(selectedPayment?.col3?.c4 ?? 0)}</td>
                                        <td className="text-center p-1 border border-slate-400">{formatAmount(selectedPayment?.col4?.c5)}</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td className="text-center p-1 border border-slate-400">{formatAmount(selectedPayment?.col1?.d2)}</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td className="text-center p-1 border border-slate-400">{formatAmount(selectedPayment?.col1?.e2)}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold">FIXED</td>
                                        <td className="text-center p-1 border border-slate-400">{formatAmount(selectedPayment?.col1?.f2 ?? 0)}</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td className="text-center p-1 border border-slate-400">{formatAmount(selectedPayment?.col1?.g2 ?? 0)}</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td className="text-right font-semibold py-1 px-4 border border-slate-400">{selectedPayment?.col1?.h2}%</td>
                                        <td className="text-center border border-slate-400">{formatAmount(selectedPayment?.col2?.h3 ?? 0)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2}></td>
                                        <td className="text-center border border-slate-400 p-1">{formatAmount(selectedPayment?.col2?.i3 ?? 0)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="font-semibold">W/TAX PAYABLE</td>
                                        <td className="text-center border border-slate-400 p-1">{formatAmount(selectedPayment?.col2?.j3 ?? 0)}</td>
                                        <td className="text-center border border-slate-400 p-1">{selectedPayment?.col3?.j4}</td>
                                        <td className="text-center border border-red-300 p-1 bg-red-300 font-semibold">{formatAmount(selectedPayment?.col4?.j5 ?? 0)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="font-semibold">LESS: TOTAL W/TAX PAID</td>
                                        <td className="text-center border border-slate-400 p-1"> ({formatAmount(selectedPayment?.col2?.k3 ?? 0)})</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="font-semibold">REMAINING W/TAX PAID</td>
                                        <td className="text-center border border-slate-400 p-1">{formatAmount(selectedPayment?.col2?.l3 ?? 0)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>




                <div className="w-full grid grid-cols-[200px_1fr] gap-2">
                    <div className="flex flex-col items-center">
                        <div className="font-semibold">
                            TAX PAID TO DATE
                        </div>

                        <div className="font-semibold bg-yellow-500 px-4 py-1 rounded mt-1">
                            {formatCurrency(selectedPayment?.taxAmount)}
                        </div>
                    </div>
                    <div className="border border-slate-300 rounded p-2 text-left">
                        {Object.entries(selectedPayment?.month_list || {}).map(([month, value]) => (
                            <div key={month} className="flex justify-between px-4 space-y-2 font-semibold text-md">
                                <span>{month}</span>
                                <span>{value}</span>
                            </div>
                        ))}
                        <div className="flex justify-between px-4 space-y-1 font-bold border-t border-slate-400 pt-2">
                            <div className="">TOTAL</div>
                            <div>{formatCurrency(totalMonthList)}</div>
                        </div>
                    </div>
                </div>



            </div>




        </div>
    );
}