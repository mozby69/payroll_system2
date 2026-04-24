import { useFetchViewAll } from "@/app/hooks/useAllowance";
import { LoanItem, ViewAllItem } from "@/app/types/allowanceType";
import { formatCurrency } from "@/app/utils/currencyConverter";
import { formatMonthYear } from "@/app/utils/DateFormatter";









interface Props {
    selectedMonth: string;
}


export default function ViewAllList({ selectedMonth }: Props) {

    const { data } = useFetchViewAll(selectedMonth);

    const boardMembers = data?.BOARD_MEMBER ?? [];
    const mancom = data?.MANCOM ?? [];
    const branches = data?.BRANCHES ?? {};
    const loans = data?.LOANS ?? [];
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

    //   const embBranches = branches["EMB"] ?? {};
    //   const embEmployees = Object.values(embBranches).flat();

    //   const embTotals = computeTotals(embEmployees);

    // const computeCompanyTotals = (company: string) => {
    //     const companyBranches = branches[company] ?? {};
    //     const employees = Object.values(companyBranches).flat();
    //     return computeTotals(employees);
    // };
    // const companies = Object.keys(branches);

    // const grandTotals = companies.reduce(
    //     (acc, company) => {
    //         const totals = computeCompanyTotals(company);
    //         acc.cash += totals.cash_allowance;
    //         acc.ecola += totals.computed_ecola;

    //         return acc;
    //     },
    //     { cash: 0, ecola: 0 }
    // );




    const varianceEmp = data?.VARIANCE_EMP ?? [];

    const addList = varianceEmp.filter(
        (item) => item.variance.action.type === "ADD"
    );

    const lessList = varianceEmp.filter(
        (item) => item.variance.action.type === "LESS"
    );

    // const addTotals = addList.reduce(
    //     (acc, e) => {
    //         acc.cash += e.variance.cash_assistance;
    //         acc.ecola += e.variance.ecola;
    //         acc.total += e.variance.total;
    //         return acc;
    //     },
    //     {
    //         cash: 0,
    //         ecola: 0,
    //         total: 0,
    //     }
    // );

    // const lessTotals = lessList.reduce(
    //     (acc, e) => {
    //         acc.cash += e.variance.cash_assistance;
    //         acc.ecola += e.variance.ecola;
    //         acc.total += e.variance.total;
    //         return acc;
    //     },
    //     {
    //         cash: 0,
    //         ecola: 0,
    //         total: 0,
    //     }
    // );


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
                                <th>LOANS</th>
                                <th>TOTAL DEDUCTIONS</th>
                                <th>NET TOTAL</th>
                            </tr>
                        </thead>

                        <tbody>
                            {boardMembers.map((emp, index) => (
                                <tr key={emp.EmpCode}>
                                    <td className="px-2">{index + 1}</td>
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
                                <td className="py-1" colSpan={2}>GRAND TOTAL</td>
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
                                <th></th>
                                <th className="py-2">MANCOM</th>
                                <th>CASH ASSISTANCE</th>
                                <th>ECOLA</th>
                                <th>ABSENCES</th>
                                <th>LOANS</th>
                                <th>TOTAL DEDUCTIONS</th>
                                <th>NET TOTAL</th>
                            </tr>
                        </thead>

                        <tbody>
                            {mancom.map((emp, index) => (
                                <tr key={emp.EmpCode}>
                                    <td className="px-2">{index + 1}</td>
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
                                <td className="py-1" colSpan={2}>GRAND TOTAL</td>
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
                    {Object.entries(branches).map(([company, branchGroup]) => (

                        <div key={company} className="mb-8">


                            <h2 className="font-bold text-lg uppercase mb-2">{company}</h2>

                            {Object.entries(branchGroup).map(([branch, employees], index, arr) => {
                                const branchTotals = computeTotals(employees);
                                const isLastBranch = index === arr.length - 1;

                                const companyEmployees = Object.values(branchGroup).flat();
                                const companyTotals = computeTotals(companyEmployees);

                                return (
                                    <div key={branch} className="mb-6">

                                        <table className="border-collapse w-full border border-gray-300 text-center">
                                            <thead>
                                                <tr className="bg-gray-300">
                                                    <th></th>
                                                    <th className="py-2">{branch}</th>
                                                    <th>CASH ASSISTANCE</th>
                                                    <th>ECOLA</th>
                                                    <th>ABSENCES</th>
                                                    <th>LOANS</th>
                                                    <th>TOTAL DEDUCTIONS</th>
                                                    <th>NET TOTAL</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {/* EMPLOYEES */}
                                                {employees.map((emp, index) => (
                                                    <tr key={emp.EmpCode} className="border-t">
                                                        <td className="px-2">{index + 1}</td>
                                                        <td className="py-1">{emp.name}</td>
                                                        <td>{emp.cash_allowance.toFixed(2)}</td>
                                                        <td>{emp.computed_ecola.toFixed(2)}</td>
                                                        <td>{emp.deduct.toFixed(2)}</td>
                                                        <td>{emp.fch_rfc_deducted.toFixed(2)}</td>
                                                        <td>{emp.totalDeduction.toFixed(2)}</td>
                                                        <td className="font-semibold">{emp.total.toFixed(2)}</td>
                                                    </tr>
                                                ))}

                                                {/* BRANCH TOTAL */}
                                                <tr className="border-t font-semibold bg-gray-100">
                                                    <td className="py-2" colSpan={2}>GRAND TOTAL</td>
                                                    <td>{formatCurrency(branchTotals.cash_allowance)}</td>
                                                    <td>{formatCurrency(branchTotals.computed_ecola)}</td>
                                                    <td>{formatCurrency(branchTotals.deduct)}</td>
                                                    <td>{formatCurrency(branchTotals.fch_rfc_deducted)}</td>
                                                    <td>{formatCurrency(branchTotals.totalDeduction)}</td>
                                                    <td>{formatCurrency(branchTotals.total)}</td>
                                                </tr>

                                                {/* EMB MAIN EXTRA */}
                                                {branch === "EMB-MAIN" && (
                                                    <>
                                                        <tr>
                                                            <td className="invisible p-2">d</td>
                                                        </tr>

                                                        <tr className="border-t font-semibold">
                                                            <td className="py-1">TOTAL MH</td>
                                                            <td>{formatCurrency(branchTotals.cash_allowance - branchTotals.totalDeduction)}</td>
                                                            <td>{formatCurrency(branchTotals.computed_ecola)}</td>
                                                            <td>
                                                                {formatCurrency(branchTotals.cash_allowance + branchTotals.computed_ecola - branchTotals.totalDeduction)}
                                                            </td>
                                                            <td colSpan={3}></td>
                                                        </tr>

                                                        <tr className="border-t font-semibold">
                                                            <td className="py-1">TOTAL BOARD & MANCOM</td>
                                                            <td>
                                                                {formatCurrency(
                                                                    mancomTotals.cash_allowance + boardTotals.cash_allowance - mancomTotals.totalDeduction
                                                                )}
                                                            </td>
                                                            <td>
                                                                {formatCurrency(
                                                                    mancomTotals.computed_ecola + boardTotals.computed_ecola
                                                                )}
                                                            </td>
                                                            <td>
                                                                {formatCurrency(
                                                                    mancomTotals.cash_allowance +
                                                                    boardTotals.cash_allowance +
                                                                    mancomTotals.computed_ecola +
                                                                    boardTotals.computed_ecola
                                                                    - mancomTotals.totalDeduction
                                                                )}
                                                            </td>
                                                            <td colSpan={3}></td>
                                                        </tr>

                                                        <tr className="font-semibold bg-gray-200">
                                                            <td className="py-1">TOTAL</td>
                                                            <td>
                                                                {formatCurrency(boardTotals.cash_allowance + (mancomTotals.cash_allowance - mancomTotals.totalDeduction) + (branchTotals.cash_allowance - branchTotals.totalDeduction))}
                                                            </td>
                                                            <td>
                                                                {formatCurrency(
                                                                    branchTotals.computed_ecola +
                                                                    mancomTotals.computed_ecola +
                                                                    boardTotals.computed_ecola
                                                                )}
                                                            </td>
                                                            <td>
                                                                {formatCurrency(

                                                                    (branchTotals.cash_allowance - branchTotals.totalDeduction) +
                                                                    branchTotals.computed_ecola +
                                                                    (mancomTotals.cash_allowance - mancomTotals.totalDeduction) +
                                                                    mancomTotals.computed_ecola +
                                                                    boardTotals.cash_allowance +
                                                                    boardTotals.computed_ecola

                                                                )}
                                                            </td>
                                                            <td colSpan={4}></td>
                                                        </tr>
                                                    </>
                                                )}


                                                {company === "EMB" && isLastBranch && (
                                                    <>
                                                        <tr>
                                                            <td className="invisible">s</td>
                                                        </tr>

                                                        <tr className="bg-yellow-200 font-bold border-t-2">
                                                            <td className="py-2" colSpan={2}>TOTAL EMB</td>

                                                            <td className="text-center">
                                                                {formatCurrency(companyTotals.cash_allowance)}
                                                            </td>

                                                            <td className="text-center">
                                                                {formatCurrency(companyTotals.computed_ecola)}
                                                            </td>
                                                                 <td colSpan={3}></td>

                                                            <td className="text-center">
                                                                {formatCurrency(
                                                                    companyTotals.cash_allowance +
                                                                    companyTotals.computed_ecola
                                                                )}
                                                            </td>

                                                       
                                                        </tr>
                                                    </>
                                                )}

                                                {company === "FCH" && isLastBranch && (
                                                    <>
                                                        <tr>
                                                            <td className="invisible">s</td>
                                                        </tr>

                                                        <tr className="bg-yellow-200 font-bold border-t-2">
                                                            <td className="py-2" colSpan={2}>TOTAL FCH</td>

                                                            <td className="text-center">
                                                                {formatCurrency(companyTotals.cash_allowance)}
                                                            </td>

                                                            <td className="text-center">
                                                                {formatCurrency(companyTotals.computed_ecola)}
                                                            </td>

                                                            <td colSpan={3}></td>

                                                            <td className="text-center">
                                                                {formatCurrency(
                                                                    companyTotals.cash_allowance +
                                                                    companyTotals.computed_ecola
                                                                )}
                                                            </td>

                                                       
                                                        </tr>
                                                    </>
                                                )}


                                                {company === "ELC" && isLastBranch && (
                                                    <>
                                                        <tr>
                                                            <td className="invisible">s</td>
                                                        </tr>

                                                        <tr className="bg-yellow-200 font-bold border-t-2">
                                                            <td className="py-2" colSpan={2}>TOTAL ELC</td>

                                                            <td className="text-center">
                                                                {formatCurrency(companyTotals.cash_allowance)}
                                                            </td>

                                                            <td className="text-center">
                                                                {formatCurrency(companyTotals.computed_ecola)}
                                                            </td>


                                                            <td colSpan={3}></td>

                                                            <td className="text-center">
                                                                {formatCurrency(
                                                                    companyTotals.cash_allowance +
                                                                    companyTotals.computed_ecola
                                                                )}
                                                            </td>

                                                   
                                                        </tr>
                                                    </>
                                                )}

                                                {company === "PSPMI" && isLastBranch && (
                                                    <>
                                                        <tr>
                                                            <td className="invisible">s</td>
                                                        </tr>

                                                        <tr className="bg-yellow-200 font-bold border-t-2">
                                                            <td className="py-2" colSpan={2}>TOTAL PSPMI</td>

                                                            <td className="text-center">
                                                                {formatCurrency(companyTotals.cash_allowance)}
                                                            </td>

                                                            <td className="text-center">
                                                                {formatCurrency(companyTotals.computed_ecola)}
                                                            </td>

                                                            <td colSpan={3}></td>

                                                            <td className="text-center">
                                                                {formatCurrency(
                                                                    companyTotals.cash_allowance +
                                                                    companyTotals.computed_ecola
                                                                )}
                                                            </td>

                                                  
                                                        </tr>
                                                    </>
                                                )}






                                            </tbody>
                                        </table>

                                    </div>
                                );
                            })}
                        </div>
                    ))}
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
                                <td className="p-2 border border-gray-200">{formatCurrency(company.total_cash_allowance + company.ecola)}</td>
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

                                <td>
                                    {formatCurrency(
                                    total_per_company.reduce(
                                        (sum, [, c]) => sum + c.total_cash_allowance + c.ecola,
                                        0
                                    )
                                    )}
                                </td>
                                </tr>
                            </tbody>
                    </table>
                </div>


                <div className="mt-4">
                    <h2 className="font-semibold text-lg">LOANS</h2>
                    <div className="pt-2">
                        <table className="border-collapse w-12/12 border border-gray-300 text-left">
                            <thead>
                                <tr className="bg-gray-300 uppercase">
                                    <th className="p-2">NAME</th>
                                    <th className="p-2">Branch</th>
                                    <th className="p-2">Deduction</th>


                                </tr>
                            </thead>

                            <tbody>
                                {loans.map((emp) => (
                                    <tr key={emp.EmpCode}>
                                        <td className="py-1 px-2 border border-gray-300">{emp.Lastname}, {emp.Firstname}</td>
                                        <td className="px-2 border border-gray-300">{emp.BranchCodeId}</td>
                                        <td className="py-1 px-2 border border-gray-300">{emp.per_payroll_deduct}</td>

                                    </tr>
                                ))}
                                <tr className="bg-gray-200 font-bold">
                                    <td className="py-1 px-2 border border-gray-300" colSpan={2}>GRAND TOTAL</td>
                                    <td className="py-1 px-2 border border-gray-300">{formatCurrency(loanTotals)}</td>

                                </tr>
                            </tbody>
                        </table>
                    </div>
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