import { useGenerateBankFile } from "@/app/hooks/usePayrollArchive";
import { BankProps } from "@/app/types/totalPayroll";
import { formatAmount, formatCurrency } from "@/app/utils/currencyConverter";






interface Props {
    BDOList: BankProps[];
    PNBList: BankProps[];
    cycleCategory: string | null;
  }
  
  export default function ViewBank({ BDOList, PNBList, cycleCategory, }: Props) {
    const bdoCycle = BDOList?.[0]?.cycle_category ?? null;
    const pnbCycle = PNBList?.[0]?.cycle_category ?? null;
    const { generate } = useGenerateBankFile();
  
    const showBDO = cycleCategory === "10-25-Cycle";

    const calculateTotal = (list: BankProps[]) =>
        list.reduce((sum, emp) => sum + emp.Netpay, 0);
      
      const bdoTotal = calculateTotal(BDOList);
      const pnbTotal = calculateTotal(PNBList);
  

  
    return (
      <div className="p-6 space-y-4">

            <div className="flex justify-between items-center mb-4">


            <div>
            {showBDO && (
                <button
                onClick={() =>
                    generate(
                    "BDO",
                    BDOList
                        .filter(emp => emp.EmpCode.bank_account)
                        .map(emp => ({
                        bankAccount: emp.EmpCode.bank_account ?? "",
                        amount: emp.Netpay,
                        }))
                    )
                }
                className="bg-green-700 hover:bg-green-600 text-white rounded-lg px-6 py-2.5">
                Generate BDO File
                </button>
            )}
            </div>

            <div>
            <button
                onClick={() =>
                generate(
                    "PNB",
                    PNBList
                    .filter(emp => emp.EmpCode.bank_account)
                    .map(emp => ({
                        bankAccount: emp.EmpCode.bank_account ?? "",
                        amount: emp.Netpay,
                    }))
                )
                }
                className="bg-blue-700 hover:bg-blue-600 text-white rounded-lg px-6 py-2.5">
                Generate PNB File
            </button>
            </div>

            </div>





       
  
        {/* ================= BDO ================= */}
        {showBDO && (
          <div className="bg-white shadow-md rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                BANK: BDO
              </h2>
              <h2 className="text-lg font-semibold text-gray-800">
                CYCLE: {bdoCycle}
              </h2>
            </div>
  
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-700 text-white uppercase">
                  <th className="py-2 px-3 text-left">Name</th>
                  <th className="py-2 px-3 text-center">Branch</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                  <th>Bank Account</th>
                </tr>
              </thead>
  
              <tbody>
                {BDOList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-6 text-center text-gray-400"
                    >
                      No data available
                    </td>
                  </tr>
                ) : (
                  BDOList.map((emp) => (
                    <tr
                      key={emp.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="py-2 px-3">
                        {emp.EmpCode.Lastname}{" "}
                        {emp.EmpCode.Firstname}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {emp.BranchCodeId}
                      </td>
                      <td className="py-2 px-3 text-right font-medium">
                        {formatAmount(emp.Netpay)}
                      </td>
                      <td className="py-2 px-3 text-center font-medium">{emp.EmpCode.bank_account}</td>
                    </tr>
                  ))
                )}

                <tr className="border-t-2 bg-gray-100 font-extrabold">
                    <td className="py-3 px-3 text-left" colSpan={2}>GRAND TOTAL:</td>
                    
                    <td className="py-3 px-3 text-right text-green-900">
                    {formatCurrency(bdoTotal)}
                    </td>
                    <td></td>
                </tr>


              </tbody>
            </table>
          </div>
        )}
  



        {/* ================= PNB ================= */}
        <div className="bg-white shadow-md rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              BANK: PNB
            </h2>
            <span className="text-lg font-semibold text-gray-800">
              CYCLE: {pnbCycle}
            </span>
          </div>
  
          <table className="w-full border-collapse text-sm">
            <thead className="font-bold uppercase">
              <tr className="bg-gray-700 text-white">
                <th className="py-2 px-3 text-left">Name</th>
                <th className="py-2 px-3 text-center">Branch</th>
                <th className="py-2 px-3 text-right">Amount</th>
                <th>Bank Account</th>
              </tr>
            </thead>
  
            <tbody className="font-semibold">
              {PNBList.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-6 text-center text-gray-400"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                PNBList.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-t hover:bg-gray-50">
                    <td className="py-2 px-3">
                      {emp.EmpCode.Lastname}{" "}
                      {emp.EmpCode.Firstname}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {emp.BranchCodeId}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {formatAmount(emp.Netpay)}
                    </td>
                    <td className="py-2 px-3 text-center font-medium">{emp.EmpCode.bank_account}</td>
                  </tr>
                ))
              )}

                <tr className="border-t-2 bg-gray-100 font-extrabold">
                    <td className="py-3 px-3 text-left" colSpan={2}>GRAND TOTAL:</td>
                    
                    <td className="py-3 px-3 text-right text-green-900">
                    {formatCurrency(pnbTotal)}
                    </td>
                    <td></td>
                </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }