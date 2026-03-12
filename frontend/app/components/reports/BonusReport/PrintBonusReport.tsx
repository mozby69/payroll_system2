import { EmployeeGenerateBonusResponse } from "@/app/types/bonusType"
import { forwardRef } from "react"

type BonusProps = {
  data: EmployeeGenerateBonusResponse
}

const PrintBonusReport = forwardRef<HTMLDivElement, BonusProps>(
({ data }, ref) => {

const summary = data?.data.summary
const employees = data?.data.employees ?? []
const variance = data?.data.variance

const totals = employees.reduce(
(acc, emp) => {
acc.basicSalary += Number(emp.basicSalary || 0)
acc.halfMonth += Number(emp.basicSalary || 0) / 2
acc.bonusAmount += Number(emp.bonusAmount || 0)
acc.fchLoan += Number(emp.fchLoan || 0)
acc.netAmount += Number(emp.netAmount || 0)
return acc
},
{
basicSalary: 0,
halfMonth: 0,
bonusAmount: 0,
fchLoan: 0,
netAmount: 0
}
)

const varianceEmployees = variance?.varianceEmployees ?? []
const varianceTotal = variance?.totalVarianceBasicSalary ?? 0

const varianceBreakdownTotal = varianceEmployees.reduce((sum, e) => {
const amount = Number(e.basic_salary) || 0
return e.type === "ARCHIVE_NO_BONUS"
? sum - amount
: sum + amount
}, 0)

const remainingVariance = varianceTotal - varianceBreakdownTotal

return (

<div ref={ref} className="print-wrapper">

<style>{`
   @media print {

  @page {
    margin: 20mm 15mm;
  }

  .print-wrapper{
     width:270mm;
    min-height: 297mm;
    font-size: 11px;
  }

  thead {
    display: table-header-group;
  }

  tbody {
    display: table-row-group;
  }

  tr {
    page-break-inside: avoid;
  }

  .variance-section{
    break-inside: avoid;
    page-break-inside: avoid;
  }

}
`}</style>



{/* HEADER */}

<div className="text-center mb-6">

<h1 className="text-lg font-bold">EMPLOYEE BONUS REPORT</h1>

<div>{summary?.bonusRule?.name}</div>

<div>Release Period: {summary?.releasePeriod}</div>

</div>


{/* TABLE */}

<table className="w-full text-xs border-collapse border border-gray-400">

<thead className="bg-gray-200">

<tr>

<th className="border px-2 py-2">#</th>

<th className="border px-2 py-2 text-left">Employee</th>

<th className="border px-2 py-2">Date Hired</th>

<th className="border px-2 py-2">Tenure</th>

<th className="border px-2 py-2 text-right">Monthly Basic</th>

<th className="border px-2 py-2 text-right">Half Month</th>

<th className="border px-2 py-2 text-right">Bonus</th>

<th className="border px-2 py-2 text-right">FCH Loan</th>

<th className="border px-2 py-2 text-right">Net Bonus</th>

<th className="border px-2 py-2 text-left">Remarks</th>

</tr>

</thead>

<tbody>

{employees.map((bonus, index) => (

<tr key={bonus.employeeCode}>

<td className="border px-2 py-1 text-center">{index + 1}</td>

<td className="border px-2 py-1">{bonus.fullName}</td>

<td className="border px-2 py-1 text-center">
{bonus.employementDate
? new Date(bonus.employementDate).toLocaleDateString()
: "-"}
</td>

<td className="border px-2 py-1 text-center">{bonus.tenureYears}</td>

<td className="border px-2 py-1 text-right">
₱{Number(bonus.basicSalary).toLocaleString()}
</td>

<td className="border px-2 py-1 text-right">
₱{(Number(bonus.basicSalary)/2).toLocaleString()}
</td>

<td className="border px-2 py-1 text-right">
₱{Number(bonus.bonusAmount).toLocaleString()}
</td>

<td className="border px-2 py-1 text-right">
₱{Number(bonus.fchLoan).toLocaleString()}
</td>

<td className="border px-2 py-1 text-right font-semibold">
₱{Number(bonus.netAmount).toLocaleString()}
</td>

<td className="border px-2 py-1">{bonus.remarks}</td>

</tr>

))}

{/* TABLE TOTAL ONLY ON LAST PAGE */}

<tr className="font-semibold bg-gray-100">

<td colSpan={4} className="border px-2 py-2 text-right">
TOTAL
</td>

<td className="border px-2 py-2 text-right">
₱{totals.basicSalary.toLocaleString()}
</td>

<td className="border px-2 py-2 text-right">
₱{totals.halfMonth.toLocaleString()}
</td>

<td className="border px-2 py-2 text-right">
₱{totals.bonusAmount.toLocaleString()}
</td>

<td className="border px-2 py-2 text-right">
₱{totals.fchLoan.toLocaleString()}
</td>

<td className="border px-2 py-2 text-right">
₱{totals.netAmount.toLocaleString()}
</td>

<td className="border"></td>

</tr>

</tbody>

</table>


{/* VARIANCE SECTION (PREVENT PAGE BREAK) */}

<div className="mt-6 border p-4 text-sm variance-section">

<h3 className="font-semibold mb-3">Payroll Comparison</h3>

<div className="flex justify-between">
<span>Half Month</span>
<span>₱{totals.halfMonth.toLocaleString()}</span>
</div>

<div className="flex justify-between">
<span>Previous Payroll {variance?.prevPayrollDate}</span>

<span>₱{Number(variance?.prevPayroll ?? 0).toLocaleString()}</span>
</div>

<div className="border-t my-2"></div>

<div className="flex justify-between font-semibold">
<span>VARIANCE</span>
<span>₱{varianceTotal.toLocaleString()}</span>
</div>

{varianceEmployees.map(emp => {

const amount = Number(emp.basic_salary || 0)

const isAdd =
emp.type === "BONUS_NO_ARCHIVE" ||
emp.type === "SALARY_CHANGED"

return (

<div key={emp.EmpCode} className="flex justify-between text-sm">

<span>
{emp.remarks ? emp.remarks + ":" : "UNKNOWN:"} {emp.name}
{emp.date ? ` (${emp.date})` : ""}
</span>

<span>
{isAdd
? `(₱${amount.toLocaleString()})`
: `₱${amount.toLocaleString()}`}
</span>

</div>

)

})}

<div className="border-t my-2"></div>

<div className="flex justify-between font-semibold">

<span>Total Variance Balance</span>

<span>
{remainingVariance === 0
? "(₱0.00)"
: `₱${remainingVariance.toLocaleString()}`}
</span>

</div>

</div>


{/* SIGNATURE */}

<div className="mt-16 flex justify-between text-sm">

<div>
<div className="border-t w-48 text-center pt-1">
Prepared By
</div>
</div>

<div>
<div className="border-t w-48 text-center pt-1">
Checked By
</div>
</div>

<div>
<div className="border-t w-48 text-center pt-1">
Approved By
</div>
</div>

</div>

</div>

)

})

export default PrintBonusReport