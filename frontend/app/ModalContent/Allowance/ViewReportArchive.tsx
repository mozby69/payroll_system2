import { useFetchArchiveAllowanceModal } from "@/app/hooks/useAllowance";
import { AllowanceSummary, ArchiveAllowance, CompanyItem,loanlistProps, VarianceAllowanceComplete, VarianceAllowanceEmployee } from "@/app/types/allowanceType";
import { prepareCompanyData } from "@/app/utils/allowanceHelper";
import { formatCurrency } from "@/app/utils/currencyConverter";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";








interface ViewEmployeeListAllowanceProps {
    allowanceSummary: AllowanceSummary;
    onClose: () => void;
}


export default function AllowanceReportArchive({ allowanceSummary }: ViewEmployeeListAllowanceProps) {
    const { data } = useFetchArchiveAllowanceModal(allowanceSummary.selectedMonth);

    const list = data?.data?.list ?? [];

    const companyList = data?.data?.details?.company_list ?? {};
    const loanList = data?.data?.details?.loans ?? {};
    const isEmergency = list.some( (item) => item.is_emergency === true);


    const loanTotal = Object.values(loanList as Record<string, loanlistProps>)
    .reduce((acc, item) => acc + (item.per_payroll_deduct ?? 0), 0);


    const companyTotal = Object.values(companyList as Record<string, CompanyItem>)
    .reduce(
        (acc, item) => {
        acc.cash += item.total_cash_allowance ?? 0;
        acc.ecola += item.ecola ?? 0;
        acc.emergency_allowance_amount += item.emergency_allowance_amount ?? 0;
        return acc;
        },
        {
        cash: 0,
        ecola: 0,
        emergency_allowance_amount: 0,
        }
    );

    const variance = data?.data?.details?.variance_allowance as VarianceAllowanceComplete | undefined;
    const previous = variance?.previous;
    const current = variance?.current;
    const varianceRow = variance?.variance;

    //variance employee 
    const variance_emp = data?.data?.details?.variance_employee as VarianceAllowanceEmployee[] | undefined;

    const addList = variance_emp?.filter((emp) => emp.variance?.action?.type === "ADD") ?? [];
    const lessList = variance_emp?.filter((emp) => emp.variance?.action?.type === "LESS") ?? [];

    const addTotals = addList.reduce(
        (acc, emp) => {
            acc.cash += emp.variance.cash_assistance ?? 0;
            acc.ecola += emp.variance.ecola ?? 0;
            acc.total += emp.variance.total ?? 0;
            return acc;
        },
        {
            cash: 0,
            ecola: 0,
            total: 0,
        }
        );

    const boardList = list.filter((row) => row.position === "board");
    const mancomList = list.filter((row) => row.position === "Mancom");
    const embMainList = list.filter((row) => row.branchCode === "EMB-MAIN" && row.position !== "board" && row.position !== "Mancom");
    const m2List = list.filter((row) => row.position === "M2");

    // const embList = list.filter(
    //             (r) =>
    //                 r.company_id === "EMB" &&
    //                 r.branchCode !== "EMB-MAIN" && 
    //                 r.position !== "board" &&
    //                 r.position !== "Mancom"
    //             );

    const embCompleteList = list.filter((r) => r.company_id === "EMB");
    const fchCompleteList = list.filter((r) => r.company_id === "FCH");
    const rfcCompleteList = list.filter((r) => r.company_id === "RFC");
    const elcCompleteList = list.filter((r) => r.company_id === "ELC");
    const dojaCompleteList = list.filter((r) => r.company_id === "DOJA");
    const pspmiCompleteList = list.filter((r) => r.company_id === "PSPMI");

    const { grouped: fchGroupedBranches } = prepareCompanyData(list, "FCH");
    const { grouped: embGroupedBranches } = prepareCompanyData(list, "EMB");
    const { grouped: rfcGroupedBranches } = prepareCompanyData(list, "RFC");
    const { grouped: elcGroupedBranches } = prepareCompanyData(list, "ELC");
    const { grouped: dojaGroupedBranches } = prepareCompanyData(list, "DOJA");
    const { grouped: pspmiGroupedBranches } = prepareCompanyData(list, "PSPMI");

    function computeTotals(list: ArchiveAllowance[]) {
        return list.reduce(
            (acc, emp) => {
                acc.cash_allowance += Number(emp.cash_allowance ?? 0);
                acc.computed_ecola += Number(emp.ecola ?? 0);
                acc.deduct += Number(emp.deduct ?? 0);
                acc.loan += Number(emp.loan ?? 0);
                acc.totalDeduction += Number(emp.totalDeduction ?? 0);
                acc.total += Number(emp.total ?? 0);
                acc.emergency_allowance_amount += Number(emp.emergency_allowance_amount ?? 0);
                return acc;
            },
            {
                cash_allowance: 0,
                computed_ecola: 0,
                deduct: 0,
                loan: 0,
                totalDeduction: 0,
                total: 0,
                emergency_allowance_amount: 0,
            }
        );
    }

    const boardTotals = computeTotals(boardList);
    const mancomTotals = computeTotals(mancomList);
    const embMainTotals = computeTotals(embMainList);
    const m2Totals = computeTotals(m2List);
    const embTotal = computeTotals(embCompleteList);
    const fchTotal = computeTotals(fchCompleteList);
    const rfcTotal = computeTotals(rfcCompleteList);
    const elcTotal = computeTotals(elcCompleteList);
    const dojaTotal = computeTotals(dojaCompleteList);
    const pspmiTotal = computeTotals(pspmiCompleteList);



    // const companyMap = list.reduce<Record<string, ArchiveAllowance[]>>((acc, row) => {
    //     const key = row.company_id ?? "UNKNOWN";

    //     if (!acc[key]) {
    //         acc[key] = [];
    //     }

    //     acc[key].push(row);
    //     return acc;
    // }, {});

    // const companyTotals = Object.entries(companyMap).map(([company, data]) => {
    //     const totals = computeTotals(data);

    //     return {
    //         company,
    //         cash: totals.cash_allowance,
    //         ecola: totals.computed_ecola,
    //         total: totals.total,
    //     };
    // });

    // const grandCompanyTotal = companyTotals.reduce(
    //     (acc, row) => {
    //         acc.cash += row.cash;
    //         acc.ecola += row.ecola;
    //         acc.total += row.total;
    //         return acc;
    //     },
    //     {
    //         cash: 0,
    //         ecola: 0,
    //         total: 0,
    //     }
    // );



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
                        <tr className="bg-slate-100">

                            <th className="p-2 text-center">Name</th>
                            <th className="p-2 text-center">Branch</th>
                            <th className="p-2 text-center">Cash Assistance</th>
                            <th className="p-2 text-center">Ecola</th>
                            <th className="p-2 text-center">Absences</th>
                            <th className="p-2 text-center">Loans</th>
                            <th className="p-2 text-cetnter">Total Deductions</th>
                            { isEmergency && <th className="p-2 text-cetnter">Emergency Allowance</th> }
                            <th className="p-2 text-center">Total Net</th>
                        </tr>
                    </thead>
                    <tbody>
                        {boardList.map((row) => (
                            <tr key={row.EmpCodeId}>
                                <td className="p-1 text-center border border-gray-300">{row.name}</td>
                                <td className="p-1 text-center border border-gray-300">{row.branchCode}</td>
                                <td className="p-1 text-center border border-gray-300">{row.cash_allowance ?? 0}</td>
                                <td className="p-1 text-center border border-gray-300">{row.ecola ?? 0}</td>
                                <td className="p-1 text-center border border-gray-300">{row.deduct ?? 0}</td>
                                <td className="p-1 text-center border border-gray-300">{row.loan ?? 0}</td>
                                <td className="p-1 text-center border border-gray-300">{row.totalDeduction ?? 0}</td>
                                { isEmergency && <td className="p-1 text-center border border-gray-300">{row.emergency_allowance_amount ?? 0}</td>}
                                <td className="p-1 text-center border border-gray-300">{row.total ?? 0}</td>
                            </tr>
                        ))}
                        <tr className="border-t border-gray-400 font-semibold bg-gray-100">
                            <td className="py-1 text-center" colSpan={2}>GRAND TOTAL</td>
                            <td className="text-center">{formatCurrency(boardTotals.cash_allowance)}</td>
                            <td className="text-center">{formatCurrency(boardTotals.computed_ecola)}</td>
                            <td className="text-center">{formatCurrency(boardTotals.deduct)}</td>
                            <td className="text-center">{formatCurrency(boardTotals.loan)}</td>
                            <td className="text-center">{formatCurrency(boardTotals.totalDeduction)}</td>
                            { isEmergency && <td className="text-center">{formatCurrency(boardTotals.emergency_allowance_amount)}</td>}
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
                        <tr className="bg-slate-100">

                            <th className="p-2 text-center">Name</th>
                            <th className="p-2 text-center">Branch</th>
                            <th className="p-2 text-center">Cash Assistance</th>
                            <th className="p-2 text-center">Ecola</th>
                            <th className="p-2 text-center">Absences</th>
                            <th className="p-2 text-center">Loans</th>
                            <th className="p-2 text-cetnter">Total Deductions</th>
                            { isEmergency && <th className="p-2 text-center">Emergency Allowance</th>}
                            <th className="p-2 text-center">Total Net</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mancomList.map((row) => (
                            <tr key={row.EmpCodeId}>
                                <td className="p-1 border border-gray-300 text-center">{row.name}</td>
                                <td className="p-1 border border-gray-300 text-center">{row.branchCode}</td>
                                <td className="p-1 border border-gray-300 text-center">{row.cash_allowance ?? 0}</td>
                                <td className="p-1 border border-gray-300 text-center">{row.ecola ?? 0}</td>
                                <td className="p-1 border border-gray-300 text-center">{row.deduct ?? 0}</td>
                                <td className="p-1 border border-gray-300 text-center">{row.loan ?? 0}</td>
                                <td className="p-1 border border-gray-300 text-center">{row.totalDeduction ?? 0}</td>
                                { isEmergency && <td className="p-1 border border-gray-300 text-center">{row.emergency_allowance_amount}</td>}
                                <td className="p-1 border border-gray-300 text-center">{row.total ?? 0}</td>
                            </tr>
                        ))}
                        <tr className="border-t border-gray-400 font-semibold bg-gray-100">
                            <td className="py-1 text-center" colSpan={2}>GRAND TOTAL</td>
                            <td className="text-center">{formatCurrency(mancomTotals.cash_allowance)}</td>
                            <td className="text-center">{formatCurrency(mancomTotals.computed_ecola)}</td>
                            <td className="text-center">{formatCurrency(mancomTotals.deduct)}</td>
                            <td className="text-center">{formatCurrency(mancomTotals.loan)}</td>
                            <td className="text-center">{formatCurrency(mancomTotals.totalDeduction)}</td>
                            { isEmergency && <td className="p-1 border border-gray-300 text-center">{formatCurrency(mancomTotals.emergency_allowance_amount)}</td>}
                            <td className="text-center">{formatCurrency(mancomTotals.total)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>




            {/* MH */}
            <div className="pt-4">
                <h2 className="py-1 font-semibold text-lg">MAIN BRANCH</h2>
                <table className="w-full border border-slate-200 rounded-md shadow">
                    <thead>
                        <tr className="bg-slate-100">
                            <th className="p-2 text-center">Name</th>
                            <th className="p-2 text-center">Branch</th>
                            <th className="p-2 text-center">Cash Assistance</th>
                            <th className="p-2 text-center">Ecola</th>
                            <th className="p-2 text-center">Absences</th>
                            <th className="p-2 text-center">Loans</th>
                            <th className="p-2 text-center">Total Deductions</th>
                            { isEmergency && <th className="p-2 text-center">Emergency Allowance</th>}
                            <th className="p-2 text-center">Total Net</th>
                        </tr>
                    </thead>

                    <tbody>
                        {embMainList.map((row) => (
                            <tr key={row.EmpCodeId}>
                                <td className="p-1 border border-gray-300 text-center">{row.name}</td>
                                <td className="p-1 border border-gray-300 text-center">{row.branchCode}</td>
                                <td className="p-1 border border-gray-300 text-center">{row.cash_allowance ?? 0}</td>
                                <td className="p-1 border border-gray-300 text-center">{row.ecola ?? 0}</td>
                                <td className="p-1 border border-gray-300 text-center">{row.deduct ?? 0}</td>
                                <td className="p-1 border border-gray-300 text-center">{row.loan ?? 0}</td>
                                <td className="p-1 border border-gray-300 text-center">{row.totalDeduction ?? 0}</td>
                                { isEmergency && <td className="p-1 border border-gray-300 text-center">{row.emergency_allowance_amount ?? 0 }</td>}
                                <td className="p-1 border border-gray-300 text-center">{row.total ?? 0}</td>
                            </tr>
                        ))}

                        <tr className="border-t border-gray-400 font-semibold bg-gray-100">
                            <td colSpan={2} className="text-center p-1">GRAND TOTAL</td>
                            <td className="text-center">{formatCurrency(embMainTotals.cash_allowance)}</td>
                            <td className="text-center">{formatCurrency(embMainTotals.computed_ecola)}</td>
                            <td className="text-center">{formatCurrency(embMainTotals.deduct)}</td>
                            <td className="text-center">{formatCurrency(embMainTotals.loan)}</td>
                            <td className="text-center">{formatCurrency(embMainTotals.totalDeduction)}</td>
                            { isEmergency && <td className="text-center">{formatCurrency(embMainTotals.emergency_allowance_amount)}</td>}
                            <td className="text-center">{formatCurrency(embMainTotals.total)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>





            {/* M2 */}
            <div className="pt-4">
                <h2 className="py-1 font-semibold text-lg">BACOLOD BRANCH</h2>
                <table className="w-full border border-slate-200 rounded-md shadow">
                    <thead>
                        <tr className="bg-slate-100">
                            <th className="p-2 text-center">Name</th>
                            <th className="p-2 text-center">Branch</th>
                            <th className="p-2 text-center">Cash Assistance</th>
                            <th className="p-2 text-center">Ecola</th>
                            <th className="p-2 text-center">Absences</th>
                            <th className="p-2 text-center">Loans</th>
                            <th className="p-2 text-center">Total Deductions</th>
                            { isEmergency && <th className="p-2 text-center">Emergency Allowance</th> }
                            <th className="p-2 text-center">Total Net</th>
                        </tr>
                    </thead>

                    <tbody>
                        {m2List.map((row) => (
                            <tr key={row.EmpCodeId}>
                                <td className="p-1 border border-gray-300 text-center">{row.name}</td>
                                <td className="p-1 border border-gray-300 text-center">{row.branchCode}</td>
                                <td className="p-1 border border-gray-300 text-center">{row.cash_allowance ?? 0}</td>
                                <td className="p-1 border border-gray-300 text-center">{row.ecola ?? 0}</td>
                                <td className="p-1 border border-gray-300 text-center">{row.deduct ?? 0}</td>
                                <td className="p-1 border border-gray-300 text-center">{row.loan ?? 0}</td>
                                <td className="p-1 border border-gray-300 text-center">{row.totalDeduction ?? 0}</td>
                                { isEmergency && <td className="p-1 border border-gray-300 text-center">{row.emergency_allowance_amount ?? 0}</td>}
                                <td className="p-1 border border-gray-300 text-center">{row.total ?? 0}</td>
                            </tr>
                        ))}

                        <tr className="border-t border-gray-400 font-semibold bg-gray-100">
                            <td colSpan={2} className="text-center">GRAND TOTAL</td>
                            <td className="text-center">{formatCurrency(m2Totals.cash_allowance)}</td>
                            <td className="text-center">{formatCurrency(m2Totals.computed_ecola)}</td>
                            <td className="text-center">{formatCurrency(m2Totals.deduct)}</td>
                            <td className="text-center">{formatCurrency(m2Totals.loan)}</td>
                            <td className="text-center">{formatCurrency(m2Totals.totalDeduction)}</td>
                            { isEmergency && <td className="text-center">{formatCurrency(m2Totals.emergency_allowance_amount)}</td>}
                            <td className="text-center">{formatCurrency(m2Totals.total)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>





            {/* EMB COMPANY */}
            {embGroupedBranches.map((branch, index) => {
                const totals = computeTotals(branch.data);
                const isLast = index === embGroupedBranches.length - 1;
                return (
                    <div key={branch.branchCode} className="py-4">

                        <div className="bg-gray-300 font-semibold px-3 py-1">
                            {branch.branchCode}
                        </div>

                        <table className="w-full border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200 text-sm">
                                    <th className="p-1 w-10"></th>
                                    <th className="p-1 text-center">NAME</th>
                                    <th className="p-1 text-center">CASH ASSISTANCE</th>
                                    <th className="p-1 text-center">ECOLA</th>
                                    <th className="p-1 text-center">ABSENCES</th>
                                    <th className="p-1 text-center">LOANS</th>
                                    <th className="p-1 text-center">TOTAL DEDUCTIONS</th>
                                    { isEmergency && <th className="p-1 text-center">EMERGENCY ALLOWANCE</th> }
                                    <th className="p-1 text-center">NET TOTAL</th>
                                </tr>
                            </thead>

                            <tbody>
                                {branch.data.map((row, index) => (
                                    <tr key={row.EmpCodeId} className="border-t text-sm">
                                        <td className="p-1 text-center">{index + 1}</td>
                                        <td className="p-1">{row.name}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.cash_allowance)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.ecola)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.deduct)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.loan)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.totalDeduction)}</td>
                                        { isEmergency && <th className="p-1 text-center">{formatCurrency(row.emergency_allowance_amount)}</th>}
                                        <td className="p-1 text-center font-semibold">{formatCurrency(row.total)}</td>
                                    </tr>
                                ))}

                                <tr className="border-t font-semibold bg-gray-100">
                                    <td colSpan={2} className="text-center py-1">
                                        GRAND TOTAL
                                    </td>
                                    <td className="text-center">{formatCurrency(totals.cash_allowance)}</td>
                                    <td className="text-center">{formatCurrency(totals.computed_ecola)}</td>
                                    <td className="text-center">{formatCurrency(totals.deduct)}</td>
                                    <td className="text-center">{formatCurrency(totals.loan)}</td>
                                    <td className="text-center">{formatCurrency(totals.totalDeduction)}</td>
                                    { isEmergency && <td className="text-center">{formatCurrency(totals.emergency_allowance_amount)}</td>}
                                    <td className="text-center">{formatCurrency(totals.total)}</td>
                                </tr>

                                {isLast && (

                                    <tr className="bg-yellow-200 font-bold border-t-2 border-yellow-500">
                                        <td colSpan={2} className="text-center py-1">
                                            TOTAL EMB
                                        </td>
                                        <td className="text-center py-2">{formatCurrency(embTotal.cash_allowance)}</td>
                                        <td className="text-center py-2">{formatCurrency(embTotal.computed_ecola)}</td>
                                        <td className="text-center py-2">{formatCurrency(embTotal.deduct)}</td>
                                        <td className="text-center py-2">{formatCurrency(embTotal.loan)}</td>
                                        <td className="text-center py-2">{formatCurrency(embTotal.totalDeduction)}</td>
                                        { isEmergency && <td className="text-center py-2">{formatCurrency(embTotal.emergency_allowance_amount)}</td>}
                                        <td className="text-center py-2">{formatCurrency(embTotal.total)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            })}





            {/* FCH COMPANY */}
            {fchGroupedBranches.map((branch, index) => {
                const totals = computeTotals(branch.data);
                const isLast = index === fchGroupedBranches.length - 1;
                return (
                    <div key={branch.branchCode} className="py-4">

                        <div className="bg-gray-300 font-semibold px-3 py-1">
                            {branch.branchCode}
                        </div>

                        <table className="w-full border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200 text-sm">
                                    <th className="p-1 w-10"></th>
                                    <th className="p-1 text-center">NAME</th>
                                    <th className="p-1 text-center">CASH ASSISTANCE</th>
                                    <th className="p-1 text-center">ECOLA</th>
                                    <th className="p-1 text-center">ABSENCES</th>
                                    <th className="p-1 text-center">LOANS</th>
                                    <th className="p-1 text-center">TOTAL DEDUCTIONS</th>
                                    { isEmergency && <td className="p-1 text-center font-bold">EMERGENCY ALLOWANCE</td>}
                                    <th className="p-1 text-center">NET TOTAL</th>
                                </tr>
                            </thead>

                            <tbody>
                                {branch.data.map((row, index) => (
                                    <tr key={row.EmpCodeId} className="border-t text-sm">
                                        <td className="p-1 text-center">{index + 1}</td>
                                        <td className="p-1">{row.name}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.cash_allowance)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.ecola)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.deduct)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.loan)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.totalDeduction)}</td>
                                        { isEmergency && <td className="p-1 text-center">{formatCurrency(row.emergency_allowance_amount)}</td>}
                                        <td className="p-1 text-center font-semibold">
                                            {formatCurrency(row.total)}
                                        </td>
                                    </tr>
                                ))}

                                <tr className="border-t font-semibold bg-gray-100">
                                    <td colSpan={2} className="text-center py-1">
                                        GRAND TOTAL
                                    </td>
                                    <td className="text-center">{formatCurrency(totals.cash_allowance)}</td>
                                    <td className="text-center">{formatCurrency(totals.computed_ecola)}</td>
                                    <td className="text-center">{formatCurrency(totals.deduct)}</td>
                                    <td className="text-center">{formatCurrency(totals.loan)}</td>
                                    <td className="text-center">{formatCurrency(totals.totalDeduction)}</td>
                                    { isEmergency && <td className="text-center">{formatCurrency(totals.emergency_allowance_amount)}</td>}
                                    <td className="text-center">{formatCurrency(totals.total)}</td>
                                </tr>

                                {isLast && (

                                    <tr className="bg-yellow-200 font-bold border-t-2 border-yellow-500">
                                        <td colSpan={2} className="text-center py-1">
                                            TOTAL FCH
                                        </td>
                                        <td className="text-center py-2">{formatCurrency(fchTotal.cash_allowance)}</td>
                                        <td className="text-center py-2">{formatCurrency(fchTotal.computed_ecola)}</td>
                                        <td className="text-center py-2">{formatCurrency(fchTotal.deduct)}</td>
                                        <td className="text-center py-2">{formatCurrency(fchTotal.loan)}</td>
                                        <td className="text-center py-2">{formatCurrency(fchTotal.totalDeduction)}</td>
                                        { isEmergency && <td className="text-center py-2">{formatCurrency(fchTotal.emergency_allowance_amount)}</td>}
                                        <td className="text-center py-2">{formatCurrency(fchTotal.total)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            })}







            {/* RFC COMPANY */}
            {rfcGroupedBranches.map((branch, index) => {
                const totals = computeTotals(branch.data);
                const isLast = index === rfcGroupedBranches.length - 1;
                return (
                    <div key={branch.branchCode} className="py-4">

                        <div className="bg-gray-300 font-semibold px-3 py-1">
                            {branch.branchCode}
                        </div>

                        <table className="w-full border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200 text-sm">
                                    <th className="p-1 w-10"></th>
                                    <th className="p-1 text-center">NAME</th>
                                    <th className="p-1 text-center">CASH ASSISTANCE</th>
                                    <th className="p-1 text-center">ECOLA</th>
                                    <th className="p-1 text-center">ABSENCES</th>
                                    <th className="p-1 text-center">LOANS</th>
                                    <th className="p-1 text-center">TOTAL DEDUCTIONS</th>
                                    { isEmergency && <td className="p-1 text-center font-bold">EMERGENCY ALLOWANCE</td> }
                                    <th className="p-1 text-center">NET TOTAL</th>
                                </tr>
                            </thead>

                            <tbody>
                                {branch.data.map((row, index) => (
                                    <tr key={row.EmpCodeId} className="border-t text-sm">
                                        <td className="p-1 text-center">{index + 1}</td>
                                        <td className="p-1">{row.name}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.cash_allowance)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.ecola)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.deduct)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.loan)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.totalDeduction)}</td>
                                        { isEmergency && <td className="p-1 text-center">{formatCurrency(row.emergency_allowance_amount)}</td>}
                                        <td className="p-1 text-center font-semibold">
                                            {formatCurrency(row.total)}
                                        </td>
                                    </tr>
                                ))}

                                <tr className="border-t font-semibold bg-gray-100">
                                    <td colSpan={2} className="text-center py-1">
                                        GRAND TOTAL
                                    </td>
                                    <td className="text-center">{formatCurrency(totals.cash_allowance)}</td>
                                    <td className="text-center">{formatCurrency(totals.computed_ecola)}</td>
                                    <td className="text-center">{formatCurrency(totals.deduct)}</td>
                                    <td className="text-center">{formatCurrency(totals.loan)}</td>
                                    <td className="text-center">{formatCurrency(totals.totalDeduction)}</td>
                                    { isEmergency && <td className="text-center ">{formatCurrency(totals.emergency_allowance_amount)}</td>}
                                    <td className="text-center">{formatCurrency(totals.total)}</td>
                                </tr>

                                {isLast && (

                                    <tr className="bg-yellow-200 font-bold border-t-2 border-yellow-500">
                                        <td colSpan={2} className="text-center py-1">
                                            TOTAL RFC
                                        </td>
                                        <td className="text-center py-2">{formatCurrency(rfcTotal.cash_allowance)}</td>
                                        <td className="text-center py-2">{formatCurrency(rfcTotal.computed_ecola)}</td>
                                        <td className="text-center py-2">{formatCurrency(rfcTotal.deduct)}</td>
                                        <td className="text-center py-2">{formatCurrency(rfcTotal.loan)}</td>
                                        <td className="text-center py-2">{formatCurrency(rfcTotal.totalDeduction)}</td>
                                        { isEmergency && <td className="text-center py-2">{formatCurrency(rfcTotal.emergency_allowance_amount)}</td>}
                                        <td className="text-center py-2">{formatCurrency(rfcTotal.total)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            })}




            {/* ELC */}
            {elcGroupedBranches.map((branch, index) => {
                const totals = computeTotals(branch.data);
                const isLast = index === elcGroupedBranches.length - 1;
                return (
                    <div key={branch.branchCode} className="py-4">

                        <div className="bg-gray-300 font-semibold px-3 py-1">
                            {branch.branchCode}
                        </div>

                        <table className="w-full border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200 text-sm">
                                    <th className="p-1 w-10"></th>
                                    <th className="p-1 text-center">NAME</th>
                                    <th className="p-1 text-center">CASH ASSISTANCE</th>
                                    <th className="p-1 text-center">ECOLA</th>
                                    <th className="p-1 text-center">ABSENCES</th>
                                    <th className="p-1 text-center">LOANS</th>
                                    <th className="p-1 text-center">TOTAL DEDUCTIONS</th>
                                    { isEmergency && <th className="p-1 text-center">EMERGENCY ALLOWANCE</th>}
                                    <th className="p-1 text-center">NET TOTAL</th>
                                </tr>
                            </thead>

                            <tbody>
                                {branch.data.map((row, index) => (
                                    <tr key={row.EmpCodeId} className="border-t text-sm">
                                        <td className="p-1 text-center">{index + 1}</td>
                                        <td className="p-1">{row.name}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.cash_allowance)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.ecola)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.deduct)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.loan)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.totalDeduction)}</td>
                                        { isEmergency && <td className="p-1 text-center">{formatCurrency(row.emergency_allowance_amount)}</td>}
                                        <td className="p-1 text-center font-semibold">
                                            {formatCurrency(row.total)}
                                        </td>
                                    </tr>
                                ))}

                                <tr className="border-t font-semibold bg-gray-100">
                                    <td colSpan={2} className="text-center py-1">
                                        GRAND TOTAL
                                    </td>
                                    <td className="text-center">{formatCurrency(totals.cash_allowance)}</td>
                                    <td className="text-center">{formatCurrency(totals.computed_ecola)}</td>
                                    <td className="text-center">{formatCurrency(totals.deduct)}</td>
                                    <td className="text-center">{formatCurrency(totals.loan)}</td>
                                    <td className="text-center">{formatCurrency(totals.totalDeduction)}</td>
                                    { isEmergency && <td className="text-center">{formatCurrency(totals.emergency_allowance_amount)}</td> }
                                    <td className="text-center">{formatCurrency(totals.total)}</td>
                                </tr>

                                {isLast && (

                                    <tr className="bg-yellow-200 font-bold border-t-2 border-yellow-500">
                                        <td colSpan={2} className="text-center py-1">
                                            TOTAL ELC
                                        </td>
                                        <td className="text-center py-2">{formatCurrency(elcTotal.cash_allowance)}</td>
                                        <td className="text-center py-2">{formatCurrency(elcTotal.computed_ecola)}</td>
                                        <td className="text-center py-2">{formatCurrency(elcTotal.deduct)}</td>
                                        <td className="text-center py-2">{formatCurrency(elcTotal.loan)}</td>
                                        <td className="text-center py-2">{formatCurrency(elcTotal.totalDeduction)}</td>
                                        { isEmergency && <td className="text-center py-2 ">{formatCurrency(elcTotal.emergency_allowance_amount)}</td>}
                                        <td className="text-center py-2">{formatCurrency(elcTotal.total)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            })}



            {/* DOJA */}
            {dojaGroupedBranches.map((branch, index) => {
                const totals = computeTotals(branch.data);
                const isLast = index === dojaGroupedBranches.length - 1;
                return (
                    <div key={branch.branchCode} className="py-4">

                        <div className="bg-gray-300 font-semibold px-3 py-1">
                            {branch.branchCode}
                        </div>

                        <table className="w-full border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200 text-sm">
                                    <th className="p-1 w-10"></th>
                                    <th className="p-1 text-center">NAME</th>
                                    <th className="p-1 text-center">CASH ASSISTANCE</th>
                                    <th className="p-1 text-center">ECOLA</th>
                                    <th className="p-1 text-center">ABSENCES</th>
                                    <th className="p-1 text-center">LOANS</th>
                                    <th className="p-1 text-center">TOTAL DEDUCTIONS</th>
                                    { isEmergency && <th className="p-1 text-center">EMERGENCY ALLOWANCE</th>}
                                    <th className="p-1 text-center">NET TOTAL</th>
                                </tr>
                            </thead>

                            <tbody>
                                {branch.data.map((row, index) => (
                                    <tr key={row.EmpCodeId} className="border-t text-sm">
                                        <td className="p-1 text-center">{index + 1}</td>
                                        <td className="p-1">{row.name}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.cash_allowance)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.ecola)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.deduct)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.loan)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.totalDeduction)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.emergency_allowance_amount)}</td>
                                        <td className="p-1 text-center font-semibold">
                                            {formatCurrency(row.total)}
                                        </td>
                                    </tr>
                                ))}

                                <tr className="border-t font-semibold bg-gray-100">
                                    <td colSpan={2} className="text-center py-1">
                                        GRAND TOTAL
                                    </td>
                                    <td className="text-center">{formatCurrency(totals.cash_allowance)}</td>
                                    <td className="text-center">{formatCurrency(totals.computed_ecola)}</td>
                                    <td className="text-center">{formatCurrency(totals.deduct)}</td>
                                    <td className="text-center">{formatCurrency(totals.loan)}</td>
                                    <td className="text-center">{formatCurrency(totals.totalDeduction)}</td>
                                    { isEmergency && <td className="text-center">{formatCurrency(totals.emergency_allowance_amount)}</td>}
                                    <td className="text-center">{formatCurrency(totals.total)}</td>
                                </tr>

                                {isLast && (

                                    <tr className="bg-yellow-200 font-bold border-t-2 border-yellow-500">
                                        <td colSpan={2} className="text-center py-1">
                                            TOTAL DOJA
                                        </td>
                                        <td className="text-center py-2">{formatCurrency(dojaTotal.cash_allowance)}</td>
                                        <td className="text-center py-2">{formatCurrency(dojaTotal.computed_ecola)}</td>
                                        <td className="text-center py-2">{formatCurrency(dojaTotal.deduct)}</td>
                                        <td className="text-center py-2">{formatCurrency(dojaTotal.loan)}</td>
                                        <td className="text-center py-2">{formatCurrency(dojaTotal.totalDeduction)}</td>
                                        { isEmergency && <td className="text-center py-2 ">{formatCurrency(dojaTotal.emergency_allowance_amount)}</td>}
                                        <td className="text-center py-2">{formatCurrency(dojaTotal.total)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            })}





            {/* PSPMI */}
            {pspmiGroupedBranches.map((branch, index) => {
                const totals = computeTotals(branch.data);
                const isLast = index === pspmiGroupedBranches.length - 1;
                return (
                    <div key={branch.branchCode} className="py-4">

                        <div className="bg-gray-300 font-semibold px-3 py-1">
                            {branch.branchCode}
                        </div>

                        <table className="w-full border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200 text-sm">
                                    <th className="p-1 w-10"></th>
                                    <th className="p-1 text-center">NAME</th>
                                    <th className="p-1 text-center">CASH ASSISTANCE</th>
                                    <th className="p-1 text-center">ECOLA</th>
                                    <th className="p-1 text-center">ABSENCES</th>
                                    <th className="p-1 text-center">LOANS</th>
                                    <th className="p-1 text-center">TOTAL DEDUCTIONS</th>
                                    { isEmergency && <th className="p-1 text-center">EMERGENCY ALLOWANCE</th>}
                                    <th className="p-1 text-center">NET TOTAL</th>
                                </tr>
                            </thead>

                            <tbody>
                                {branch.data.map((row, index) => (
                                    <tr key={row.EmpCodeId} className="border-t text-sm">
                                        <td className="p-1 text-center">{index + 1}</td>
                                        <td className="p-1">{row.name}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.cash_allowance)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.ecola)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.deduct)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.loan)}</td>
                                        <td className="p-1 text-center">{formatCurrency(row.totalDeduction)}</td>
                                        { isEmergency && <td className="p-1 text-center">{formatCurrency(row.emergency_allowance_amount)}</td>}
                                        <td className="p-1 text-center font-semibold">
                                            {formatCurrency(row.total)}
                                        </td>
                                    </tr>
                                ))}

                                <tr className="border-t font-semibold bg-gray-100">
                                    <td colSpan={2} className="text-center py-1">
                                        GRAND TOTAL
                                    </td>
                                    <td className="text-center">{formatCurrency(totals.cash_allowance)}</td>
                                    <td className="text-center">{formatCurrency(totals.computed_ecola)}</td>
                                    <td className="text-center">{formatCurrency(totals.deduct)}</td>
                                    <td className="text-center">{formatCurrency(totals.loan)}</td>
                                    <td className="text-center">{formatCurrency(totals.totalDeduction)}</td>
                                    { isEmergency && <td className="p-1 text-center">{formatCurrency(totals.emergency_allowance_amount)}</td>}
                                    <td className="text-center">{formatCurrency(totals.total)}</td>
                                </tr>

                                {isLast && (

                                    <tr className="bg-yellow-200 font-bold border-t-2 border-yellow-500">
                                        <td colSpan={2} className="text-center py-1">
                                            TOTAL PSPMI
                                        </td>
                                        <td className="text-center py-2">{formatCurrency(pspmiTotal.cash_allowance)}</td>
                                        <td className="text-center py-2">{formatCurrency(pspmiTotal.computed_ecola)}</td>
                                        <td className="text-center py-2">{formatCurrency(pspmiTotal.deduct)}</td>
                                        <td className="text-center py-2">{formatCurrency(pspmiTotal.loan)}</td>
                                        <td className="text-center py-2">{formatCurrency(pspmiTotal.totalDeduction)}</td>
                                        { isEmergency && <td className="text-center py-2">{formatCurrency(pspmiTotal.emergency_allowance_amount)}</td>}
                                        <td className="text-center py-2">{formatCurrency(pspmiTotal.total)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            })}



            {/* TOTAL PER COMPANY */}
            <div>
                <table className="border-collapse w-full border border-gray-300 text-center">
                    <thead>
                        <tr className="bg-gray-300">
                            <th className="py-2 text-center">COMPANY</th>
                            <th>CASH ASSISTANCE</th>
                            <th>ECOLA</th>
                            { isEmergency && <th>EMERGENCY ALLOWANCE</th>}
                            <th>NET TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(companyList).map(([company, value]) => {
                            const item = value as {
                                total_cash_allowance: number;
                                ecola: number;
                                total_num: number;
                                branches: unknown;
                                emergency_allowance_amount: number;
                            };
                        return (
                            <tr key={company}>
                                <td className="text-center p-2 border border-gray-300">{company}</td>
                                <td className="text-center p-2 border border-gray-300">{formatCurrency(item.total_cash_allowance)}</td>
                                <td className="text-center p-2 border border-gray-300">{formatCurrency(item.ecola)}</td>
                                { isEmergency && <td className="text-center p-2 border border-gray-300">{formatCurrency(item.emergency_allowance_amount)}</td>}
                                <td className="text-center p-2 border border-gray-300 font-semibold">{formatCurrency(item.total_cash_allowance + item.ecola)}</td>
                            </tr>
                            );
                        })}
                        <tr>
                            <td className="font-semibold">GRAND TOTAL</td>
                            <td className="py-1 px-2 border border-gray-300 font-semibold">{formatCurrency(companyTotal.cash)}</td>
                            <td className="py-1 px-2 border border-gray-300 font-semibold">{formatCurrency(companyTotal.ecola)}</td>
                            { isEmergency && <td className="py-1 px-2 border border-gray-300 font-semibold">{formatCurrency(companyTotal.emergency_allowance_amount)}</td>}
                            <td className="py-1 px-2 border border-gray-300 font-semibold">{formatCurrency(companyTotal.ecola + companyTotal.cash + companyTotal.emergency_allowance_amount)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>


            {/* LOANS */}
             <div className="pt-8">
                <h2 className="py-1 font-semibold text-lg">LOANS</h2>
                <table className="border-collapse w-full border border-gray-300 text-center">
                    <thead>
                        <tr className="bg-gray-300">
                            <th className="text-left py-2 px-4">EMPLOYEE NAME</th>
                            <th className="text-left py-2 px-4">BRANCH</th>
                            <th className="text-left py-2 px-4">DEDUCT</th>
                     
                        </tr>
                    </thead>
                    <tbody>

                        
                        
                        {Object.entries(loanList).map(([id, value]) => {
                            const item = value as {
                                Firstname: string;
                                Lastname: string;
                                per_payroll_deduct: number;
                                BranchCodeId: string;
                            };

                      

                        return (
                            <tr key={id}>
                                <td className="text-left p-2 border border-gray-300">{`${item.Lastname}, ${item.Firstname}`}</td>
                                <td className="text-left p-2 border border-gray-300">{(item.BranchCodeId)}</td>
                                <td className="text-left p-2 border border-gray-300">{(item.per_payroll_deduct)}</td>
                               
                            </tr>
                            );                         
                        })}

                            <tr>
                              <td className="py-2 px-4 font-semibold border border-gray-300 text-left" colSpan={2}>GRAND TOTAL</td>    
                              <td className="font-semibold text-left px-2">{formatCurrency(loanTotal)}</td> 
                            </tr>   
                    </tbody>
                </table>
            </div>




     
             {/* <div className="pt-8">
                <h2 className="py-1 font-semibold text-lg">LOANS</h2>
                <table className="border-collapse w-full border border-gray-300 text-center">
                    <thead>
                        <tr className="bg-gray-300">
                            <th className="text-left py-2 px-4">EMPLOYEE NAME</th>
                            <th className="text-left py-2 px-4">BRANCH</th>
                            <th className="text-left py-2 px-4">DEDUCT</th>
                     
                        </tr>
                    </thead>
                    <tbody>

                        
                        
                        {Object.entries(loanList).map(([id, value]) => {
                            const item = value as {
                                Firstname: string;
                                Lastname: string;
                                per_payroll_deduct: number;
                                BranchCodeId: string;
                            };

                      

                        return (
                            <tr key={id}>
                                <td className="text-left p-2 border border-gray-300">{`${item.Lastname}, ${item.Firstname}`}</td>
                                <td className="text-left p-2 border border-gray-300">{(item.BranchCodeId)}</td>
                                <td className="text-left p-2 border border-gray-300">{(item.per_payroll_deduct)}</td>
                               
                            </tr>
                            );                         
                        })}

                            <tr>
                              <td className="py-2 px-4 font-semibold border border-gray-300 text-left" colSpan={2}>GRAND TOTAL</td>    
                              <td className="font-semibold text-left px-2">{formatCurrency(loanTotal)}</td> 
                            </tr>   
                    </tbody>
                </table>
            </div> */}



            <div className="pt-6">
                    <h2 className="text-left font-semibold text-lg mb-2">VARIANCE</h2>

                    <table className="w-full border-collapse border border-gray-300 text-left">
                        <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2">MONTH & YEAR</th>
                            <th>CASH ASSISTANCE</th>
                            <th>ECOLA</th>
                            <th>TOTAL</th>
                        </tr>
                        </thead>

                        <tbody>
         
                        <tr>
                            <td className="p-2">
                            {previous?.selectedMonth?.toUpperCase?.() ?? "-"}
                            </td>
                            <td>{formatCurrency(previous?.cash_assistance)}</td>
                            <td>{formatCurrency(previous?.ecola)}</td>
                            <td>{formatCurrency(previous?.grand_total)}</td>
                        </tr>

                 
                        <tr>
                            <td className="p-2">
                            {current?.selectedMonth?.toUpperCase?.() ?? "-"}
                            </td>
                            <td>{formatCurrency(current?.cash_assistance)}</td>
                            <td>{formatCurrency(current?.ecola)}</td>
                            <td>{formatCurrency(current?.grand_total)}</td>
                        </tr>

                   
                        <tr>
                            <td colSpan={4}>
                            <div className="border-t border-gray-300" />
                            </td>
                        </tr>

               
                        <tr className="font-semibold">
                            <td className="py-1 px-2 bg-gray-200">VARIANCE</td>
                            <td className="py-1 px-2 bg-gray-200">{formatCurrency(varianceRow?.cash_assistance)}</td>
                            <td className="py-1 px-2 bg-gray-200">{formatCurrency(varianceRow?.ecola)}</td>
                            <td className="py-1 px-2 bg-gray-200">{formatCurrency(varianceRow?.grand_total)}</td>
                        </tr>
                        </tbody>
                    </table>
                    </div>
                    





                    {/* VARIANCE EMPLOYEE  add*/}
                  <div className="pt-6">
                    <h2 className="text-left font-semibold text-lg mb-2">ADD</h2>

                    <table className="w-full border-collapse border border-gray-300 text-left">
                        <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2">EMPLOYEE NAME</th>
                            <th>CASH ASSISTANCE</th>
                            <th>ECOLA</th>
                            <th>TOTAL</th>
                        </tr>
                        </thead>

                        <tbody>
                        {addList.map((emp, index) => (
                            <tr key={index}>
                            <td className="p-2">{emp.name}</td>
                            <td>{formatCurrency(emp.variance.cash_assistance)}</td>
                            <td>{formatCurrency(emp.variance.ecola)}</td>
                            <td>{formatCurrency(emp.variance.total)}</td>
                            </tr>
                        ))}
                        <tr>
                        <td className="font-semibold p-2 bg-gray-200">GRAND TOTAL</td>
                        <td className="font-semibold py-1 bg-gray-200">
                            {formatCurrency(addTotals.cash)}
                        </td>
                        <td className="font-semibold py-1 bg-gray-200">
                            {formatCurrency(addTotals.ecola)}
                        </td>
                        <td className="font-semibold py-1 bg-gray-200">
                            {formatCurrency(addTotals.total)}
                        </td>
                        </tr>
                        </tbody>
                    </table>
                    </div>


                    {/* variance emp less  */}

                    <div className="pt-6">
                    <h2 className="text-left font-semibold text-lg mb-2">LESS</h2>
                    <table className="w-full border-collapse border border-gray-300 text-left">
                        <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2">EMPLOYEE NAME</th>
                            <th>CASH ASSISTANCE</th>
                            <th>ECOLA</th>
                            <th>TOTAL</th>
                        </tr>
                        </thead>

                        <tbody>
                        {lessList.map((emp, index) => (
                            <tr key={index}>
                            <td className="p-2">{emp.name}</td>
                            <td>{formatCurrency(emp.variance.cash_assistance)}</td>
                            <td>{formatCurrency(emp.variance.ecola)}</td>
                            <td>{formatCurrency(emp.variance.total)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>








        </div>



    );
}


