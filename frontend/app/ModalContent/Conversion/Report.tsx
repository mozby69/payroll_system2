import { useAuth } from "@/app/components/UserContext";
import { useConversionReport } from "@/app/hooks/useConversion";
import { formatDate } from "@/app/utils/DateFormatter";




export default function ConversionReport() {


    const { user } = useAuth();
    const company_id = user?.company_id;
    const { data: conversion_report_data } = useConversionReport(company_id);






    return (
        <>
            <div>

                <div>
                    <h2 className="font-semibold">EMB CAPITAL LENDING CORPORATION</h2>
                    <h2>VL AND SL CREDITS PLUS SL CONVERSION</h2>
                    <h2>LEAVE CREDITS AS OF { }</h2>
                    <h2>Date:{ }</h2>
                </div>

                <div className="py-4">
                    <table className="w-full border-collapse border-gray-100 bg-white shadow-sm rounded-lg overflow-hidden">
                        <thead>
                            <tr>
                                <th className="p-4 border border-gray-200 text-center text-xs font-semibold uppercase">EMPLOYEE NAME</th>
                                <th className="p-4 border border-gray-200 text-center text-xs font-semibold uppercase">DATE HIRED</th>
                                <th className="p-4 border border-gray-200 text-center text-xs font-semibold uppercase">TENURE</th>
                                <th className="p-4 border border-gray-200 text-center text-xs font-semibold uppercase">MONTHLY BASIC</th>
                                <th className="p-4 border border-gray-200 text-center text-xs font-semibold uppercase">DAILY RATE</th>
                                <th className="p-4 border border-gray-200 text-center text-xs font-semibold uppercase">REMAINING LEAVE</th>
                                <th className="p-4 border border-gray-200 text-center text-xs font-semibold uppercase">VL FOR CONVERT</th>
                                <th className="p-4 border border-gray-200 text-center text-xs font-semibold uppercase">SL PER DTR</th>
                                <th className="p-4 border border-gray-200 text-center text-xs font-semibold uppercase">TOTAL LEAVE CREDITS FOR CONVERSION</th>
                                <th className="p-4 border border-gray-200 text-center text-xs font-semibold uppercase">AMOUNT FOR CONVERSION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {conversion_report_data?.map((item, index) => (
                                <tr key={index} className="">
                                    <td className="p-2 border border-gray-200">{item.fullname}</td>
                                    <td className="p-2 border border-gray-200">
                                        {formatDate(item.EmployementDate)}
                                    </td>
                                    <td className="p-2 border border-gray-200 text-center">{item.tenure}</td>
                                    <td className="p-2 border border-gray-200 text-right">{item.basic_salary}</td>
                                    <td className="p-2 border border-gray-200 text-right">{item.daily_rate}</td>
                                    <td className="p-2 border border-gray-200 text-center">{item.Vacation}</td>
                                    <td className="p-2 border border-gray-200 text-center">{item.leave_convert}</td>
                                    <td className="p-2 border border-gray-200 text-center">{item.Sick}</td>
                                    <td className="p-2 border border-gray-200 text-center">
                                        {item.total_leave_for_conversion}
                                    </td>
                                    <td className="p-2 border border-gray-200 text-right">
                                        {(item.leave_amount_for_conversion)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>




            </div>




        </>
    );
}