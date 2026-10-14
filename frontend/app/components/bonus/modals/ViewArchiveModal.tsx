import { useGetEmployeeGeneratedBonus } from "@/app/hooks/useBonus"
import React, { useEffect, useState } from "react"
import { useAuth } from "../../UserContext"
import { useBranchGroups } from "@/app/hooks/useBranchGroup"


type ViewProps = {
    id: number | undefined
    company: string | undefined
}

export default function ViewArchiveModal({id, company} : ViewProps){
    const [selectedCompany, setSelectedCompany] = useState<string | undefined>()
    const { user } = useAuth()
    const companyCode = company;
    const companyId = user?.company_id ?? company;
    const [selectedGroup, setSelectedGroup] = useState<number | undefined>()
    const { data } =
      useGetEmployeeGeneratedBonus(companyId, selectedGroup, id)
    const summary = data?.data.summary
    const companies = data?.data.companies ?? []
    const employees = data?.data.employees ?? []
    const variance = data?.data.variance
    const { data: groupBranch } = useBranchGroups(); // to get groups
   const groups = groupBranch?.groups ?? [];

      useEffect(() => {
        if (!selectedGroup && groups?.length) {
          setSelectedGroup(groups[0].id)
        }
      }, [groups])
  
  

          
    const varianceEmployees = variance?.varianceEmployees ?? []

    const varianceTotal = variance?.totalVarianceBasicSalary ?? 0
    
    const varianceBreakdownTotal = varianceEmployees.reduce((sum, e) => {
      const amount = Number(e.basic_salary) || 0
    
      return e.type === "ARCHIVE_NO_BONUS"
        ? sum - amount
        : sum + amount
    }, 0) 
    
    const remainingVariance = varianceTotal - varianceBreakdownTotal
  
  // Derive active company safely
  const activeGroup =
    selectedGroup ?? groups
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
         <div>
              {/* Company Buttons */}
              {( companyCode === "FCH" && groups.length > 0  ) && (
                <div className="flex gap-3">
                  {groups.map(branch => {
                    const isActive =
                    activeGroup === branch.id
                    return (
                      <button
                        key={branch.name}
                        onClick={() =>
                          setSelectedGroup(branch.id)
                        }
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {branch.name}
                      </button>
                    )
                  })}
                </div>
              )}
          </div>
  
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
        {/* {companies.length > 0 && (
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
        )} */}
  
        {/* Table */}
        <div className="bg-white border rounded-xl shadow-sm flex flex-col max-h-150">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm border-collapse table-fixed" >
  
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
                 <th className="px-4 py-3 text-right">Remarks</th>

                </tr>
              </thead>
  
              <tbody>
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-6 text-center text-gray-500">
                      No bonuses generated yet
                    </td>
                  </tr>
                )}
  
                {employees.map((bonus, index) => (
                    <tr
                    key={bonus.employeeCode}
                    className={`border-t hover:bg-gray-50 transition-colors cursor-pointer ${
                      bonus.hasLeave  ? "bg-red-100 hover:bg-red-50" : ""
                    }`}
                    title={bonus.remarks ?? ""}
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
                    <td
                      className="px-4 py-3 font-medium max-w-sm truncate text-left">
                      {bonus.remarks}
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
                  <td></td>
                </tr>
              </tfoot>
            )}
  
            </table>
          </div>
        </div>

          {/*Varience */}
                {employees.length >= 1 && (
                    <div className="mt-4 bg-gray-50 border rounded-lg p-4 max-w-180 ">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                          Payroll Comparison
                        </h3>
                        <div className="grid grid-cols-2 gap-y-1 text-sm">
                          <span>Half Month</span>
                          <span className="text-right">₱{totals.halfMonth.toLocaleString()}</span>
        
                          <span>Payroll {variance?.prevPayrollDate}</span>
                          <span className="text-right">
                             ₱{Number(variance?.prevPayroll ?? 0).toLocaleString()}
                          </span>
                        </div>
        
                        <div className="border-t my-2"></div>
        
                        <div className="grid grid-cols-2 text-sm font-semibold">
                          <span className="text-red-600">VARIANCE</span>
                          <span className="text-right">₱{varianceTotal.toLocaleString()}</span>
                        </div>
        
                        {varianceEmployees.length > 0 && (
                          
                          <>
                            <div className="border-t my-2"></div>
                            <div className="grid grid-cols-3 gap-y-1 text-sm">
                              {varianceEmployees.map(emp => {
                                const amount = Number(emp.basic_salary || 0)
        
                                const isAddition =
                                  emp.type === "BONUS_NO_ARCHIVE" ||
                                  emp.type === "SALARY_CHANGED"
                                return (
                                  <React.Fragment key={emp.EmpCode}>
                                   <span className="pl-2 col-span-2" >
                                    {emp.remarks ? emp.remarks + ": " : "UNKOWN: "} {emp.name}  {emp.date ? "- (" +emp.date +")" : ""}
                                  </span>
                                  <span
                                      className={`text-right ${
                                        isAddition ? "text-green-600" : "text-red-600"
                                      }`}
                                    >
                                      {isAddition
                                        ? `(₱${amount.toLocaleString()})`
                                        : `₱${amount.toLocaleString()}`}
                                    </span>
                                  </React.Fragment>
                                )
                              })}
                            </div>
                          </>
                        )}
        
                        <div className="border-t my-2"></div>
        
                        <div className="grid grid-cols-2 text-sm font-semibold">
                          <span>Total Variance Balance</span>
                          <span
                            className={`text-right ${
                              remainingVariance === 0 ? "text-green-700" : "text-red-700"
                            }`}
                          >
                            {remainingVariance === 0
                              ? "(₱0.00)"
                              : `₱${remainingVariance.toLocaleString()}`}
                          </span>
                        </div>
                    </div>
                )}
  
  
      </div>
    )
}