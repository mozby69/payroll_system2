import { useFetchArchiveAllowanceModal } from "@/app/hooks/useAllowance";
import { AllowanceSummary, ArchiveAllowance, CompanyItem, loanlistProps, VarianceAllowanceComplete, VarianceAllowanceEmployee, ViewAllItem } from "@/app/types/allowanceType";
import { prepareCompanyData } from "@/app/utils/allowanceHelper";
import { formatAmount, formatCurrency } from "@/app/utils/currencyConverter";
import { formatMonthYear } from "@/app/utils/DateFormatter";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";








interface ViewEmployeeListAllowanceProps {
    allowanceSummary: AllowanceSummary;
    onClose: () => void;
}


export default function AllowanceReportArchive({ allowanceSummary }: ViewEmployeeListAllowanceProps) {
    const { data } = useFetchArchiveAllowanceModal(allowanceSummary.selectedMonth);
    const archive = data?.data;


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

    const boardMembers = archive?.BOARD_MEMBER ?? [];

    const mancom = archive?.MANCOM ?? [];

    const mh = archive?.MH ?? [];

    const mhTotals =
        archive?.mh_totals;

    const boardMancomTotals =
        archive?.board_mancom_totals;

    const totalMhBoardMancom =
        archive?.total_mh_boardmancom;

    const mhMancomLoans =
        archive?.mh_mancom_loans ?? [];

    const totalMhAndMancomLoans =
        Number(
            archive?.totalmhAndMancomLoans ?? 0
        );

    const totalDisburse =
        archive?.total_disburse;

    const branches =
        archive?.BRANCHES ?? {};

    const variance = archive?.VARIANCE;

    const varianceEmployee =
        archive?.VARIANCE_EMP;

    const totalPerCompany =
        Object.entries(
            archive?.TOTAL_PER_COMPANY ?? {}
        );

    const finalVariance =
        archive?.FINAL_VARIANCE;


    const previous = variance?.previous;
    const current = variance?.current;
    const varianceRow = variance?.variance;

    const addList =
        varianceEmployee?.ADD ?? [];

    const lessList =
        varianceEmployee?.LESS ?? [];

    const finalCashVariance =
        finalVariance?.final_ca_variance ?? 0;

    const finalEcolaVariance =
        finalVariance?.final_ecola_variance ?? 0;

    const finalTotalVariance =
        finalVariance?.final_total_variance ?? 0;




    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: "conversion report",
        pageStyle: `
        @page {
          size: A4;
          margin: 10mm;
        }
        body {
          -webkit-print-color-adjust: exact;
        }
      `,
    });


    const boardList = boardMembers;
    const mancomList = mancom;
    const mhList = mh;

    const boardTotals = computeTotals(boardMembers);
    const mancomTotals = computeTotals(mancom);
    const mhTotals2 = computeTotals(mh);

    return (
        <div className="p-2 print-deductions print:bg-white print:shadow-none print:p-2" ref={printRef}>

            <div className="font-semibold space-y-1 uppercase">
                <h2>JAMERO GROUP OF COMPANIES</h2>
                <h2>CASH ASSITANCE & ECOLA</h2>
                <h2>FOR THE MONTH OF {allowanceSummary.allowance_name} </h2>
            </div>

            <div className="pt-4">
                <div className="flex justify-between py-2">
                    <h2 className="py-1 font-semibold text-lg">BOARD</h2>
                    <button onClick={handlePrint} className="bg-blue-800 px-6 py-2 text-white rounded mb-2 font-semibold shadow hover:bg-blue-600 print:hidden">Print</button>
                </div>

                <table className="w-full border border-slate-200 rounded-md shadow">
                    <thead>
                        <tr className="bg-slate-100 uppercase">

                            <th className="p-2 text-center">BOARD</th>
                            <th className="p-2 text-center">Branch</th>
                            <th className="p-2 text-center">Cash Assistance</th>
                            <th className="p-2 text-center">Ecola</th>
                            <th className="p-2 text-center" colSpan={3}>Absences</th>

                            {/* {isEmergency && <th className="p-2 text-cetnter">Emergency Allowance</th>} */}
                            <th className="p-2 text-center">Total Net</th>
                        </tr>
                    </thead>
                    <tbody>
                        {boardList.map((employee, index) => (
                            <tr key={employee.EmpCode}>
                                <td className="border border-gray-300 p-1 text-center">
                                    {index + 1}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {employee.name}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {formatAmount(
                                        employee.cash_allowance
                                    )}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {formatAmount(
                                        employee.computed_ecola
                                    )}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {formatAmount(
                                        employee.absent_cash_assistance
                                    )}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {formatAmount(
                                        employee.absent_ecola
                                    )}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {formatAmount(employee.deduct)}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {formatAmount(employee.total)}
                                </td>
                            </tr>
                        ))}
                        <tr className="border-t border-gray-400 font-semibold bg-gray-100">
                            <td className="py-1 text-center" colSpan={2}>GRAND TOTAL</td>
                            <td className="text-center">{formatCurrency(boardTotals.cash_allowance)}</td>
                            <td className="text-center">{formatCurrency(boardTotals.computed_ecola)}</td>
                            <td></td>
                            <td></td>
                            <td className="text-center">{formatCurrency(boardTotals.deduct)}</td>
                            {/* {isEmergency && <td className="text-center">{formatCurrency(boardTotals.emergency_allowance_amount)}</td>} */}
                            <td className="text-center">{formatCurrency(boardTotals.total)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>




            {/* MANCOM */}

            <div className="pt-4">
                <h2 className="py-1 font-semibold text-lg">MANCOM</h2>
                <table className="w-full border border-slate-200 rounded-md shadow">
                    <thead>
                        <tr className="bg-slate-100 uppercase">
                            <th className="p-2 text-center">Name</th>
                            <th className="p-2 text-center">Branch</th>
                            <th className="p-2 text-center">Cash Assistance</th>
                            <th className="p-2 text-center">Ecola</th>
                            <th className="p-2 text-center" colSpan={3}>Absences</th>

                            {/* {isEmergency && <th className="p-2 text-center">Emergency Allowance</th>} */}
                            <th className="p-2 text-center">Total Net</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mancomList.map((employee, index) => (
                            <tr key={employee.EmpCode}>
                                <td className="border border-gray-300 p-1 text-center">
                                    {index + 1}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {employee.name}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {formatAmount(
                                        employee.cash_allowance
                                    )}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {formatAmount(
                                        employee.computed_ecola
                                    )}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {formatAmount(
                                        employee.absent_cash_assistance
                                    )}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {formatAmount(
                                        employee.absent_ecola
                                    )}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {formatAmount(employee.deduct)}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {formatAmount(employee.total)}
                                </td>
                            </tr>
                        ))}
                        <tr className="border-t border-gray-400 font-semibold bg-gray-100">
                            <td className="py-1 text-center" colSpan={2}>GRAND TOTAL</td>
                            <td className="text-center">{formatCurrency(mancomTotals.cash_allowance)}</td>
                            <td className="text-center">{formatCurrency(mancomTotals.computed_ecola)}</td>
                            <td></td>
                            <td></td>
                            <td className="text-center">{formatCurrency(mancomTotals.deduct)}</td>
                            {/* {isEmergency && <td className="p-1 border border-gray-300 text-center">{formatCurrency(mancomTotals.emergency_allowance_amount)}</td>} */}
                            <td className="text-center">{formatCurrency(mancomTotals.total)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>





            <div className="pt-4">
                <h2 className="py-1 font-semibold text-lg">MAIN BRANCH</h2>
                <table className="w-full border border-slate-200 rounded-md shadow">
                    <thead>
                        <tr className="bg-slate-100 uppercase">
                            <th className="p-2 text-center border border-gray-300">Name</th>
                            <th className="p-2 text-center border border-gray-300">Branch</th>
                            <th className="p-2 text-center border border-gray-300">Cash Assistance</th>
                            <th className="p-2 text-center border border-gray-300">Ecola</th>
                            <th className="p-2 text-center border border-gray-300" colSpan={3}>Absences</th>
                            {/* {isEmergency && <th className="p-2 text-center">Emergency Allowance</th>} */}
                            <th className="p-2 text-center border border-gray-300">Total Net</th>
                        </tr>
                    </thead>

                    <tbody>
                        {mhList.map((employee, index) => (
                            <tr key={employee.EmpCode}>
                                <td className="border border-gray-300 p-1 text-center">
                                    {index + 1}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {employee.name}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {formatAmount(
                                        employee.cash_allowance
                                    )}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {formatAmount(
                                        employee.computed_ecola
                                    )}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {formatAmount(
                                        employee.absent_cash_assistance
                                    )}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {formatAmount(
                                        employee.absent_ecola
                                    )}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {formatAmount(employee.deduct)}
                                </td>

                                <td className="border border-gray-300 p-1 text-center">
                                    {formatAmount(employee.total)}
                                </td>
                            </tr>
                        ))}

                        <tr className="border-t border-gray-400 font-semibold bg-gray-100">
                            <td colSpan={2} className="text-center p-1">GRAND TOTAL</td>
                            <td className="text-center">{formatCurrency(mhTotals2.cash_allowance)}</td>
                            <td className="text-center">{formatCurrency(mhTotals2.computed_ecola)}</td>
                            <td className="text-center"></td>
                            <td className="text-center"></td>
                            <td className="text-center">{formatCurrency(mhTotals2.totalDeduction)}</td>
                            {/* {isEmergency && <td className="text-center">{formatCurrency(embMainTotals.emergency_allowance_amount)}</td>} */}
                            <td className="text-center">{formatCurrency(mhTotals2.total)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>



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
                        {mhTotals && (
                            <tr className="border border-gray-300">
                                <td className="py-1 font-bold">TOTAL MH</td>
                                <td>{formatCurrency(mhTotals.cash_allowance)}</td>
                                <td>{formatCurrency(mhTotals.computed_ecola)}</td>
                                <td>{formatCurrency(mhTotals.total)}</td>
                            </tr>
                        )}
                        {boardMancomTotals && (
                            <tr className="border border-gray-300">
                                <td className="py-1 font-bold">TOTAL BOARD & MANCOM</td>
                                <td>{formatCurrency(boardMancomTotals.cash_allowance)}</td>
                                <td>{formatCurrency(boardMancomTotals.computed_ecola)}</td>
                                <td>{formatCurrency(boardMancomTotals.total)}</td>
                            </tr>
                        )}
                        {totalMhBoardMancom && (
                            <tr className="border border-gray-300">
                                <td className="py-1 font-bold">TOTAL</td>
                                <td>{formatCurrency(totalMhBoardMancom.cash_allowance)}</td>
                                <td>{formatCurrency(totalMhBoardMancom.computed_ecola)}</td>
                                <td>{formatCurrency(totalMhBoardMancom.total)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>

            </div>


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
                        {mhMancomLoans.map((emp, index) => (
                            <tr key={index} className="border border-gray-300">
                                <td className="py-1">Less: A/RE- {emp.Lastname},{emp.Firstname}</td>
                                <td>{formatAmount(emp.per_payroll_deduct)}</td>
                                <td>{emp.loan_type}, {emp.others_types}</td>
                            </tr>
                        ))}
                        <tr>
                            <td className="py-1 font-bold">TOTAL</td>
                            <td className="font-bold">{formatCurrency(data?.data?.totalmhAndMancomLoans)}</td>
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

                        {totalDisburse && (
                            <tr className="border border-gray-300">
                                <td className="py-1 font-bold">TOTAL DISBURSE</td>
                                <td>{formatAmount(totalDisburse?.cash_allowance)}</td>
                                <td>{formatAmount(totalDisburse?.computed_ecola)}</td>
                                <td>{formatAmount(totalDisburse?.total)}</td>
                            </tr>
                        )}


                    </tbody>
                </table>

            </div>







            {/* BRANCHES LIST */}
            {Object.entries(data?.data?.BRANCHES ?? {})
                .sort(
                    ([, companyA], [, companyB]) =>
                        Number(companyA.position ?? 999) -
                        Number(companyB.position ?? 999)
                )
                .map(([companyName, company]) => (
                    <div key={companyName} className="mb-8 mt-4">
                        <h2 className="mb-2 text-lg font-bold">
                            {companyName}
                        </h2>

                        {Object.entries(company.branches ?? {})
                            .sort(
                                ([, branchA], [, branchB]) =>
                                    Number(branchA.position ?? 999) -
                                    Number(branchB.position ?? 999)
                            )
                            .map(([branchName, branch]) => (
                                <table
                                    key={branchName}
                                    className="mb-6 w-full border-collapse text-sm"
                                >
                                    <thead>
                                        <tr className="bg-gray-200 font-bold">
                                            <th className="w-12 border p-2">
                                                #
                                            </th>

                                            <th className="border p-2 text-left">
                                                BRANCH: {branchName}
                                            </th>

                                            <th className="border p-2">
                                                CASH ASSISTANCE
                                            </th>

                                            <th className="border p-2">
                                                ECOLA
                                            </th>

                                            <th
                                                className="border p-2"
                                                colSpan={3}
                                            >
                                                ABSENT
                                            </th>

                                            <th className="border p-2">
                                                TOTAL
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {(branch.employees ?? []).map(
                                            (employee, index) => (
                                                <tr key={employee.EmpCode}>
                                                    <td className="border p-2 text-center">
                                                        {index + 1}
                                                    </td>

                                                    <td className="border p-2">
                                                        {employee.name}
                                                    </td>

                                                    <td className="border p-2 text-right">
                                                        {formatAmount(
                                                            employee.cash_allowance
                                                        )}
                                                    </td>

                                                    <td className="border p-2 text-right">
                                                        {formatAmount(
                                                            employee.computed_ecola
                                                        )}
                                                    </td>

                                                    <td className="border p-2 text-right">
                                                        {formatAmount(
                                                            employee.absent_cash_assistance
                                                        )}
                                                    </td>

                                                    <td className="border p-2 text-right">
                                                        {formatAmount(
                                                            employee.absent_ecola
                                                        )}
                                                    </td>

                                                    <td className="border p-2 text-right">
                                                        {formatAmount(
                                                            employee.deduct
                                                        )}
                                                    </td>

                                                    <td className="border p-2 text-right">
                                                        {formatAmount(
                                                            employee.total
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )}

                                        <tr className="bg-gray-100 font-bold">
                                            <td
                                                colSpan={2}
                                                className="border p-2 text-right"
                                            >
                                                BRANCH TOTAL
                                            </td>

                                            <td className="border p-2 text-right">
                                                {formatAmount(
                                                    branch.totals?.cash_allowance
                                                )}
                                            </td>

                                            <td className="border p-2 text-right">
                                                {formatAmount(
                                                    branch.totals?.computed_ecola
                                                )}
                                            </td>

                                            <td className="border p-2" />
                                            <td className="border p-2" />

                                            <td className="border p-2 text-right">
                                                {formatAmount(
                                                    branch.totals?.deduct
                                                )}
                                            </td>

                                            <td className="border p-2 text-right">
                                                {formatAmount(
                                                    branch.totals?.total
                                                )}
                                            </td>
                                        </tr>

                                        {(branch.loans ?? []).length > 0 && (
                                            <>
                                                <tr className="bg-slate-100 font-semibold">
                                                    <td
                                                        colSpan={8}
                                                        className="border border-slate-300 px-3 py-2 text-left"
                                                    >
                                                        LOAN DEDUCTIONS
                                                    </td>
                                                </tr>

                                                {(branch.loans ?? []).map(
                                                    (loan, index) => (
                                                        <tr
                                                            key={`${loan.EmpCode}-${loan.loan_type}-${index}`}
                                                        >
                                                            <td className="border border-slate-300 px-3 py-2 text-center">
                                                                {index + 1}
                                                            </td>

                                                            <td className="border border-slate-300 px-3 py-2">
                                                                {loan.Lastname},{" "}
                                                                {loan.Firstname}
                                                            </td>

                                                            <td className="border border-slate-300 px-3 py-2 text-right">
                                                                {formatAmount(
                                                                    loan.per_payroll_deduct
                                                                )}
                                                            </td>

                                                            <td
                                                                colSpan={5}
                                                                className="border border-slate-300 px-3 py-2"
                                                            >
                                                                {loan.loan_type}
                                                                {loan.others_types
                                                                    ? `, ${loan.others_types}`
                                                                    : ""}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}

                                                <tr className="font-semibold">
                                                    <td
                                                        colSpan={2}
                                                        className="border border-slate-300 px-3 py-2 text-right"
                                                    >
                                                        TOTAL LOAN DEDUCTION
                                                    </td>

                                                    <td className="border border-slate-300 px-3 py-2 text-right">
                                                        {formatAmount(
                                                            branch.total_loans
                                                        )}
                                                    </td>

                                                    <td
                                                        colSpan={5}
                                                        className="border border-slate-300"
                                                    />
                                                </tr>

                                                <tr className="bg-slate-100 font-bold">
                                                    <td
                                                        colSpan={2}
                                                        className="border border-slate-400 px-3 py-2 text-right"
                                                    >
                                                        TOTAL DISBURSEMENT
                                                    </td>

                                                    <td className="border border-slate-400 px-3 py-2 text-right">
                                                        {formatAmount(
                                                            branch.disbursement
                                                                ?.cash_allowance
                                                        )}
                                                    </td>

                                                    <td className="border border-slate-400 px-3 py-2 text-right">
                                                        {formatAmount(
                                                            branch.disbursement
                                                                ?.computed_ecola
                                                        )}
                                                    </td>

                                                    <td className="border border-slate-400" />
                                                    <td className="border border-slate-400" />

                                                    <td className="border border-slate-400 px-3 py-2 text-right">
                                                        {formatAmount(
                                                            branch.disbursement?.deduct
                                                        )}
                                                    </td>

                                                    <td className="border border-slate-400 px-3 py-2 text-right">
                                                        {formatAmount(
                                                            branch.disbursement?.total
                                                        )}
                                                    </td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            ))}

                        <table className="w-full border-collapse text-sm">
                            <tbody>
                                <tr className="bg-gray-300 font-bold">
                                    <td
                                        colSpan={2}
                                        className="border p-2 text-right"
                                    >
                                        {companyName} GRAND TOTAL
                                    </td>

                                    <td className="border p-2 text-right">
                                        {formatAmount(
                                            company.grand_total
                                                ?.cash_allowance
                                        )}
                                    </td>

                                    <td className="border p-2 text-right">
                                        {formatAmount(
                                            company.grand_total
                                                ?.computed_ecola
                                        )}
                                    </td>

                                    <td className="border p-2" />
                                    <td className="border p-2" />

                                    <td className="border p-2 text-right">
                                        {formatAmount(
                                            company.grand_total?.deduct
                                        )}
                                    </td>

                                    <td className="border p-2 text-right">
                                        {formatAmount(
                                            company.grand_total?.total
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ))}



            <div className="pt-4">
                    <table className="border-collapse w-12/12 border border-gray-300 text-center">
                        <thead>
                            <tr className="bg-gray-300">
                                <th></th>
                                <th className="py-2">COMPANY</th>
                                <th>CASH ASSISTANCE</th>
                                <th>ECOLA</th>
                                {/* {showEmergency && <th>EMERGENCY ALLOWANCE</th>} */}
                                <th>NET TOTAL</th>
                            </tr>
                        </thead>

                        <tbody>
                            {totalPerCompany.map(([companyCode, company], index) => (
                                <tr key={companyCode}>
                                    <td className="p-2 border border-gray-200">{index + 1}</td>
                                    <td className="p-2 border border-gray-200">{companyCode}</td>
                                    <td className="p-2 border border-gray-200">{formatCurrency(company.total_cash_allowance)}</td>
                                    <td className="p-2 border border-gray-200">{formatCurrency(company.ecola)}</td>
                                    {/* {showEmergency && <td className="p-2 border border-gray-200">{formatCurrency(company.emergency_allowance_amount)}</td>} */}
                                    <td className="p-2 border border-gray-200">{formatCurrency(company.total_cash_allowance + company.ecola + company.emergency_allowance_amount)}</td>
                                </tr>
                            ))}

                            <tr className="border-t font-semibold bg-gray-100">
                                <td colSpan={2} className="p-2">GRAND TOTAL</td>
                                <td>
                                    {formatCurrency(
                                        totalPerCompany.reduce(
                                            (sum, [, c]) => sum + c.total_cash_allowance,
                                            0
                                        )
                                    )}
                                </td>

                                <td>
                                    {formatCurrency(
                                        totalPerCompany.reduce(
                                            (sum, [, c]) => sum + c.ecola,
                                            0
                                        )
                                    )}
                                </td>
                                {/* {showEmergency &&
                                    <td>
                                        {formatCurrency(
                                            total_per_company.reduce(
                                                (sum, [, c]) => sum + c.emergency_allowance_amount,
                                                0
                                            )
                                        )}
                                    </td>
                                } */}

                                <td>
                                    {formatCurrency(
                                        totalPerCompany.reduce(
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
                            <h2 className="uppercase">{formatMonthYear(previous?.selectedMonth ?? "")}</h2>
                            <h2>{formatCurrency(previous?.cash_assistance ?? 0)}</h2>
                            <h2>{formatCurrency(previous?.ecola ?? 0)}</h2>
                            <h2>{formatCurrency(previous?.grand_total ?? 0)}</h2>
                        </div>


                        <div className="grid grid-cols-4">
                            <h2 className="uppercase">
                                {formatMonthYear(current?.selectedMonth ?? "")}
                            </h2>
                            <h2>{formatCurrency(current?.cash_assistance ?? 0)}</h2>
                            <h2>{formatCurrency(current?.ecola ?? 0)}</h2>
                            <h2>{formatCurrency(current?.grand_total ?? 0)}</h2>
                        </div>


                        <div className="grid grid-cols-4">
                            <h2 className="font-semibold border-t pt-2">VARIANCE</h2>

                            <h2 className="border-t pt-2">
                                {formatCurrency(varianceRow?.cash_assistance ?? 0)}
                            </h2>

                            <h2 className="border-t pt-2">
                                {formatCurrency(varianceRow?.ecola ?? 0)}
                            </h2>

                            <h2 className="border-t pt-2">
                                {formatCurrency(varianceRow?.grand_total ?? 0)}
                            </h2>
                        </div>

                    </div>
                </div>








 {/* variance per employee  */}
                <div className="pt-8">
                    <div>
                        <h2 className="bg-blue-500 p-2 font-semibold text-white">
                            ADD
                        </h2>

                        <table className="w-full table-fixed border-collapse">
                            <colgroup>
                                <col className="w-[24%]" />
                                <col className="w-[18%]" />
                                <col className="w-[10%]" />
                                <col className="w-[12%]" />
                                <col className="w-[36%]" />
                            </colgroup>

                            <thead>
                                <tr>
                                    <th className="border border-gray-300 px-1 py-2">
                                        EMPLOYEE
                                    </th>

                                    <th className="border border-gray-300 px-1 py-2">
                                        CASH ASSISTANCE
                                    </th>

                                    <th className="border border-gray-300 px-1 py-2">
                                        ECOLA
                                    </th>

                                    <th className="border border-gray-300 px-1 py-2">
                                        TOTAL
                                    </th>

                                    <th className="border border-gray-300 px-1 py-2">
                                        REMARKS
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {addList.map((emp) => (
                                    <tr
                                        key={emp.EmpCode}
                                        className="border border-gray-300"
                                    >
                                        <td className="p-1 text-center">
                                            {emp.name}
                                        </td>

                                        <td className="p-1 text-center">
                                            {formatCurrency(
                                                emp.cash_assistance_variance
                                            )}
                                        </td>

                                        <td className="p-1 text-center">
                                            {formatCurrency(emp.ecola_variance)}
                                        </td>

                                        <td className="p-1 text-center font-semibold">
                                            {formatCurrency(
                                                emp.cash_assistance_variance +
                                                emp.ecola_variance
                                            )}
                                        </td>

                                        <td className="wrap-break whitespace-normal p-2 text-center text-xs font-bold lowercase">
                                            {emp.reasons.join(", ")}
                                        </td>
                                    </tr>
                                ))}

                                <tr className="border-t border-gray-300 font-bold">
                                    <td className="p-2 text-center">
                                        TOTAL
                                    </td>

                                    <td className="p-2 text-center">
                                        {formatCurrency(
                                            addList.reduce(
                                                (sum, employee) =>
                                                    sum +
                                                    employee.cash_assistance_variance,
                                                0
                                            )
                                        )}
                                    </td>

                                    <td className="p-2 text-center">
                                        {formatCurrency(
                                            addList.reduce(
                                                (sum, employee) =>
                                                    sum + employee.ecola_variance,
                                                0
                                            )
                                        )}
                                    </td>

                                    <td className="p-2 text-center">
                                        {formatCurrency(
                                            addList.reduce(
                                                (sum, employee) =>
                                                    sum +
                                                    employee.cash_assistance_variance +
                                                    employee.ecola_variance,
                                                0
                                            )
                                        )}
                                    </td>

                                    <td className="p-2" />
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-2">
                        <h2 className="bg-yellow-700 p-2 font-semibold text-white">
                            LESS
                        </h2>

                        <table className="w-full table-fixed border-collapse">
                            <colgroup>
                                <col className="w-[24%]" />
                                <col className="w-[18%]" />
                                <col className="w-[10%]" />
                                <col className="w-[12%]" />
                                <col className="w-[36%]" />
                            </colgroup>

                            <thead>
                                <tr>
                                    <th className="border border-gray-300 px-1 py-2">
                                        EMPLOYEE
                                    </th>

                                    <th className="border border-gray-300 px-1 py-2">
                                        CASH ASSISTANCE
                                    </th>

                                    <th className="border border-gray-300 px-1 py-2">
                                        ECOLA
                                    </th>

                                    <th className="border border-gray-300 px-1 py-2">
                                        TOTAL
                                    </th>

                                    <th className="border border-gray-300 px-1 py-2">
                                        REMARKS
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {lessList.map((emp) => (
                                    <tr
                                        key={emp.EmpCode}
                                        className="border border-gray-300"
                                    >
                                        <td className="p-1 text-center">
                                            {emp.name}
                                        </td>

                                        <td className="p-1 text-center">
                                            {formatCurrency(
                                                emp.cash_assistance_variance
                                            )}
                                        </td>

                                        <td className="p-1 text-center">
                                            {formatCurrency(emp.ecola_variance)}
                                        </td>

                                        <td className="p-1 text-center font-semibold text-red-600">
                                            {formatCurrency(
                                                emp.cash_assistance_variance +
                                                emp.ecola_variance
                                            )}
                                        </td>

                                        <td className="wrap-break whitespace-normal p-2 text-center text-xs font-bold lowercase">
                                            {emp.reasons.join(", ")}
                                        </td>
                                    </tr>
                                ))}

                                <tr className="border-t border-gray-300 font-bold">
                                    <td className="p-2 text-center">
                                        TOTAL
                                    </td>

                                    <td className="p-2 text-center">
                                        {formatCurrency(
                                            lessList.reduce(
                                                (sum, employee) =>
                                                    sum +
                                                    employee.cash_assistance_variance,
                                                0
                                            )
                                        )}
                                    </td>

                                    <td className="p-2 text-center">
                                        {formatCurrency(
                                            lessList.reduce(
                                                (sum, employee) =>
                                                    sum + employee.ecola_variance,
                                                0
                                            )
                                        )}
                                    </td>

                                    <td className="p-2 text-center">
                                        {formatCurrency(
                                            lessList.reduce(
                                                (sum, employee) =>
                                                    sum +
                                                    employee.cash_assistance_variance +
                                                    employee.ecola_variance,
                                                0
                                            )
                                        )}
                                    </td>

                                    <td className="p-2" />
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FINAL VARIANCE */}
                <div className="pt-4 px-2">
                    <div>
                        <h2 className="font-bold mb-2">VARIANCE</h2>
                    </div>

                    <div>
                        <table className="w-full table-fixed border-collapse">
                            <thead>
                                <tr>
                                    <th className="border border-gray-300 px-1 py-2 invisible">s</th>
                                    <th className="border border-gray-300 px-1 py-2">CASH ASSITANCE VARIANCE</th>
                                    <th className="border border-gray-300 px-1 py-2">ECOLA VARIANCE</th>
                                    <th className="border border-gray-300 px-1 py-2">TOTAL VARIANCE</th>

                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 px-1 py-2 text-center"></td>
                                    <td className="border border-gray-300 px-1 py-2 text-center">
                                       {formatCurrency(finalCashVariance)}
                                    </td>
                                    <td className="border border-gray-300 px-1 py-2 text-center">
                                        {formatCurrency(finalEcolaVariance)}
                                    </td>
                                    <td className="border border-gray-300 px-1 py-2 text-center">
                                        {formatCurrency(finalTotalVariance)}
                                    </td>
                                </tr>
                            </tbody>

                        </table>
                    </div>
                </div>






        </div>



    );
}


