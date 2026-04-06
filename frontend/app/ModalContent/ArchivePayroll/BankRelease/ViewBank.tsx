import CompanyFilter from "@/app/components/CompanyFilter";
import { useGenerateBankFile } from "@/app/hooks/usePayrollArchive";
import { BankProps } from "@/app/types/totalPayroll";
import { formatAmount, formatCurrency } from "@/app/utils/currencyConverter";






interface Props {
  data2: BankProps[];
  cycleCategory: string | null;
  company: string | null;
  paycode:string | null;
  setCompany: (val: string | null) => void;
}
  
export default function ViewBank({data2,cycleCategory,company,paycode,setCompany}: Props) {
  const calculateTotal = (list: BankProps[]) =>
    list.reduce((sum, emp) => sum + emp.Netpay, 0);

  const total = calculateTotal(data2);


  const no_data = data2.length === 0;
  const showBDO = company === "EMB" && !no_data;
  const showPNB = company !== null && company !== "EMB" && !no_data;
  const selectedBank = company === "EMB" ? "BDO" : company ? "PNB" : null;
  const { generate } = useGenerateBankFile();

  return (
    <div className="p-6 space-y-6">


      <div className="font-semibold text-lg"><span className="font-bold">Payroll Period: </span>{paycode}</div>
      <div className="flex justify-between items-center">
        <CompanyFilter
          value={company ?? ""}
          cycle={cycleCategory ?? ""}
          onChange={(val) => setCompany(val || null)}
        />

      <div className="flex gap-x-4">
            {selectedBank && company  && !no_data && (
                <button
                  onClick={() =>
                    generate(
                      selectedBank,
                      data2
                        .filter((emp) => emp.EmpCode.bank_account)
                        .map((emp) => ({
                          bankAccount: emp.EmpCode.bank_account ?? "",
                          amount: emp.Netpay,
                        })),
                      company 
                    )
                  }
                  className={`${
                    selectedBank === "BDO"
                      ? "bg-green-700 hover:bg-green-600"
                      : "bg-blue-700 hover:bg-blue-600"
                  } text-white rounded-lg px-6 py-2.5`}
                >
                  Generate {selectedBank}
                </button>
              )}
          </div>

      </div>


     
  

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
  
          <thead>
            <tr className="bg-gray-800 text-white text-xs uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Employee</th>
              <th className="px-4 py-3 text-left">EmpCode</th>
              <th className="px-4 py-3 text-center">Branch</th>
              <th className="px-4 py-3 text-right">Net Pay</th>
              <th className="px-4 py-3 text-center">Bank Account</th>
            </tr>
          </thead>

          <tbody>

           
            {data2.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">
                  No data available
                </td>
              </tr>
            ) : (
              data2.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {emp.EmpCode.Lastname}, {emp.EmpCode.Firstname}
                  </td>

                  <td className="px-4 py-3 font-medium text-gray-800">
                    {emp.EmpCodeId}
                  </td>
  
                  <td className="px-4 py-3 text-center text-gray-600">
                    {emp.BranchCodeId}
                  </td>
  
                  <td className="px-4 py-3 text-right font-semibold text-green-700">
                    {emp.Netpay.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
  
                  <td className="px-4 py-3 text-center text-gray-700">
                    {emp.EmpCode.bank_account ?? (
                      <span className="text-gray-400 italic">No Account</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {data2.length > 0 && (
            <tfoot>
              <tr className="border-t-2 bg-gray-100">
                <td className="px-4 py-3 font-bold" colSpan={3}>
                  GRAND TOTAL
                </td>
                <td className="px-4 py-3 text-right font-bold text-green-800">
                  {total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td />
              </tr>
            </tfoot>
          )}

        </table>
      </div>
    </div>
  );

}