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


    const payrollRows = selectedPayment?.archive_employee_payroll ?? [];

    const totals = payrollRows.reduce(
        (sum, item) => ({
            grossPay: sum.grossPay + Number(item.Grosspay ?? 0),
            philhealth: sum.philhealth + Number(item.philhealth_employee_share ?? 0),
            sss: sum.sss + Number(item.SSS_employee_share ?? 0),
            pagibig: sum.pagibig + Number(item.Pagibig_employee_share ?? 0),
            wtax: sum.wtax + Number(item.w_tax ?? 0),
        }),
        {
            grossPay: 0,
            philhealth: 0,
            sss: 0,
            pagibig: 0,
            wtax: 0,
        }
    );

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


                <div className="w-full">
                    {selectedPayment && (
                        <div className="grid grid-cols-2 gap-x-4 border border-slate-300 p-4 rounded">
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



                            <div className="border border-slate-300 rounded p-3 min-w-45">
                                <div className="flex flex-col items-center border-b border-slate-500 pb-4">
                                    <div className="font-semibold">
                                        TAX PAID TO DATE
                                    </div>

                                    <div className="font-semibold bg-yellow-500 px-4 py-1 rounded mt-1">
                                        {formatCurrency(selectedPayment?.taxAmount)}
                                    </div>
                                </div>
                                {Object.entries(selectedPayment?.month_list || {}).map(
                                    ([month, value]) => (
                                        <div
                                            key={month}
                                            className="grid grid-cols-[1fr_auto] gap-6 py-2 font-semibold text-sm">
                                            <span>{month}</span>
                                            <span className="text-right">
                                                {formatCurrency(Number(value))}
                                            </span>
                                        </div>
                                    )
                                )}

                                <div className="grid grid-cols-[1fr_auto] gap-6 pt-2 mt-2 border-t border-slate-400 font-bold">
                                    <span>TOTAL</span>
                                    <span className="text-right">
                                        {formatCurrency(totalMonthList)}
                                    </span>
                                </div>
                            </div>



                        </div>




                    )}

                    <div className="border border-slate-300 rounded w-full p-4 mt-4">

                        <div className="flex justify-between mb-2 font-extrabold uppercase">
                            <h2>{selectedPayment?.name}</h2>
                            <h2>status: {selectedPayment?.civil_status}</h2>
                        </div>
                        <div>
                            <table className="w-full border border-slate-300">
                                <thead>
                                    <tr>
                                        <th className="p-1">PAYDATE</th>
                                        <th>SALARY</th>
                                        <th>GROSS</th>
                                        <th>PHILHLTH</th>
                                        <th>S.S.S</th>
                                        <th>PAGIBIG</th>
                                        <th>TAX</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedPayment?.archive_employee_payroll?.length ? (
                                        selectedPayment.archive_employee_payroll.map((item) => (
                                            <tr key={item.PayCode}>
                                                <td className="border border-slate-300 p-1 text-center">
                                                    {item.PayCode}
                                                </td>
                                                <td className="border border-slate-300 p-1 text-right">
                                                    {formatCurrency(item.Basic_salary * 2)}
                                                </td>
                                                <td className="border border-slate-300 p-1 text-right">
                                                    {formatCurrency(item.Grosspay)}
                                                </td>
                                                <td className="border border-slate-300 p-1 text-right">
                                                    {formatCurrency(item.philhealth_employee_share)}
                                                </td>
                                                <td className="border border-slate-300 p-1 text-right">
                                                    {formatCurrency(item.SSS_employee_share)}
                                                </td>
                                                <td className="border border-slate-300 p-1 text-right">
                                                    {formatCurrency(item.Pagibig_employee_share)}
                                                </td>
                                                <td className="border border-slate-300 p-1 text-right">
                                                    {formatCurrency(item.w_tax)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="border border-slate-300 p-2 text-center text-slate-500">
                                                No archive payroll data
                                            </td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td className="text-center px-2 py-2 border border-slate-300 font-bold">
                                            TOTAL
                                        </td>
                                        <td className="text-right px-2 border border-slate-300 font-bold"></td>
                                        <td className="text-right px-2 border border-slate-300 font-bold">
                                            {formatCurrency(totals.grossPay)}
                                        </td>
                                        <td className="text-right px-2 border border-slate-300 font-bold">
                                            {formatCurrency(totals.philhealth)}
                                        </td>
                                        <td className="text-right px-2 border border-slate-300 font-bold">
                                            {formatCurrency(totals.sss)}
                                        </td>
                                        <td className="text-right px-2 border border-slate-300 font-bold">
                                            {formatCurrency(totals.pagibig)}
                                        </td>
                                        <td className="text-right px-2 border border-slate-300 font-bold">
                                            {formatCurrency(totals.wtax)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>













            </div>




        </div>
    );
}