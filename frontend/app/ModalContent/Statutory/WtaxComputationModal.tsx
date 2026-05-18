import { WtaxComputationListProps } from "@/app/types/statutoryType";
import { formatAmount, formatCurrency } from "@/app/utils/currencyConverter";




type WTaxComputationProps = {
    data: WtaxComputationListProps;
};



export default function WtaxComputationModal({ data }: WTaxComputationProps) {

    const month = 1;
    const basic = data?.basic_salary;
    let res1 = 0;
    let res2 = 0;

    if(month === 1){
        res1 = basic * 11.5
        res2 = basic * 0.5;
    }


     const res3 = res1 + res2;

     const remaining_months = 11;
     const philhealth_rem = data?.philhealth_emp * remaining_months;
     const sss_rem = data?.sss_emp * remaining_months;
     const pagibig_rem = data?.pagibig_emp  * remaining_months;

     const philhealttotal = philhealth_rem + data?.philhealth_emp;
     const sssRemTotal = sss_rem + data?.sss_emp;
     const pagibigtotal = pagibig_rem + data?.pagibig_emp;

     const totalContrib  = philhealttotal + sssRemTotal + pagibigtotal;

     const res4 = res3 - totalContrib;

    const matchedTax = data?.tax?.find((item) => {
        return (
            Number(res4) >= Number(item.start_range) &&
            Number(res4) <= Number(item.end_range)
        );
    });

    const annualBaseTaxBracket = Number(matchedTax?.annual_base_tax_bracket ?? 0);
    const ratePerBracket = Number(matchedTax?.rate_per_bracket ?? 0);

    const annual_res4 = -annualBaseTaxBracket + res4;
    const annual_res4_rate = annual_res4 * ratePerBracket;
    const annual_base_tax = Number(matchedTax?.annual_base_tax_per_year ?? 0);

    const res5 = annual_res4_rate + annual_base_tax;
    const total_wtax_paid = 0;

    const remaining_wtax_paid = res5 - total_wtax_paid;

    const wtax_per_month = res5 / 12;



    return (



        <div className="px-4 py-2">

            <div className="py-4 mb-8 w-6/12">
                <h2 className="uppercase font-semibold bg-green-300 px-4 py-2 rounded">{data?.Name}</h2>
            </div>


            <div className="flex justify-between gap-x-2">
                <table className="w-full border-collapse rounded-lg overflow-hidden">
                    <thead>
                        <tr>
                            <th colSpan={2}></th>
                            <th className="border border-slate-400 p-1">PHILHEALTH</th>
                            <th className="border border-slate-400 p-1">SSS</th>
                            <th className="border border-slate-400 p-1">PAG-IBIG</th>
                        </tr>
                        <tr>
                            <th colSpan={2} className="invisible">s</th>
                            <th className="border border-slate-400 p-1">{data?.philhealth_emp}</th>
                            <th className="border border-slate-400 p-1">{data?.sss_emp}</th>
                            <th className="border border-slate-400 p-1">{data?.pagibig_emp}</th>
                        </tr>
                        <tr>
                            <th className="invisible">s</th>
                        </tr>
                        <tr>
                            <th className="invisible">s</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td></td>
                            <td className="text-center p-1 border border-slate-400">{formatCurrency(res2)}</td>
                        </tr>
                        <tr>
                            <td className="text-center border border-slate-400">{formatCurrency(data?.basic_salary)}</td>
                            <td className="text-center border border-slate-400 p-1">{formatCurrency(res1)}</td>
                            <td className="text-center border border-slate-400">{formatCurrency(philhealth_rem)}</td>
                            <td className="text-center border border-slate-400">{formatCurrency(sss_rem)}</td>
                            <td className="text-center border border-slate-400">{formatCurrency(pagibig_rem)}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td className="text-center p-1 border border-slate-400">{formatCurrency(res3)}</td>
                            <td className="text-center p-1 border border-slate-400">{formatCurrency(philhealttotal)}</td>
                            <td className="text-center p-1 border border-slate-400">{formatCurrency(sssRemTotal)}</td>
                            <td className="text-center p-1 border border-slate-400">{formatCurrency(pagibigtotal)}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td className="text-center p-1 border border-slate-400">{formatCurrency(totalContrib)}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td className="text-center p-1 border border-slate-400">{formatCurrency(res4)}</td>
                        </tr>
                        <tr>
                            <td className="font-semibold">FIXED</td>
                            <td className="text-center p-1 border border-slate-400">{formatAmount(annualBaseTaxBracket)}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td className="text-center p-1 border border-slate-400">{formatAmount(annual_res4)}</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td className="text-right font-semibold py-1 px-4 border border-slate-400">{ratePerBracket}%</td>
                            <td className="text-center border border-slate-400">{formatAmount(annual_res4_rate)}</td>
                        </tr>
                        <tr>
                            <td colSpan={2}></td>
                            <td className="text-center border border-slate-400 p-1">{formatAmount(annual_base_tax)}</td>
                        </tr>
                        <tr>
                            <td colSpan={2} className="font-semibold">W/TAX PAYABLE</td>
                            <td className="text-center border border-slate-400 p-1">{formatAmount(res5)}</td>
                            <td className="text-center border border-slate-400 p-1">{month}</td>
                            <td className="text-center border border-slate-400 p-1">{formatAmount(wtax_per_month)}</td>
                        </tr>
                        <tr>
                            <td colSpan={2} className="font-semibold">LESS: TOTAL W/TAX PAID</td>
                            <td className="text-center border border-slate-400 p-1"> {total_wtax_paid}</td>
                        </tr>
                        <tr>
                            <td colSpan={2} className="font-semibold">REMAINING W/TAX PAID</td>
                            <td className="text-center border border-slate-400 p-1">{formatAmount(remaining_wtax_paid)}</td>
                        </tr>
                    </tbody>
                </table>


                <div className="w-full grid grid-cols-3">
                    <div className="place-items-center">
                        <div className="font-semibold">TAX PAID TO DATE</div>
                        <div className="font-semibold bg-yellow-500 px-4 py-1 rounded mt-1">9,902</div>
                    </div>
                    <div>
                        <div>JANUARY</div>
                        <div>FEBRUARY</div>
                        <div>MARCH</div>
                        <div>APRIL</div>
                        <div>MAY</div>
                        <div>JUNE</div>
                    </div>
                    <div>
                        <div>23423</div>
                        <div>23423</div>
                        <div>23423</div>
                        <div>23423</div>
                        <div>23423</div>
                        <div>23423</div>
                    </div>
                </div>

            </div>

        </div>


    );
}