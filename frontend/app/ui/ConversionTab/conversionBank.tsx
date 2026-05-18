import { useAuth } from "@/app/components/UserContext";
import {  useConversionArchiveDetailsBank } from "@/app/hooks/useConversion";
import { useGenerateBankFile } from "@/app/hooks/usePayrollArchive";
import { conversionArchiveList, TotalsConversionArchive } from "@/app/types/conversionType";
import { formatCurrency } from "@/app/utils/currencyConverter";





type Props = {
    archiveId: number;
};


export default function ConversionBank({archiveId}:Props){
     const { user } = useAuth();

    const { data, isLoading } = useConversionArchiveDetailsBank(archiveId);

    // Hook must be called before any return
    const { generate } = useGenerateBankFile();

    const company = user?.company_id;

    const selectedBank =
        company === "EMB"
            ? "BDO"
            : company
            ? "PNB"
            : null;

    // Safe fallback
    const conversionData: conversionArchiveList[] = data ?? [];

    const totals = conversionData.reduce<TotalsConversionArchive>(
        (acc, item) => {
            return {
                basic: acc.basic + Number(item.basic_salary ?? 0),
                daily: acc.daily + Number(item.daily_rate ?? 0),
                amount:
                    acc.amount +
                    Number(item.leave_amount_for_conversion ?? 0),
            };
        },
        {
            basic: 0,
            daily: 0,
            amount: 0,
        }
    );

    if (isLoading) {
        return <div>Loading...</div>;
    }
    return(

        <div>
    <div className="overflow-x-auto p-4">

           <div className="mb-4">
            {selectedBank && company && (
                <button
                  onClick={() =>
                    generate(
                      selectedBank,
                      conversionData.filter((emp) => emp.EmpCode?.employeepayroll?.bank_account)
                        .map((emp) => ({
                          bankAccount: emp.EmpCode?.employeepayroll?.bank_account ?? "",
                          amount: emp.leave_amount_for_conversion,
                        })),
                      company 
                    )
                  }
                  className={`${selectedBank === "BDO"
                      ? "bg-green-700 hover:bg-green-600 hover:cursor-pointer"
                      : "bg-blue-700 hover:bg-blue-600 hover:cursor-pointer"
                  } text-white rounded-lg px-6 py-2.5`}>
                  Generate {selectedBank}
                </button>
            )}
           </div> 

            <table className="min-w-full border border-gray-200 text-center">
                <thead className="bg-slate-800 text-white">
                    <tr>
                        <th className="px-4 py-2 border border-slate-400">#</th>
                        <th className="px-4 py-2 border border-slate-400">Employee</th>
                        <th className="px-4 py-2 border border-slate-400">Bank Account</th>
                        <th className="px-4 py-2 border border-slate-400">Amount For Conversion</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.map((item: conversionArchiveList,index) => (
                        <tr key={item.EmpCodeId} className="border-t">
                            <td className="px-4 py-2">{index + 1}</td>
                            <td className="px-4 py-2">{`${item.EmpCode.Lastname} ${item.EmpCode.Firstname}`}</td>
                            <td className="px-4 py-2">{item.EmpCode.employeepayroll.bank_account}</td>
                            <td className="px-4 py-2">
                                {formatCurrency(item.leave_amount_for_conversion)}
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td className="font-semibold border border-gray-400 p-2" colSpan={3}>
                            TOTAL
                        </td>

          


                        <td className="font-semibold border border-gray-400 p-2 text-center">
                            {formatCurrency(totals?.amount)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        </div>
    );



}