import { useAuth } from "@/app/components/UserContext";
import { useAllowanceSignatories } from "@/app/hooks/useAllowance";
import { useConversionReport } from "@/app/hooks/useConversion";
import { useGetCompanyByCode } from "@/app/hooks/useGeneral";
import { formatCurrency } from "@/app/utils/currencyConverter";
import { formatDate } from "@/app/utils/DateFormatter";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";




export default function ConversionReport() {


    const { user } = useAuth();
    const company_id = user?.company_id;
    const { data: conversion_report_data } = useConversionReport(company_id);
    const { data: companyData } = useGetCompanyByCode(company_id ?? "")

    const totals = conversion_report_data?.reduce(
        (acc, item) => {
            return {
                basic: acc.basic + Number(item.basic_salary ?? 0),
                daily: acc.daily + Number(item.daily_rate ?? 0),
                amount: acc.amount + Number(item.leave_amount_for_conversion ?? 0),
            };
        },
        {
            basic: 0,
            daily: 0,
            amount: 0,
        }
    );

    const asOfDate = conversion_report_data?.[0]?.as_of_date?.as_of_date;


      const printRef = useRef<HTMLDivElement>(null);
    
    const handlePrint = useReactToPrint({
  contentRef: printRef,
  documentTitle: "conversion report",
  pageStyle: `
    @page {
    size: portrait;
            margin: 15mm;
    }
    body {
      -webkit-print-color-adjust: exact;
    }
  `,
});
        



 const { data: signatoryResponse } = useAllowanceSignatories();

  const signatories = signatoryResponse?.data ?? [];

  // Get only VARIANCE signatories
  const varianceSignatories = signatories.filter(
    (item) => item.category === "SL_VL_CONVERSION" && item.isActive
  );

  const preparedBy = varianceSignatories.filter(
    (item) => item.signatory_type === "PREPARED_BY"
  );

  const checkedBy = varianceSignatories.filter(
    (item) => item.signatory_type === "CHECKED_BY"
  );

  const notedBy = varianceSignatories.filter(
    (item) => item.signatory_type === "NOTED_BY"
  );

  const approvedBy = varianceSignatories.filter(
    (item) => item.signatory_type === "APPROVED_BY"
  );




    return (
        <>
            <div ref={printRef} className="p-2 print-deductions print:bg-white print:shadow-none print:p-2">

                <div className="flex justify-between">
                    <div  >
                        <h2 className="font-semibold uppercase">{companyData?.data?.[0]?.CompanyName ?? ""}.</h2>
                        <h2>VL AND SL CREDITS PLUS SL CONVERSION</h2>
                        LEAVE CREDITS AS OF: {formatDate(asOfDate)}
                        <h2>Date: {formatDate(new Date())}</h2>
                    </div>
                    <div className="print:hidden">
                        <button className="bg-blue-700 hover:bg-blue-600 px-8 py-2 text-white rounded" onClick={handlePrint}>Print</button>
                    </div>

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
                                        {formatCurrency(item.leave_amount_for_conversion)}
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td className="font-semibold border border-gray-200 p-2" colSpan={3}>
                                    TOTAL
                                </td>

                                <td className="font-semibold border border-gray-200 p-2 text-right">
                                    {formatCurrency(totals?.basic)}
                                </td>

                                <td className="font-semibold border border-gray-200 p-2 text-right">
                                    {formatCurrency(totals?.daily)}
                                </td>

                                <td className="font-semibold border border-gray-200 p-2" colSpan={4}></td>

                                <td className="font-semibold border border-gray-200 p-2 text-right">
                                    {formatCurrency(totals?.amount)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>





                {/* signatories */}
                    <div className="mt-4 grid grid-cols-3 px-4 py-4 text-xs">
                        {/* LEFT */}
                        <div className="justify-self-start">
                            <h2 className="font-semibold">PREPARED BY:</h2>

                            {preparedBy.map((item) => (
                            <p key={item.id} className="mt-10 uppercase">
                                {item.name}
                            </p>
                            ))}
                        </div>

                        {/* CENTER */}
                        <div className="justify-self-center">
                            <h2 className="font-semibold">CHECKED BY:</h2>

                            {checkedBy.map((item) => (
                            <p key={item.id} className="mt-10 uppercase">
                                {item.name}
                            </p>
                            ))}
                        </div>

                        {/* RIGHT */}
                        <div className="justify-self-end">
                            <h2 className="font-semibold">APPROVED BY:</h2>

                            {approvedBy.map((item) => (
                            <p key={item.id} className="mt-10 uppercase">
                                {item.name}
                            </p>
                            ))}
                        </div>
                    </div>





            </div>




        </>
    );
}