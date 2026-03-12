import { useDisplayVariance } from "@/app/hooks/useVariance";





interface Props {
    companyCode: string;
    paycode: string;
  }
  
  export default function CompanyVariance({ companyCode }: Props) {

    const currencyFormatter = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    

    const formatCurrency = (value?: number | null): string => {
        return currencyFormatter.format(Number(value ?? 0));
      };
  
    const { data } = useDisplayVariance();
  
    const company = data?.company_variance.find(
      (c) => c.company === companyCode
    );
  
    if (!company) return null;
  
    return (
      <div className="mt-6">
  
        <h2 className="font-semibold mb-2">{company.company}</h2>
  
        <table className="w-full border-collapse text-[.8rem] text-center">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Payroll Period</th>
              <th className="border p-2">Total Basic</th>
              <th className="border p-2">SSS Employee</th>
              <th className="border p-2">SSS Employer</th>
              <th className="border p-2">Philhealth Employee</th>
              <th className="border p-2">Philhealth Employer</th>
            </tr>
          </thead>
  
          <tbody>
            {company.rows.map((row, i) => (
              <tr key={i}>
                <td className="border p-2">{row.PayCycle}</td>
                <td className="border p-2">{formatCurrency(row.total_basic_salary)}</td>
                <td className="border p-2">{formatCurrency(row.Total_SSSContributionEmployee)}</td>
                <td className="border p-2">{formatCurrency(row.Total_SSSContributionEmployer)}</td>
                <td className="border p-2">{formatCurrency(row.Total_PhilhealthContributionEmployee)}</td>
                <td className="border p-2">{formatCurrency(row.Total_PhilhealthContributionEmployer)}</td>
              </tr>
            ))}
          </tbody>
        </table>
  
      </div>
    );
  }