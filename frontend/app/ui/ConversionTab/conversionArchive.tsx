import { useConversionArchiveDetails } from "@/app/hooks/useConversion";
import { conversionArchiveList, TotalsConversionArchive } from "@/app/types/conversionType";
import { formatCurrency } from "@/app/utils/currencyConverter";
import { formatDate } from "@/app/utils/DateFormatter";

type Props = {
    archiveId: number;
};

export default function ConversionArchive({ archiveId }: Props) {
    const { data, isLoading } = useConversionArchiveDetails(archiveId);


    const totals = data?.reduce<TotalsConversionArchive>(
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

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-center">
                <thead className="bg-slate-800 text-white">
                    <tr>
                        <th className="px-4 py-2 border border-slate-400">#</th>
                        <th className="px-4 py-2 border border-slate-400">Employee</th>
                        <th className="px-4 py-2 border border-slate-400">Date Hired</th>
                        <th className="px-4 py-2 border border-slate-400">Tenure</th>
                        <th className="px-4 py-2 border border-slate-400">Monthly Basic</th>
                        <th className="px-4 py-2 border border-slate-400">Daily Rate </th>
                        <th className="px-4 py-2 border border-slate-400">Remaining VL</th>
                        <th className="px-4 py-2 border border-slate-400">Vl for Convert</th>
                        <th className="px-4 py-2 border border-slate-400">SL per DTR</th>
                        <th className="px-4 py-2 border border-slate-400">Total Leave Credits For Conversion</th>
                        <th className="px-4 py-2 border border-slate-400">Amount For Conversion</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.map((item: conversionArchiveList, index) => (
                        <tr key={item.EmpCodeId} className="border-t">
                            <td className="px-4 py-2">{index + 1}</td>
                            <td className="px-4 py-2">{`${item.EmpCode.Lastname} ${item.EmpCode.Firstname}`}</td>
                            <td className="px-4 py-2">{formatDate(item.EmployementDate)}</td>
                            <td className="px-4 py-2">{item.tenure}</td>
                            <td className="px-4 py-2">{formatCurrency(item.basic_salary)}</td>
                            <td className="px-4 py-2">{(item.daily_rate)}</td>
                            <td className="px-4 py-2">{item.Vacation}</td>
                            <td className="px-4 py-2">{item.leave_convert}</td>
                            <td className="px-4 py-2">{item.Sick}</td>
                            <td className="px-4 py-2">{item.total_leave_for_conversion}</td>
                            <td className="px-4 py-2">
                                {formatCurrency(item.leave_amount_for_conversion)}
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td className="font-semibold border border-gray-200 p-2" colSpan={4}>
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
    );
}