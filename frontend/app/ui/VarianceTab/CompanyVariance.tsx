import { useDisplayVariance, useDisplayVarianceEmp } from "@/app/hooks/useVariance"
import { VarianceEmployee } from "@/app/types/varianceType"

interface Props {
  companyCode: string
  paycode: string
}

export default function CompanyVariance({ companyCode }: Props) {

  const { data: varianceData } = useDisplayVariance(companyCode)
  const { data: varianceEmpData } = useDisplayVarianceEmp(companyCode)

  const company = varianceData?.company_variance?.[0]
  const includePagibigAndTax = varianceData?.includePagibigAndTax
  const varianceAnalysis = varianceEmpData?.variance_analysis

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  const formatCurrency = (value?: number | null): string => {
    return currencyFormatter.format(Number(value ?? 0))
  }

  if (!company) return null

  return (
    <div className="mt-6">
      <table className="w-full border-collapse text-[.8rem] text-center">
        <thead>
          <tr className="bg-mainLightGray text-mainLight">
            <th className="border p-2">Payroll Period</th>
            <th className="border p-2">Total Basic</th>
            <th className="border p-2">SSS Employee</th>
            <th className="border p-2">SSS Employer</th>
            <th className="border p-2">Philhealth Employee</th>
            <th className="border p-2">Philhealth Employer</th>

            {includePagibigAndTax && (
              <>
                <th className="border p-2">Pagibig Employee</th>
                <th className="border p-2">Pagibig Employer</th>
                <th className="border p-2">Withholding Tax</th>
              </>
            )}
          </tr>
        </thead>

        <tbody>
          {company.rows.map((row, i) => (
            <tr key={i}>
              <td className="border p-2">{row.PayCycle}</td>

              <td className="border p-2">
                {formatCurrency(row.total_basic_salary)}
              </td>

              <td className="border p-2">
                {formatCurrency(row.Total_SSSContributionEmployee)}
              </td>

              <td className="border p-2">
                {formatCurrency(row.Total_SSSContributionEmployer)}
              </td>

              <td className="border p-2">
                {formatCurrency(row.Total_PhilhealthContributionEmployee)}
              </td>

              <td className="border p-2">
                {formatCurrency(row.Total_PhilhealthContributionEmployer)}
              </td>

              {includePagibigAndTax && (
                <>
                  <td className="border p-2">
                    {formatCurrency(row.Total_PagibigContributionEmployee)}
                  </td>

                  <td className="border p-2">
                    {formatCurrency(row.Total_PagibigContributionEmployer)}
                  </td>

                  <td className="border p-2">
                    {formatCurrency(row.total_wtax)}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>












     {/* Ang Breakdown display */}


      {varianceAnalysis && (
        <div className="mt-6 text-left">

          <h3 className="font-semibold text-lg text-mainGray mb-3">
            Variance Breakdown
          </h3>

          <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
            {/* NEW EMPLOYEES */}
            {varianceAnalysis.newEmployees.length > 0 && (
              <VarianceList
                title="New Employees"
                employees={varianceAnalysis.newEmployees}
                color="text-mainhighlight"
                render={(emp) =>
                  `${emp.name} – ${formatCurrency(emp.currentBasic)}`
                }
              />
            )}
            {/* SALARY INCREASE */}
            {varianceAnalysis.salaryIncrease.length > 0 && (
              <VarianceList
                title="Regularization Increase"
                employees={varianceAnalysis.salaryIncrease}
                color="text-mainhighlight"
                render={(emp) =>
                  `${emp.name} – Increase: ${formatCurrency(emp.difference)}`
                }
              />
            )}
            {/* RESIGNED */}
            {varianceAnalysis.resignedEmployees.length > 0 && (
              <VarianceList
                title="Resigned Employees"
                employees={varianceAnalysis.resignedEmployees}
                color="text-mainhighlight"
                render={(emp) =>
                  `${emp.name} – Previous: ${formatCurrency(emp.previousBasic)}`
                }
              />
            )}
            {varianceAnalysis?.sssVariance?.length > 0 && (
              <VarianceList
                title="SSS Employee Variance"
                employees={varianceAnalysis.sssVariance}
                color="text-mainhighlight"
                render={(emp) =>
                  `${emp.name} – Difference: ${formatCurrency(emp.difference)}`
                }
              />
            )}
            {varianceAnalysis?.sssEmployerVariance?.length > 0 && (
              <VarianceList
                title="SSS Employer Variance"
                employees={varianceAnalysis.sssEmployerVariance}
                color="text-mainhighlight"
                render={(emp) =>
                    `${emp.name} – Difference: ${formatCurrency(emp.difference)}`
                  }
              />
            )}
             {varianceAnalysis?.philVariance?.length > 0 && (
              <VarianceList
                title="Philhealth Employee Variance"
                employees={varianceAnalysis.philVariance}
                color="text-mainhighlight"
                render={(emp) =>
                    `${emp.name} – Difference: ${formatCurrency(emp.difference)}`
                  }
              />
            )}
            {varianceAnalysis?.philEmployerVariance?.length > 0 && (
              <VarianceList
                title="Philhealth Employer Variance"
                employees={varianceAnalysis.philEmployerVariance}
                color="text-mainhighlight"
                render={(emp) =>
                    `${emp.name} – Difference: ${formatCurrency(emp.difference)}`
                  }
              />
            )}
            
             {varianceAnalysis?.pagVariance?.length > 0 && (
              <VarianceList
                title="Pag-ibig Employee Variance"
                employees={varianceAnalysis.pagVariance}
                color="text-mainhighlight"
                render={(emp) =>
                    `${emp.name} – Difference: ${formatCurrency(emp.difference)}`
                  }
              />
            )}

              {varianceAnalysis?.pagEmployerVariance?.length > 0 && (
              <VarianceList
                title="Pag-ibig Employer Variance"
                employees={varianceAnalysis.pagEmployerVariance}
                color="text-mainhighlight"
                render={(emp) =>
                    `${emp.name} – Difference: ${formatCurrency(emp.difference)}`
                  }
              />
            )}

              {varianceAnalysis?.taxVariance?.length > 0 && (
              <VarianceList
                title="With Holding Tax Employee Variance"
                employees={varianceAnalysis.taxVariance}
                color="text-mainhighlight"
                render={(emp) =>
                    `${emp.name} – Difference: ${formatCurrency(emp.difference)}`
                  }
              />
            )}
          </div>

        </div>
      )}




    </div>
  )
}











interface VarianceListProps {
  title: string
  employees: VarianceEmployee[]
  color: string
  render: (emp: VarianceEmployee) => string
}

function VarianceList({ title, employees, color, render }: VarianceListProps) {

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  const formatCurrency = (value?: number | null): string => {
    return currencyFormatter.format(Number(value ?? 0))
  }

  const subtotal = employees.reduce((acc, emp) => {
    if (emp.difference != null) return acc + Number(emp.difference)
    if (emp.currentBasic != null) return acc + Number(emp.currentBasic)
    if (emp.previousBasic != null) return acc + Number(emp.previousBasic)
    return acc
  }, 0)

  return (
    <div className="mb-4 shadow-lg p-4">

      <h4 className={`font-medium ${color} pb-2 font-semibold`}>
        {title}
      </h4>

      <ul className="text-[.8rem] list-disc pl-5 h-60 overflow-y-auto">
        {employees.map((emp) => (
          <li key={emp.empId}>
            {render(emp)}
          </li>
        ))}
      </ul>

      <div className="border-t font-semibold p-2 bg-mainLight shadow-md text-mainhighlight text-[.8rem]">
        Subtotal: {formatCurrency(subtotal)}
      </div>

    </div>
  )
}