import { useFetchViewAll } from "@/app/hooks/useAllowance";
import { formatMonthYear } from "@/app/utils/DateFormatter";






interface Props {
    selectedMonth: string;
  }


export default function ViewAllList({selectedMonth}:Props){

    const { data } = useFetchViewAll(selectedMonth);

    const boardMembers = data?.BOARD_MEMBER ?? [];
    const mancom = data?.MANCOM ?? [];
    const branches = data?.BRANCHES ?? {};


    return(
        <>
        <div className="p-4">

            <div className="font-semibold space-y-1 uppercase">
                <h2>JAMERO GROUP OF COMPANIES</h2>
                <h2>CASH ASSITANCE & ECOLA</h2>
                <h2>FOR THE MONTH OF {formatMonthYear(selectedMonth)}</h2>
            </div>

            <div className="pt-4">
                <table className="border-collapse w-10/12 border border-gray-300 text-center">
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
                    </tbody>
                </table>
            </div>


            <div className="pt-4">
                <table className="border-collapse w-10/12 border border-gray-300 text-center">
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
                    </tbody>
                </table>
            </div>


            
            <div className="pt-4">
            {Object.entries(branches).map(([branch, employees]) => (
                <div key={branch} className="mb-6">
                {/* <h3 className="font-semibold mb-2">{branch}</h3> */}

                <table className="border-collapse w-10/12 border border-gray-300 text-center">
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
                    {employees.map((emp) => (
                        <tr key={emp.EmpCode} className="border-t">
                        <td className="py-1">{emp.name}</td>
                        <td className="py-1">{emp.cash_allowance.toFixed(2)}</td>
                        <td className="py-1">{emp.computed_ecola.toFixed(2)}</td>
                        <td className="py-1">{emp.deduct.toFixed(2)}</td>
                        <td className="py-1">{emp.fch_rfc_deducted.toFixed(2)}</td>
                        <td className="py-1">{emp.totalDeduction.toFixed(2)}</td>
                        <td className="py-1 font-semibold">{emp.total.toFixed(2)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            ))}
            </div>
                    
        
   



                        
        </div>
        
        </>
    );
}