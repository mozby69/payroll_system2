import { VarianceEmployee } from "../types/varianceType"
import "../../styles/variancePrint.css";

interface VarianceAnalysis {
  newEmployees: VarianceEmployee[]
  salaryIncrease: VarianceEmployee[]
  resignedEmployees: VarianceEmployee[]
  specialLeaveEmployees: VarianceEmployee[]

  sssVariance: VarianceEmployee[]
  sssEmployerVariance: VarianceEmployee[]

  philVariance: VarianceEmployee[]
  philEmployerVariance: VarianceEmployee[]

  pagVariance: VarianceEmployee[]
  pagEmployerVariance: VarianceEmployee[]

  taxVariance: VarianceEmployee[]
}
interface PrintProps {
  varianceAnalysis: VarianceAnalysis
  formatCurrency: (val?: number | null) => string
}

export default function VariancePrintable({ varianceAnalysis, formatCurrency }: PrintProps) {



    const tdStyle = {
        padding: "6px",
        border: "1px solid #333333"
    }

  const renderRows = (title: string, data: VarianceEmployee[]) => {
    if (!data || data.length === 0) return null

    return (
      <>
        <tr>
        <td colSpan={3} style={{ ...tdStyle, fontWeight: "bold" }}>
            {title}
        </td>
        </tr>

        {data.map((emp) => (
        <tr key={emp.empId}>
            <td style={tdStyle}>{emp.name}</td>
            <td style={{ ...tdStyle, textAlign: "right" }}>
            {formatCurrency(emp.previousBasic ?? emp.currentBasic ?? 0)}
            </td>
            <td style={{ ...tdStyle, textAlign: "right" }}>
            {formatCurrency(emp.difference ?? 0)}
            </td>
        </tr>
        ))}
      </>
    )
  }

  return (
    <div style={{ fontFamily: "Arial" }}>
      <h2 style={{ textAlign: "start" }}>Variance Breakdown Report </h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }} border={1}>
        <thead>
          <tr  className="bg-mainLightGray text-mainLight">
            <th className="border border-mainGray" style={{ padding: "8px" , textAlign: "left"}}>Employee</th>
            <th className="border border-mainGray" style={{ padding: "8px" }}>Amount</th>
            <th className="border border-mainGray" style={{ padding: "8px" }}>Difference</th>
          </tr>
        </thead>

        <tbody>

          {renderRows("New Employees", varianceAnalysis.newEmployees)}
          {renderRows("Salary Increase", varianceAnalysis.salaryIncrease)}
          {renderRows("Resigned Employees", varianceAnalysis.resignedEmployees)}
          {renderRows("Special Leave", varianceAnalysis.specialLeaveEmployees)}

          {renderRows("SSS Employee", varianceAnalysis.sssVariance)}
          {renderRows("SSS Employer", varianceAnalysis.sssEmployerVariance)}

          {renderRows("Philhealth Employee", varianceAnalysis.philVariance)}
          {renderRows("Philhealth Employer", varianceAnalysis.philEmployerVariance)}

          {renderRows("Pagibig Employee", varianceAnalysis.pagVariance)}
          {renderRows("Pagibig Employer", varianceAnalysis.pagEmployerVariance)}

          {renderRows("Tax", varianceAnalysis.taxVariance)}

        </tbody>
      </table>
    </div>
  )
}