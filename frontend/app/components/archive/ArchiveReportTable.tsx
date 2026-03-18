"use client"

import { calculatePayrollTotals } from "@/app/utils/calculatePayrollTotals"
import { formatCurrency } from "@/app/utils/currencyConverter"

type Employee = {
  empCode: string
  name: string
  halfBasic: number
  overtime: number
  late: number
  absences: number
  total: number
  pagIbigEmployeer: number
  sssEmployeer: number
  philhealthEmployeer: number
  reason: string
  leaveInfo: {
    start: string
    end: string
    status: string
    type: string
  }

}

type Props = {
  title: string
  employees: Employee[]
}

export default function ArchiveReportTable({ title, employees }: Props) {

  if (!employees?.length) return null

  const totals = calculatePayrollTotals(employees)

  const totalContributions =
  totals.pagibig + totals.sss + totals.philhealth

  const overallTotal = totals.total + totalContributions

  return (
    <div className="branch-section mt-5">

      <h3 className="font-semibold text-lg mb-2">
        {title}
      </h3>

      <table className="w-full border-collapse text-sm table-fixed tabular-nums">

        <thead>
          <tr className="bg-gray-100 text-xs font-semibold">
           <th className="border px-2 py-1 w-[4%] text-center">
              #
            </th>
            <th className="border px-2 py-1 text-left print-name w-[22%]">EMPLOYEE</th>
            <th className="border px-2 py-1 text-center w-[9%]">HALF BASIC</th>
            <th className="border px-2 py-1 text-center w-[9%]">OVERTIME</th>
            <th className="border px-2 py-1 text-center w-[8%]">LATE</th>
            <th className="border px-2 py-1 text-center w-[9%]">ABSENCES</th>
            <th className="border px-2 py-1 text-center w-[9%]">TOTAL</th>
            <th className="border px-2 py-1 text-center w-[9%]">PAG-IBIG</th>
            <th className="border px-2 py-1 text-center w-[9%]">SSS</th>
            <th className="border px-2 py-1 text-center w-[9%]">PHILHEALTH</th>
          </tr>
        </thead>

        <tbody>

        {employees.map((emp, index) => (
  emp.reason ? (
    <tr key={emp.empCode} className={`${emp.reason ? "text-red-600" : "" }`}>
      <td className="border px-2 py-1 text-center">
        {index + 1}
      </td>
      <td  className="border px-2 py-1 text-left print-name">
        {emp.name}
      </td>
      <td colSpan={8} className="border px-2 py-1 text-left uppercase print-name">
          {emp.leaveInfo.type} LEAVE - {emp.leaveInfo.start} -  {emp.leaveInfo.end}
      </td>
    </tr>
  ) : (
    <tr key={emp.empCode}>
      <td className="border px-2 py-1 text-center">
        {index + 1}
      </td>

      <td className="border px-2 py-1 print-name">{emp.name}</td>

      <td className="border px-2 py-1 text-right">
        {formatCurrency(emp.halfBasic)}
      </td>

      <td className="border px-2 py-1 text-right">
        {formatCurrency(emp.overtime)}
      </td>

      <td className="border px-2 py-1 text-right">
        {formatCurrency(emp.late)}
      </td>

      <td className="border px-2 py-1 text-right">
        {formatCurrency(emp.absences)}
      </td>

      <td className="border px-2 py-1 text-right font-medium">
        {formatCurrency(emp.total)}
      </td>

      <td className="border px-2 py-1 text-right">
        {formatCurrency(emp.pagIbigEmployeer)}
      </td>

      <td className="border px-2 py-1 text-right">
        {formatCurrency(emp.sssEmployeer)}
      </td>

      <td className="border px-2 py-1 text-right">
        {formatCurrency(emp.philhealthEmployeer)}
      </td>
    </tr>
  )
))}

          {/* TOTAL row INSIDE tbody */}

          <tr className="bg-gray-200 font-semibold">
            <td className="border">
              
            </td>

            <td className="border px-2 py-1 text-right">
              TOTAL
            </td>

            <td className="border px-2 py-1 text-right">
              {formatCurrency(totals.halfBasic)}
            </td>

            <td className="border px-2 py-1 text-right">
              {formatCurrency(totals.overtime)}
            </td>

            <td className="border px-2 py-1 text-right">
              {formatCurrency(totals.late)}
            </td>

            <td className="border px-2 py-1 text-right">
              {formatCurrency(totals.absences)}
            </td>

            <td className="border px-2 py-1 text-right">
              {formatCurrency(totals.total)}
            </td>

            <td className="border px-2 py-1 text-right">
              {formatCurrency(totals.pagibig)}
            </td>

            <td className="border px-2 py-1 text-right">
              {formatCurrency(totals.sss)}
            </td>

            <td className="border px-2 py-1 text-right">
              {formatCurrency(totals.philhealth)}
            </td>

          </tr>

        </tbody>

      </table>
      <div className="mt-3 flex justify-end">
  <div className="w-[320px] text-sm">

    <div className="flex justify-between">
      <span className="font-medium">Total Contributions:</span>
      <span className="font-semibold">
        {formatCurrency(totalContributions)}
      </span>
    </div>

    <div className="border-t mt-1 pt-1 flex justify-between text-base font-bold">
      <span>OVERALL TOTAL:</span>
      <span>
        {formatCurrency(overallTotal)}
      </span>
    </div>

  </div>
</div>

    </div>
  )
}