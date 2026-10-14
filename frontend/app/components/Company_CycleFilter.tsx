import { useCompaniesByCycle, useCompanyCycles } from "../hooks/useGeneral";
import { PayrollEmployee } from "../types/preparePayroll";

interface Props {
  cycle: string;
  company: string;
  payrollData: PayrollEmployee[];
  onCycleChange: (cycle: string) => void;
  onCompanyChange: (companyCode: string) => void;
}

export default function CompanyCycleFilter({
  cycle,
  company,
  payrollData,
  onCycleChange,
  onCompanyChange,
}: Props) {

  const { data: cycles } = useCompanyCycles();
  const { data: companies, isLoading } = useCompaniesByCycle(cycle);

  // companies that actually exist in payroll employees
  const payrollCompanyIds = new Set(
    payrollData
      .map((emp) => emp.EmpCode.BranchCode?.company_id)
      .filter((c): c is string => Boolean(c))
  );

  const filteredCompanies =
    companies?.data.filter((c) => payrollCompanyIds.has(c.CompanyCode)) ?? [];

  return (
    <div className="flex gap-3">

      {/* Cycle Select */}
      <select
        value={cycle}
        onChange={(e) => onCycleChange(e.target.value)}
        className="border border-gray-400 rounded-md px-4 py-2 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-blue-800"
      >
        <option value="">Select Cycle</option>

        {cycles?.data.map((c: { CompanyCycle: string }) => (
          <option key={c.CompanyCycle} value={c.CompanyCycle}>
            {c.CompanyCycle}
          </option>
        ))}
      </select>

      {/* Company Select */}
      <select
        value={company}
        onChange={(e) => onCompanyChange(e.target.value)}
        disabled={!cycle || isLoading}
        className="border border-gray-400 rounded-md px-4 py-2 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-blue-800"
      >
        <option value="">All Companies</option>

        {filteredCompanies.map((c) => (
          <option key={c.CompanyCode} value={c.CompanyCode}>
            {c.CompanyCode} — {c.CompanyName}
          </option>
        ))}
      </select>

    </div>
  );
}