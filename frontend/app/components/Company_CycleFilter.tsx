import { useCompaniesByCycle, useCompanyCycles } from "../hooks/useGeneral";

interface Props {
  cycle: string;
  company: string;
  onCycleChange: (cycle: string) => void;
  onCompanyChange: (companyCode: string) => void;
}

export default function CompanyCycleFilter({
    cycle,
    company,
    onCycleChange,
    onCompanyChange,
  }: Props) {
  
    const { data: cycles } = useCompanyCycles();
    const { data, isLoading } = useCompaniesByCycle(cycle);
  
    const grouped = data?.data.reduce((acc, company) => {
      const group = company.CompanyCycle ?? "Other";
      if (!acc[group]) acc[group] = [];
      acc[group].push(company);
      return acc;
    }, {} as Record<string, typeof data.data>);
  
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
  
          {grouped &&
            Object.entries(grouped).map(([group, companies]) => (
              <optgroup key={group} label={group}>
                {companies.map((c) => (
                  <option key={c.CompanyCode} value={c.CompanyCode}>
                    {c.CompanyCode} — {c.CompanyName}
                  </option>
                ))}
              </optgroup>
            ))}
  
        </select>
  
      </div>
    );
  }