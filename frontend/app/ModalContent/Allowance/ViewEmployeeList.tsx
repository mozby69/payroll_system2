import { AllowanceSummary, ArchiveAllowance } from "@/app/types/allowanceType";


import { useFetchArchiveAllowanceModal } from "@/app/hooks/useAllowance";



interface ViewEmployeeListAllowanceProps {
    allowanceSummary: AllowanceSummary;
    onClose: () => void;
  }


export const ViewEmployeeListAllowance:React.FC<ViewEmployeeListAllowanceProps> = ({onClose,allowanceSummary}) => {
    const { data, isLoading } = useFetchArchiveAllowanceModal(
        allowanceSummary.selectedMonth
      );

      if (isLoading) {
        return <div>Loading...</div>;
      }
    
      const list = data?.data ?? [];


      return (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Employees – {allowanceSummary.allowance_name}
          </h2>
    
          <table className="w-full border border-slate-200 rounded-md shadow">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-2 text-left">Emp Code</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-right">Cash</th>
                <th className="p-2 text-right">Ecola</th>
                <th className="p-2 text-right">Deduction</th>
                <th className="p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={`${row.EmpCode}-${row.createdAt}`}>
                  <td className="p-2">{row.EmpCode}</td>
                  <td className="p-2">{row.name}</td>
                  <td className="p-2 text-right">{row.cash_allowance ?? 0}</td>
                  <td className="p-2 text-right">{row.ecola ?? 0}</td>
                  <td className="p-2 text-right">{row.totalDeduction ?? 0}</td>
                  <td className="p-2 text-right">{row.total ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
        </div>
      );
}