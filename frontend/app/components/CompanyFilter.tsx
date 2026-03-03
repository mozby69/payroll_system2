import { useCompaniesByCycle } from "../hooks/useGeneral";

// components/CompanyFilter.tsx
interface Props {
  value: string;
  cycle:string;
  onChange: (companyCode: string) => void;
}

export default function CompanyFilter({ value, cycle,onChange }: Props) {
  const { data, isLoading } = useCompaniesByCycle(cycle);

  const grouped = data?.data.reduce((acc, company) => {
    const cycle = company.CompanyCycle ?? "Other";
    if (!acc[cycle]) acc[cycle] = [];
    acc[cycle].push(company);
    return acc;
  }, {} as Record<string, typeof data.data>);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-400 rounded-md px-4 py-2 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-blue-800"
      disabled={isLoading || !cycle}
    >
      <option value="">All Companies</option>
      {grouped &&
        Object.entries(grouped).map(([cycle, companies]) => (
          <optgroup key={cycle} label={cycle}>
            {companies.map((c) => (
              <option key={c.CompanyCode} value={c.CompanyCode}>
                {c.CompanyCode} — {c.CompanyName}
              </option>
            ))}
          </optgroup>
        ))}
    </select>
  );
}