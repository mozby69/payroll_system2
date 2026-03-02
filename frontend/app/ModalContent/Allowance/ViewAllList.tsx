import { useFetchViewAll } from "@/app/hooks/useAllowance";
import { LoanItem, ViewAllItem } from "@/app/types/allowanceType";
import { formatCurrency } from "@/app/utils/currencyConverter";
import { formatMonthYear } from "@/app/utils/DateFormatter";






interface Props {
    selectedMonth: string;
}


export default function ViewAllList({selectedMonth}:Props){

    const { data } = useFetchViewAll(selectedMonth);

    const boardMembers = data?.BOARD_MEMBER ?? [];
    const mancom = data?.MANCOM ?? [];
    const branches = data?.BRANCHES ?? {};
    const loans = data?.LOANS ?? [];

    function computeTotals(list: ViewAllItem[]) {
        return list.reduce(
          (acc, emp) => {
            acc.cash_allowance += Number(emp.cash_allowance ?? 0);
            acc.computed_ecola += Number(emp.computed_ecola ?? 0);
            acc.deduct += Number(emp.deduct ?? 0);
            acc.fch_rfc_deducted += Number(emp.fch_rfc_deducted ?? 0);
            acc.totalDeduction += Number(emp.totalDeduction ?? 0);
            acc.total += Number(emp.total ?? 0);
            return acc;
          },
          {
            cash_allowance: 0,
            computed_ecola: 0,
            deduct: 0,
            fch_rfc_deducted: 0,
            totalDeduction: 0,
            total: 0,
          }
        );
      }

      function computeLoanTotal(list: LoanItem[]) {
        return list.reduce(
          (sum, loan) => sum + Number(loan.per_payroll_deduct ?? 0),
          0
        );
      }

      const boardTotals = computeTotals(boardMembers);
      const mancomTotals = computeTotals(mancom);
      const loanTotals = computeLoanTotal(loans);
    return(
        <>
        <div className="p-2">

            <div className="font-semibold space-y-1 uppercase">
                <h2>JAMERO GROUP OF COMPANIES</h2>
                <h2>CASH ASSITANCE & ECOLA</h2>
                <h2>FOR THE MONTH OF {formatMonthYear(selectedMonth)}</h2>
            </div>

            <div className="pt-4">
                <table className="border-collapse w-12/12 border border-gray-300 text-center">
                    <thead>
                        <tr className="bg-gray-300">
                            <th className="py-2">BOARD</th>
                            <th>CASH ASSITANCE</th>
                            <th>ECOLA</th>
                            <th>ABSENCES</th>
                            <th>LOANS</th>
                            <th>TOTAL DEDUCTIONS</th>
                            <th>TOTAL</th>
                        </tr>
                    </thead>

                    <tbody>
                    {boardMembers.map((emp) => (
                        <tr key={emp.EmpCode}>
                            <td className="py-1">{emp.name}</td>
                            <td className="py-1">{emp.cash_allowance}</td>
                            <td className="py-1">{emp.computed_ecola}</td>
                            <td className="py-1">{emp.deduct}</td>
                            <td className="py-1">{emp.fch_rfc_deducted.toFixed(2)}</td>
                            <td className="py-1">{emp.totalDeduction.toFixed(2)}</td>
                            <td className="py-1">{emp.total}</td>
                        </tr>
                    ))}
                        <tr className="border-t font-semibold bg-gray-100">
                        <td className="py-1">GRAND TOTAL</td>
                        <td>{formatCurrency(boardTotals.cash_allowance)}</td>
                        <td>{formatCurrency(boardTotals.computed_ecola)}</td>
                        <td>{formatCurrency(boardTotals.deduct)}</td>
                        <td>{formatCurrency(boardTotals.fch_rfc_deducted)}</td>
                        <td>{formatCurrency(boardTotals.totalDeduction)}</td>
                        <td>{formatCurrency(boardTotals.total)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>


            <div className="pt-4">
                <table className="border-collapse w-12/12 border border-gray-300 text-center">
                    <thead>
                        <tr className="bg-gray-300">
                            <th className="py-2">MANCOM</th>
                            <th>CASH ASSITANCE</th>
                            <th>ECOLA</th>
                            <th>ABSENCES</th>
                            <th>LOANS</th>
                            <th>TOTAL DEDUCTIONS</th>
                            <th>TOTAL</th>
                        </tr>
                    </thead>

                    <tbody>
                    {mancom.map((emp) => (
                        <tr key={emp.EmpCode}>
                            <td className="py-1">{emp.name}</td>
                            <td className="py-1">{emp.cash_allowance}</td>
                            <td className="py-1">{emp.computed_ecola}</td>
                            <td className="py-1">{emp.deduct}</td>
                            <td className="py-1">{emp.fch_rfc_deducted.toFixed(2)}</td>
                            <td className="py-1">{emp.totalDeduction.toFixed(2)}</td>
                            <td className="py-1">{emp.total}</td>
                        </tr>
                        ))}
                        <tr className="border-t font-semibold bg-gray-100">
                            <td className="py-1">GRAND TOTAL</td>
                            <td>{formatCurrency(mancomTotals.cash_allowance)}</td>
                            <td>{formatCurrency(mancomTotals.computed_ecola)}</td>
                            <td>{formatCurrency(mancomTotals.deduct)}</td>
                            <td>{formatCurrency(mancomTotals.fch_rfc_deducted)}</td>
                            <td>{formatCurrency(mancomTotals.totalDeduction)}</td>
                            <td>{formatCurrency(mancomTotals.total)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>


            
            <div className="pt-4">
            {Object.entries(branches).map(([branch, employees]) => (
                <div key={branch} className="mb-6">
          

                <table className="border-collapse w-12/12 border border-gray-300 text-center">
                    <thead>
                    <tr className="bg-gray-300">
                        <th className="py-2">{branch}</th>
                        <th>CASH ASSISTANCE</th>
                        <th>ECOLA</th>
                        <th>ABSENCES</th>
                        <th>LOANS</th>
                        <th>TOTAL DEDUCTIONS</th>
                        <th>TOTAL</th>
                    </tr>
                    </thead>

                    <tbody>
                    {(() => {
                    const branchTotals = computeTotals(employees);

                    return (
                        <>
                        {employees.map((emp) => (
                            <tr key={emp.EmpCode} className="border-t">
                            <td className="py-1">{emp.name}</td>
                            <td>{emp.cash_allowance.toFixed(2)}</td>
                            <td>{emp.computed_ecola.toFixed(2)}</td>
                            <td>{emp.deduct.toFixed(2)}</td>
                            <td>{emp.fch_rfc_deducted.toFixed(2)}</td>
                            <td>{emp.totalDeduction.toFixed(2)}</td>
                            <td className="font-semibold">{emp.total.toFixed(2)}</td>
                            </tr>
                        ))}

                        <tr className="border-t font-semibold bg-gray-100">
                            <td className="py-1">GRAND TOTAL</td>
                            <td>{formatCurrency(branchTotals.cash_allowance)}</td>
                            <td>{formatCurrency(branchTotals.computed_ecola)}</td>
                            <td>{formatCurrency(branchTotals.deduct)}</td>
                            <td>{formatCurrency(branchTotals.fch_rfc_deducted)}</td>
                            <td>{formatCurrency(branchTotals.totalDeduction)}</td>
                            <td>{formatCurrency(branchTotals.total)}</td>
                        </tr>
                        </>
                    );
                    })()}
                    </tbody>
                </table>
                </div>
            ))}
            </div>



            <div>
            <h2 className="font-semibold text-lg">LOANS</h2>
            <div className="pt-2">
                <table className="border-collapse w-12/12 border border-gray-300 text-left">
                    <thead>
                        <tr className="bg-gray-300 uppercase">
                            <th className="p-2">NAME</th>
                            <th className="p-2">Deduction</th>
                      
                        </tr>
                    </thead>

                    <tbody>
                    {loans.map((emp) => (
                        <tr key={emp.EmpCode}>
                            <td className="py-1 px-2 border border-gray-300">{emp.Lastname}, {emp.Firstname}</td>
                            <td className="py-1 px-2 border border-gray-300">{emp.per_payroll_deduct}</td>
                        </tr>
                        ))}
                    <tr className="bg-gray-200 font-bold">
                        <td className="py-1 px-2 border border-gray-300">GRAND TOTAL</td>
                        <td className="py-1 px-2 border border-gray-300">{formatCurrency(loanTotals)}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
            </div>
                    
        
   



                        
        </div>
        
        </>
    );
}