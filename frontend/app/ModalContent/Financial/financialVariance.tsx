import { useDisplayVariance } from "@/app/hooks/useVariance";



export default function FinancialVarianceModal() {
    const { data, isLoading } = useDisplayVariance();
  
    if (isLoading || !data?.current_period) {
      return <div className="p-4 text-sm text-gray-500">Loading...</div>;
    }
  
    const current = data.current_period;
    const previous = current.previous;
  
    const formatCurrency = (value: number) =>
      value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  
    const parseNumber = (value: string) => Number(value ?? 0);
  
    const variance = {
      basic:
        current.total_semi_monthly -
        previous.reduce(
          (sum, p) => sum + parseNumber(p.total_basic_salary),
          0
        ),
      sssEmployee:
        current.total_sss_employee -
        previous.reduce(
          (sum, p) => sum + parseNumber(p.Total_SSSContributionEmployee),
          0
        ),
      sssEmployer:
        current.total_sss_employer -
        previous.reduce(
          (sum, p) => sum + parseNumber(p.Total_SSSContributionEmployer),
          0
        ),
      phil:
        current.total_phil -
        previous.reduce(
          (sum, p) => sum + parseNumber(p.Total_PhilhealthContributionEmployee),
          0
        ),
    };
  
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          FOR THE PERIOD: {current.paycode}
        </h2>
  
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border">
              <th className="border p-2 text-left">PayCycle</th>
              <th className="border p-2 text-right">Basic</th>
              <th className="border p-2 text-right">SSS Employee</th>
              <th className="border p-2 text-right">SSS Employer</th>
              <th className="border p-2 text-right">PhilHealth</th>
            </tr>
          </thead>
          <tbody>
            {previous.map((p) => (
              <tr key={p.PayCycle} className="border">
                <td className="border p-2">{p.PayCycle}</td>
                <td className="border p-2 text-right">
                  {formatCurrency(parseNumber(p.total_basic_salary))}
                </td>
                <td className="border p-2 text-right">
                  {formatCurrency(
                    parseNumber(p.Total_SSSContributionEmployee)
                  )}
                </td>
                <td className="border p-2 text-right">
                  {formatCurrency(
                    parseNumber(p.Total_SSSContributionEmployer)
                  )}
                </td>
                <td className="border p-2 text-right">
                  {formatCurrency(
                    parseNumber(p.Total_PhilhealthContributionEmployee)
                  )}
                </td>
              </tr>
            ))}
  
            {/* Current Period */}
            <tr className="border bg-blue-50 font-medium">
              <td className="border p-2">{current.paycode}</td>
              <td className="border p-2 text-right">
                {formatCurrency(current.total_semi_monthly)}
              </td>
              <td className="border p-2 text-right">
                {formatCurrency(current.total_sss_employee)}
              </td>
              <td className="border p-2 text-right">
                {formatCurrency(current.total_sss_employer)}
              </td>
              <td className="border p-2 text-right">
                {formatCurrency(current.total_phil)}
              </td>
            </tr>
  
            {/* Variance Row */}
            <tr className="border-t-2 border-black font-bold bg-gray-100">
              <td className="border p-2">VARIANCE</td>
              <td className="border p-2 text-right">
                {formatCurrency(variance.basic)}
              </td>
              <td className="border p-2 text-right">
                {formatCurrency(variance.sssEmployee)}
              </td>
              <td className="border p-2 text-right">
                {formatCurrency(variance.sssEmployer)}
              </td>
              <td className="border p-2 text-right">
                {formatCurrency(variance.phil)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  