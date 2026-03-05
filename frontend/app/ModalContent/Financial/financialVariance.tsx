import { useDisplayVariance } from "@/app/hooks/useVariance";


interface props{
  paycode:string;
}

export default function FinancialVarianceModal({paycode}:props) {
    const { data, isLoading } = useDisplayVariance();
  
    if (isLoading || !data?.total_variance) {
        return <div className="p-4 text-sm text-gray-500">Loading...</div>;
      }
      
  
      const rows = data.total_variance;

  
    const currencyFormatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  
    const formatCurrency = (value?: number | null): string => {
      return currencyFormatter.format(Number(value ?? 0));
    };
  
    const formatSigned = (value?: number | null) => {
      const numeric = Number(value ?? 0);
      const formatted = formatCurrency(Math.abs(numeric));
      return numeric < 0 ? `(${formatted})` : formatted;
    };
  
    return (
      <div className="p-6">
        
        <h2 className="text-lg font-semibold mb-4">
          FOR THE PERIOD: {paycode}
        </h2>
  
        <table className="w-full border-collapse text-sm">
          <thead className="text-center">
            <tr className="bg-gray-100 border border-slate-100">
              <th className="border border-slate-300 p-2">Payroll Period</th>
              <th className="border border-slate-300 p-2">Basic</th>
              <th className="border border-slate-300 p-2">SSS Employee</th>
              <th className="border border-slate-300 p-2">SSS Employer</th>
              <th className="border border-slate-300 p-2">PhilHealth Employee</th>
              <th className="border border-slate-300 p-2">PhilHealth Employer</th>
            </tr>
          </thead>
  
          <tbody className="text-center">
          {rows.map((row, index) => {
    const isVariance = row.PayCycle === "VARIANCE";
    const isCurrent = index === rows.length - 1;
  
              return (
                <tr
                key={row.id}
                  className={`border border-slate-300 ${
                    isVariance
                      ? "border-t-2 border-slate-300 font-bold bg-gray-100"
                      : isCurrent
                      ? "bg-blue-50 font-medium"
                      : ""
                  }`}
                >
                  <td className="border border-slate-300 p-2">{row.PayCycle}</td>
                  <td className="border border-slate-300 p-2">
                      {formatCurrency(Number(row.total_basic_salary))}
                    </td>

                    <td className="border border-slate-300 p-2">
                      {formatCurrency(Number(row.Total_SSSContributionEmployee))}
                    </td>

                    <td className="border border-slate-300 p-2">
                      {formatCurrency(Number(row.Total_SSSContributionEmployer))}
                    </td>

                    <td className="border border-slate-300 p-2">
                      {formatCurrency(Number(row.Total_PhilhealthContributionEmployee))}
                    </td>

                    <td className="border border-slate-300 p-2">
                      {formatCurrency(Number(row.Total_PhilhealthContributionEmployer))}
                    </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
  