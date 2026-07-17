import { useFetchViewAll } from "@/app/hooks/useAllowance";
import {  ViewAllItem } from "@/app/types/allowanceType";
import { formatAmount, formatCurrency } from "@/app/utils/currencyConverter";
import { formatMonthYear } from "@/app/utils/DateFormatter";







interface Props {
    selectedMonth: string;
}


export default function ViewAllList({ selectedMonth }: Props) {

    const { data } = useFetchViewAll(selectedMonth);

    const boardMembers = data?.BOARD_MEMBER ?? [];
    const mancom = data?.MANCOM ?? [];
    const mh = data?.MH ?? [];
    const mh_totals = data?.mh_totals;
    const board_mancom_totals = data?.board_mancom_totals;
    const total_mh_boardmancom = data?.total_mh_boardmancom;
    const mh_mancom_loans = data?.mh_mancom_loans ?? [];
    const total_disburse = data?.total_disburse;


    const branches = data?.BRANCHES ?? {};
    //const loans = data?.LOANS ?? [];
    const variance = data?.VARIANCE;
    const total_per_company = Object.entries(data?.TOTAL_PER_COMPANY ?? {});

    const prev = variance?.previous;
    const curr = variance?.current;
    const diff = variance?.variance;

    function computeTotals(list: ViewAllItem[]) {
        return list.reduce(
            (acc, emp) => {
                acc.cash_allowance += Number(emp.cash_allowance ?? 0);
                acc.computed_ecola += Number(emp.computed_ecola ?? 0);
                acc.deduct += Number(emp.deduct ?? 0);
                acc.totalDeduction += Number(emp.totalDeduction ?? 0);
                acc.total += Number(emp.total ?? 0);
                acc.emergency_allowance_amount += Number(emp.emergency_allowance_amount ?? 0);
                return acc;
            },
            {
                cash_allowance: 0,
                computed_ecola: 0,
                deduct: 0,
                totalDeduction: 0,
                total: 0,
                emergency_allowance_amount: 0,
            }
        );
    }

    // function computeLoanTotal(list: loanlistProps[]) {
    //     return list.reduce(
    //         (sum, loan) => sum + Number(loan.per_payroll_deduct ?? 0),
    //         0
    //     );
    // }

    const boardTotals = computeTotals(boardMembers);
    const mancomTotals = computeTotals(mancom);
    const mhTotals = computeTotals(mh);
    //const loanTotals = computeLoanTotal(loans);





    const varianceEmp = data?.VARIANCE_EMP ?? [];

    const addList = varianceEmp.filter(
        (item) => item.variance.action?.type === "ADD"
    );

    const lessList = varianceEmp.filter(
        (item) => item.variance?.action?.type === "LESS"
    );



    const showEmergency = boardMembers.some(emp => emp.is_emergency);



    return (
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
                                <th></th>
                                <th className="py-2">BOARD</th>
                                <th>CASH ASSISTANCE</th>
                                <th>ECOLA</th>
                                <th>ABSENCES</th>

                                {/* <th>TOTAL DEDUCTIONS</th> */}
                                {showEmergency && <th>EMERGENCY ALLOWANCE</th>}
                                <th>NET TOTAL</th>
                            </tr>
                        </thead>

                        <tbody>
                            {boardMembers.map((emp, index) => (
                                <tr key={emp.EmpCode}>
                                    <td className="px-2 border border-gray-300">{index + 1}</td>
                                    <td className="py-1 border border-gray-300">{emp.name}</td>
                                    <td className="py-1 border border-gray-300">{emp.cash_allowance.toFixed(2)}</td>
                                    <td className="py-1 border border-gray-300">{emp.computed_ecola.toFixed(2)}</td>
                                    <td className="py-1 border border-gray-300">{emp.deduct.toFixed(2)}</td>
                                    {showEmergency && <td className="py-1 border border-gray-300">{emp.emergency_allowance_amount}</td>}
                                    <td className="py-1 border border-gray-300">{emp.total}</td>
                                </tr>
                            ))}
                            <tr className="border-t font-semibold bg-gray-100">
                                <td className="py-1" colSpan={2}>GRAND TOTAL</td>
                                <td>{formatCurrency(boardTotals.cash_allowance)}</td>
                                <td>{formatCurrency(boardTotals.computed_ecola)}</td>
                                <td>{formatCurrency(boardTotals.deduct)}</td>
                                {showEmergency && <td>{formatCurrency(boardTotals.emergency_allowance_amount)}</td>}
                                <td>{formatCurrency(boardTotals.total)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>


                <div className="pt-4">
                    <table className="border-collapse w-12/12 border border-gray-300 text-center">
                        <thead>
                            <tr className="bg-gray-300">
                                <th></th>
                                <th className="py-2">MANCOM</th>
                                <th>CASH ASSISTANCE</th>
                                <th>ECOLA</th>
                                <th>ABSENCES</th>
                                {showEmergency && <th>EMERGENCY ALLOWANCE</th>}
                                <th>NET TOTAL</th>
                            </tr>
                        </thead>

                        <tbody>
                            {mancom.map((emp, index) => (
                                <tr key={emp.EmpCode}>
                                    <td className="px-2 border border-gray-300">{index + 1}</td>
                                    <td className="py-1 border border-gray-300">{emp.name}</td>
                                    <td className="py-1 border border-gray-300">{emp.cash_allowance}</td>
                                    <td className="py-1 border border-gray-300">{emp.computed_ecola}</td>
                                    <td className="py-1 border border-gray-300">{emp.deduct}</td>
                                    {showEmergency && <td className="py-1 border border-gray-300">{emp.emergency_allowance_amount}</td>}
                                    <td className="py-1 border border-gray-300">{emp.total}</td>
                                </tr>
                            ))}
                            <tr className="border-t font-semibold bg-gray-100">
                                <td className="py-1" colSpan={2}>GRAND TOTAL</td>
                                <td>{formatCurrency(mancomTotals.cash_allowance)}</td>
                                <td>{formatCurrency(mancomTotals.computed_ecola)}</td>
                                <td>{formatCurrency(mancomTotals.deduct)}</td>
                                {showEmergency && <td>{formatCurrency(mancomTotals.emergency_allowance_amount)}</td>}
                                <td>{formatCurrency(mancomTotals.total)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>



                {/* MH */}
                <div className="pt-4">
                    <table className="border-collapse w-12/12 border border-gray-300 text-center">
                        <thead>
                            <tr className="bg-gray-300">
                                <th></th>
                                <th className="py-2">Branch:MH</th>
                                <th>CASH ASSISTANCE</th>
                                <th>ECOLA</th>
                                <th>ABSENCES</th>
                                {showEmergency && <th>EMERGENCY ALLOWANCE</th>}
                                <th>NET TOTAL</th>
                            </tr>
                        </thead>

                        <tbody>
                            {mh.map((emp, index) => (
                                <tr key={emp.EmpCode}>
                                    <td className="px-2 border border-gray-300">{index + 1}</td>
                                    <td className="py-1 border border-gray-300">{emp.name}</td>
                                    <td className="py-1 border border-gray-300">{formatAmount(emp.cash_allowance)}</td>
                                    <td className="py-1 border border-gray-300">{formatAmount(emp.computed_ecola)}</td>
                                    <td className="py-1 border border-gray-300">{formatAmount(emp.deduct)}</td>
                                    {showEmergency && <td className="py-1 border border-gray-300">{emp.emergency_allowance_amount}</td>}
                                    <td className="py-1 border border-gray-300">{emp.total}</td>
                                </tr>
                            ))}
                            <tr className="border-t font-semibold bg-gray-100">
                                <td className="py-1" colSpan={2}>GRAND TOTAL</td>
                                <td>{formatCurrency(mhTotals.cash_allowance)}</td>
                                <td>{formatCurrency(mhTotals.computed_ecola)}</td>
                                <td>{formatCurrency(mhTotals.deduct)}</td>
                                {showEmergency && <td>{formatCurrency(mhTotals.emergency_allowance_amount)}</td>}
                                <td>{formatCurrency(mhTotals.total)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>



                {/* total mh ,board and mancom */}

                <div className="pt-4">
                    <table className="border-collapse w-12/12 border border-gray-300 text-center">
                        <thead>
                            <tr>
                                <th></th>
                                <th>CASH ALLOWANCE</th>
                                <th>ECOLA</th>
                                <th className="py-1">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mh_totals && (
                                <tr className="border border-gray-300">
                                    <td className="py-1 font-bold">TOTAL MH</td>
                                    <td>{formatCurrency(mh_totals.cash_allowance)}</td>
                                    <td>{formatCurrency(mh_totals.computed_ecola)}</td>
                                    <td>{formatCurrency(mh_totals.total)}</td>
                                </tr>
                            )}
                            {board_mancom_totals && (
                                <tr className="border border-gray-300">
                                    <td className="py-1 font-bold">TOTAL BOARD & MANCOM</td>
                                    <td>{formatCurrency(board_mancom_totals.cash_allowance)}</td>
                                    <td>{formatCurrency(board_mancom_totals.computed_ecola)}</td>
                                    <td>{formatCurrency(board_mancom_totals.total)}</td>
                                </tr>
                            )}
                            {total_mh_boardmancom && (
                                <tr className="border border-gray-300">
                                    <td className="py-1 font-bold">TOTAL</td>
                                    <td>{formatCurrency(total_mh_boardmancom.cash_allowance)}</td>
                                    <td>{formatCurrency(total_mh_boardmancom.computed_ecola)}</td>
                                    <td>{formatCurrency(total_mh_boardmancom.total)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                </div>


                {/* LOAN LIST */}

                <div className="pt-4">
                    <table className="border-collapse w-12/12 border border-gray-300 text-center">
                        <thead>
                            <tr className="border border-gray-300">
                                <th>EMPLOYEE</th>
                                <th>AMOUNT</th>
                                <th className="py-1">DESCRIPTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mh_mancom_loans.map((emp, index) => (
                                <tr key={index} className="border border-gray-300">
                                    <td className="py-1">Less: A/RE- {emp.Lastname},{emp.Firstname}</td>
                                    <td>{formatAmount(emp.per_payroll_deduct)}</td>
                                    <td>{emp.loan_type}, {emp.others_types}</td>
                                </tr>
                            ))}
                            <tr>
                                <td className="py-1 font-bold">TOTAL</td>
                                <td className="font-bold">{formatCurrency(data?.totalmhAndMancomLoans)}</td>
                                <td></td>
                            </tr>



                        </tbody>

                    </table>

                </div>


                {/* total disburse */}
                <div className="pt-4">
                    <table className="border-collapse w-12/12 border border-gray-300 text-center">
                        <thead>
                            <tr>
                                <th></th>
                                <th>CASH ALLOWANCE</th>
                                <th>ECOLA</th>
                                <th className="py-1">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>

                            {total_disburse && (
                                <tr className="border border-gray-300">
                                    <td className="py-1 font-bold">TOTAL DISBURSE</td>
                                    <td>{formatAmount(total_disburse?.cash_allowance)}</td>
                                    <td>{formatAmount(total_disburse?.computed_ecola)}</td>
                                    <td>{formatAmount(total_disburse?.total)}</td>
                                </tr>
                            )}


                        </tbody>
                    </table>

                </div>


                {/* BRANCHES LIST */}
  
                <div className="pt-4">
                    {Object.entries(branches).map(
                        ([company, branchGroup]) => {
                            const companyEmployees =
                                Object.values(branchGroup).flat();

                            const companyTotals = computeTotals(
                                companyEmployees
                            );

                            return (
                                <div key={company} className="mb-4">
                                    <h2 className="mb-2 text-lg font-bold uppercase">
                                        {company}
                                    </h2>

                                    {Object.entries(branchGroup).map(
                                        ([branch, employees]) => {
                                            const branchTotals =
                                                computeTotals(employees);

                                            return (
                                                <div key={branch} className="mb-6">
                                                    <table className="w-full border-collapse border border-gray-300 text-center">
                                                        <thead>
                                                            <tr className="bg-gray-300">
                                                                <th className="py-2" />

                                                                <th className="py-2">
                                                                    {branch}
                                                                </th>

                                                                <th>CASH ASSISTANCE</th>
                                                                <th>ECOLA</th>
                                                                <th>ABSENCES</th>

                                                                {showEmergency && (
                                                                    <th>
                                                                        EMERGENCY ALLOWANCE
                                                                    </th>
                                                                )}

                                                                <th>NET TOTAL</th>
                                                            </tr>
                                                        </thead>

                                                        <tbody>
                                                            {employees.map(
                                                                (employee, index) => (
                                                                    <tr
                                                                        key={employee.EmpCode}
                                                                        className="border-t"
                                                                    >
                                                                        <td className="px-2">
                                                                            {index + 1}
                                                                        </td>

                                                                        <td className="py-1">
                                                                            {employee.name}
                                                                        </td>

                                                                        <td>
                                                                            {formatCurrency(
                                                                                employee.cash_allowance
                                                                            )}
                                                                        </td>

                                                                        <td>
                                                                            {formatCurrency(
                                                                                employee.computed_ecola
                                                                            )}
                                                                        </td>

                                                                        <td>
                                                                            {formatCurrency(
                                                                                employee.deduct
                                                                            )}
                                                                        </td>

                                                                        {showEmergency && (
                                                                            <td>
                                                                                {formatCurrency(
                                                                                    employee.emergency_allowance_amount ??
                                                                                    0
                                                                                )}
                                                                            </td>
                                                                        )}

                                                                        <td className="font-semibold">
                                                                            {formatCurrency(
                                                                                employee.total
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}

                                                            {/* <tr className="border-t bg-gray-100 font-semibold">
                                                                <td
                                                                    className="py-2"
                                                                    colSpan={2}
                                                                >
                                                                    BRANCH TOTAL
                                                                </td>

                                                                <td>
                                                                    {formatCurrency(
                                                                        branchTotals.cash_allowance
                                                                    )}
                                                                </td>

                                                                <td>
                                                                    {formatCurrency(
                                                                        branchTotals.computed_ecola
                                                                    )}
                                                                </td>

                                                                <td>
                                                                    {formatCurrency(
                                                                        branchTotals.deduct
                                                                    )}
                                                                </td>

                                                                {showEmergency && (
                                                                    <td>
                                                                        {formatCurrency(
                                                                            branchTotals.emergency_allowance_amount
                                                                        )}
                                                                    </td>
                                                                )}

                                                                <td>
                                                                    {formatCurrency(
                                                                        branchTotals.total
                                                                    )}
                                                                </td>
                                                            </tr> */}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            );
                                        }
                                    )}

                                    {/* COMPANY TOTAL */}
                                    {/* <table className="w-full border-collapse border border-gray-400 text-center">
                                        <tbody>
                                            <tr className="bg-gray-300 font-bold">
                                                <td className="py-2" colSpan={2}>
                                                    {company} GRAND TOTAL
                                                </td>

                                                <td>
                                                    {formatCurrency(
                                                        companyTotals.cash_allowance
                                                    )}
                                                </td>

                                                <td>
                                                    {formatCurrency(
                                                        companyTotals.computed_ecola
                                                    )}
                                                </td>

                                                <td>
                                                    {formatCurrency(
                                                        companyTotals.deduct
                                                    )}
                                                </td>

                                                {showEmergency && (
                                                    <td>
                                                        {formatCurrency(
                                                            companyTotals.emergency_allowance_amount
                                                        )}
                                                    </td>
                                                )}

                                                <td>
                                                    {formatCurrency(
                                                        companyTotals.total
                                                    )}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table> */}
                                </div>
                            );
                        }
                    )}
                </div>











































                {/* TOTAL PER COMPANY */}
                <div className="pt-4">
                    <table className="border-collapse w-12/12 border border-gray-300 text-center">
                        <thead>
                            <tr className="bg-gray-300">
                                <th></th>
                                <th className="py-2">COMPANY</th>
                                <th>CASH ASSISTANCE</th>
                                <th>ECOLA</th>
                                {showEmergency && <th>EMERGENCY ALLOWANCE</th>}
                                <th>NET TOTAL</th>
                            </tr>
                        </thead>

                        <tbody>
                            {total_per_company.map(([companyCode, company], index) => (
                                <tr key={companyCode}>
                                    <td className="p-2 border border-gray-200">{index + 1}</td>
                                    <td className="p-2 border border-gray-200">{companyCode}</td>
                                    <td className="p-2 border border-gray-200">{formatCurrency(company.total_cash_allowance)}</td>
                                    <td className="p-2 border border-gray-200">{formatCurrency(company.ecola)}</td>
                                    {showEmergency && <td className="p-2 border border-gray-200">{formatCurrency(company.emergency_allowance_amount)}</td>}
                                    <td className="p-2 border border-gray-200">{formatCurrency(company.total_cash_allowance + company.ecola + company.emergency_allowance_amount)}</td>
                                </tr>
                            ))}

                            <tr className="border-t font-semibold bg-gray-100">
                                <td colSpan={2} className="p-2">GRAND TOTAL</td>
                                <td>
                                    {formatCurrency(
                                        total_per_company.reduce(
                                            (sum, [, c]) => sum + c.total_cash_allowance,
                                            0
                                        )
                                    )}
                                </td>

                                <td>
                                    {formatCurrency(
                                        total_per_company.reduce(
                                            (sum, [, c]) => sum + c.ecola,
                                            0
                                        )
                                    )}
                                </td>
                                {showEmergency &&
                                    <td>
                                        {formatCurrency(
                                            total_per_company.reduce(
                                                (sum, [, c]) => sum + c.emergency_allowance_amount,
                                                0
                                            )
                                        )}
                                    </td>
                                }

                                <td>
                                    {formatCurrency(
                                        total_per_company.reduce(
                                            (sum, [, c]) => sum + c.total_cash_allowance + c.ecola + c.emergency_allowance_amount,
                                            0
                                        )
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>







                <div className="mt-4">
                    <h2 className="font-semibold text-lg text-center bg-gray-200 py-1">VARIANCE</h2>

                    <div className="mt-2 space-y-2">


                        <div className="grid grid-cols-4 font-semibold">
                            <h2>MONTH & YEAR</h2>
                            <h2>CASH ASSISTANCE</h2>
                            <h2>ECOLA</h2>
                            <h2>TOTAL</h2>
                        </div>


                        <div className="grid grid-cols-4">
                            <h2 className="uppercase">{formatMonthYear(prev?.selectedMonth ?? "")}</h2>
                            <h2>{formatCurrency(prev?.cash_assistance ?? 0)}</h2>
                            <h2>{formatCurrency(prev?.ecola ?? 0)}</h2>
                            <h2>{formatCurrency(prev?.grand_total ?? 0)}</h2>
                        </div>


                        <div className="grid grid-cols-4">
                            <h2 className="uppercase">
                                {formatMonthYear(curr?.selectedMonth ?? "")}
                            </h2>
                            <h2>{formatCurrency(curr?.cash_assistance ?? 0)}</h2>
                            <h2>{formatCurrency(curr?.ecola ?? 0)}</h2>
                            <h2>{formatCurrency(curr?.grand_total ?? 0)}</h2>
                        </div>


                        <div className="grid grid-cols-4">
                            <h2 className="font-semibold border-t pt-2">VARIANCE</h2>

                            <h2 className="border-t pt-2">
                                {formatCurrency(diff?.cash_assistance ?? 0)}
                            </h2>

                            <h2 className="border-t pt-2">
                                {formatCurrency(diff?.ecola ?? 0)}
                            </h2>

                            <h2 className="border-t pt-2">
                                {formatCurrency(diff?.grand_total ?? 0)}
                            </h2>
                        </div>

                    </div>
                </div>



                {/* variance per employee  */}
                <div className="pt-8">
                    <div>
                        <h2 className="bg-blue-500 text-white font-semibold p-2">ADD</h2>
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="py-2 px-1 border border-gray-300">EMPLOYEE</th>
                                    <th className="py-2 px-1 border border-gray-300">CASH ASSITANCE</th>
                                    <th className="py-2 px-1 border border-gray-300">ECOLA</th>
                                    <th className="py-2 px-1 border border-gray-300">TOTAL</th>
                                    <th className="py-2 px-1 border border-gray-300"></th>
                                </tr>
                            </thead>

                            <tbody className="border border-gray-300">
                                {addList.map((emp) => (
                                    <tr key={emp.EmpCode}>
                                        <td className="p-1 text-center">{emp.name}</td>
                                        <td className="p-1 text-center">{formatCurrency(emp.variance.cash_assistance)}</td>
                                        <td className="p-1 text-center">{formatCurrency(emp.variance.ecola)}</td>
                                        <td className="p-1 text-center font-semibold">{formatCurrency(emp.variance.total)}</td>
                                        <td className="p-1 text-center">{emp.variance?.action?.data?.remarks}</td>
                                    </tr>
                                ))}


                                <tr className="font-bold border-t border-gray-300">
                                    <td className="text-center">TOTAL</td>
                                    <td className="text-center p-2">{formatCurrency(addList.reduce((sum, e) => sum + e.variance.cash_assistance, 0))}</td>
                                    <td className="text-center p-2">{formatCurrency(addList.reduce((sum, e) => sum + e.variance.ecola, 0))}</td>
                                    <td className="text-center p-2">{formatCurrency(addList.reduce((sum, e) => sum + e.variance.total, 0))}</td>
                                </tr>
                            </tbody>

                        </table>
                    </div>

                    <div className="mt-2">
                        <h2 className="bg-yellow-700 text-white font-semibold p-2">LESS</h2>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="py-2 px-1 border border-gray-300">EMPLOYEE</th>
                                    <th className="py-2 px-1 border border-gray-300">CASH ASSITANCE</th>
                                    <th className="py-2 px-1 border border-gray-300">ECOLA</th>
                                    <th className="py-2 px-1 border border-gray-300">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody className="border border-gray-300">
                                {lessList.map((emp) => (
                                    <tr key={emp.EmpCode} className="border border-gray-300">
                                        <td className="p-1 text-center">{emp.name}</td>
                                        <td className="p-1 text-center">{formatCurrency(emp.variance.cash_assistance)}</td>
                                        <td className="p-1 text-center">
                                            {formatCurrency(emp.variance.ecola)}
                                        </td>
                                        <td className="p-1 text-center font-semibold text-red-600">
                                            {formatCurrency(emp.variance.total)}
                                        </td>
                                    </tr>
                                ))}


                                <tr className="font-bold border-t">
                                    <td className="text-center">TOTAL</td>
                                    <td className="text-center p-2">{formatCurrency(lessList.reduce((sum, e) => sum + e.variance.cash_assistance, 0))}</td>
                                    <td className="text-center p-2">{formatCurrency(lessList.reduce((sum, e) => sum + e.variance.ecola, 0))}</td>
                                    <td className="text-center p-2">{formatCurrency(lessList.reduce((sum, e) => sum + e.variance.total, 0))}</td>
                                </tr>
                            </tbody>

                        </table>
                    </div>

                </div>







            </div>

        </>
    );
}