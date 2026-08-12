type PayrollHalf = "FIRST_HALF" | "SECOND_HALF";

export type TableHeaderProps = {
  children: React.ReactNode;
};



export function getPayrollHalf(paycode: string): PayrollHalf {
  const parts = paycode.split("-");
  const startDay = Number(parts[1]);

  return startDay === 1
    ? "FIRST_HALF"
    : "SECOND_HALF";
}


export function TableHeader({
  children,
}: TableHeaderProps) {
  return (
    <th className="border border-slate-400 px-3 py-3 text-center font-bold italic">
      {children}
    </th>
  );
}


export function formatCategoryTitle(
  value: string
): string {
  return value
    .replace(/_/g, " ")
    .toUpperCase();
}



type EmployeeHeaderProps = {
  children: React.ReactNode;
};

export function EmployeeHeader({
  children,
}: EmployeeHeaderProps) {
  return (
    <th className="border border-slate-400 px-2 py-2 text-center font-semibold text-slate-700 whitespace-nowrap">
      {children}
    </th>
  );
}




export const TempReplaceCompanyName = (company_id:string): string => {
    if(company_id == 'EMB'){
        return 'EMB Capital Lending Corporation'
    }
    else if(company_id == 'FCH'){
        return 'FCH Finance Corporation'
    }
    else if(company_id == 'RFC'){
        return 'RFC Finance Corporation'
    }
    return company_id;
}