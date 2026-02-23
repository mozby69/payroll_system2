import { useGetEmployeeGeneratedBonus } from "@/app/hooks/useBonus"
import { useState } from "react"

type ViewProps = {
    id: number | undefined
}

export default function ViewArchiveModal({id} : ViewProps){
    const [selectedCompany, setSelectedCompany] = useState<string | undefined>()
    const { data } =
      useGetEmployeeGeneratedBonus(selectedCompany, id)
    const summary = data?.data.summary
    const companies = data?.data.companies ?? []
    const employees = data?.data.employees ?? []
  
    // ✅ derive active company safely
    const activeCompany =
      selectedCompany ?? companies[0]?.companyCode
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
          netAmount: 0,
        }
      )
  
 
   return (
      <div className="flex flex-col gap-6">
  
        {/* SUMMARY INFO */}
        {summary && (
          <div className="bg-white border rounded-xl p-4 shadow-sm flex justify-between text-sm">
            <div>
              <div className="font-medium text-gray-700">
                {summary.bonusRule?.name}
              </div>
              <div className="text-gray-500">
                Release Period: {summary.releasePeriod}
              </div>
            </div>
  
            <div className="text-right">
              <div>Total Employees: {summary.totalEmployees}</div>
              <div className="font-semibold text-blue-600">
                Total Amount: ₱{Number(summary.totalAmount).toLocaleString()}
              </div>
            </div>
          </div>
        )}
  
        {/* Company Buttons */}
        {companies.length > 0 && (
          <div className="flex gap-3">
            {companies.map(company => {
              const isActive =
                activeCompany === company.companyCode
  
              return (
                <button
                  key={company.companyCode}
                  onClick={() =>
                    setSelectedCompany(company.companyCode)
                  }
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {company.companyCode}
                </button>
              )
            })}
          </div>
        )}
  
        {/* Table */}
        <div className="bg-white border rounded-xl shadow-sm flex flex-col h-150">
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm border-collapse">
  
              <thead className="bg-gray-50 border-b sticky top-0 z-20">
                <tr className="text-gray-600">
                  <th className="px-4 py-3 text-left w-12">#</th>
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-center">Date Hired</th>
                  <th className="px-4 py-3 text-center">Tenure</th>
                  <th className="px-4 py-3 text-right">Monthly Basic</th>
                  <th className="px-4 py-3 text-right">Half Month</th>
                  <th className="px-4 py-3 text-right">Bonus Amount</th>
                  <th className="px-4 py-3 text-right">FCH Loan</th>
                  <th className="px-4 py-3 text-right">Net Bonus</th>
                </tr>
              </thead>
  
              <tbody>
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                      No bonuses generated yet
                    </td>
                  </tr>
                )}
  
                {employees.map((bonus, index) => (
                  <tr
                    key={bonus.employeeCode}
                    className="border-t hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      {bonus.fullName}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {bonus.employementDate
                        ? new Date(bonus.employementDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {bonus.tenureYears}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ₱{Number(bonus.basicSalary).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ₱{(Number(bonus.basicSalary) / 2).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ₱{Number(bonus.bonusAmount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      ₱{Number(bonus.fchLoan).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      ₱{Number(bonus.netAmount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
  
              {employees.length > 0 && (
              <tfoot className="bg-gray-100 border-t sticky bottom-0 z-10">
                <tr className="font-semibold text-gray-700">
                  <td colSpan={4} className="px-4 py-3 text-right">
                    TOTAL
                  </td>
  
                  <td className="px-4 py-3 text-right">
                    ₱{totals.basicSalary.toLocaleString()}
                  </td>
  
                  <td className="px-4 py-3 text-right">
                    ₱{totals.halfMonth.toLocaleString()}
                  </td>
  
                  <td className="px-4 py-3 text-right">
                    ₱{totals.bonusAmount.toLocaleString()}
                  </td>
  
                  <td className="px-4 py-3 text-right text-red-600">
                    ₱{totals.fchLoan.toLocaleString()}
                  </td>
  
                  <td className="px-4 py-3 text-right text-green-700">
                    ₱{totals.netAmount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
  
            </table>
          </div>
        </div>
  
  
      </div>
    )
}