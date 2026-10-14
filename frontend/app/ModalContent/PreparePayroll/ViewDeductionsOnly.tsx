import { useAuth } from "@/app/components/UserContext";

import { useDeductionsOnly } from "@/app/hooks/usePreparePayroll";
import { formatCurrency } from "@/app/utils/currencyConverter";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";


export default function ViewDeductionsOnly() {
  const { user } = useAuth();
  const companyId = user?.company_id;

  const { data: deductions = [], isLoading } = useDeductionsOnly(companyId);

  const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Deductions-${companyId}`,
    });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">

      <div className="flex justify-end">
    
        <button
          onClick={handlePrint}
          className="bg-blue-700 py-2 px-8 rounded text-white font-bold hover:bg-blue-500">
          Print
        </button>
        
      </div>

      <div ref={printRef} className="overflow-x-auto p-2 print-deductions">

        <h2 className="text-lg font-bold">
          COMPANY - {companyId}
        </h2>

        <table className="min-w-full text-sm text-center border border-gray-300 border-collapse">
          <thead className="bg-gray-700 text-white">
            <tr>
              <th>No</th>
              <th className="p-2">Employee</th>
              <th>SSS</th>
              <th>PhilHealth</th>
              <th>Pag-IBIG</th>
              <th>WTAX</th>
              <th>FCH Loan</th>
              <th>SSS Loan</th>
              <th>Pag-IBIG Loan</th>
              <th>RFC Loan</th>
              <th>ARE Loan</th>
              <th >TOTAL</th>
            </tr>
          </thead>

          <tbody>
            {deductions.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-6 text-gray-400">
                  No data available
                </td>
              </tr>
            ) : (
              deductions.map((emp,index) => (
                
                <tr key={emp.EmpCodeId} className="border-t border-gray-300">
                  <td className="border border-gray-300">{index + 1}</td>
                  <td className="p-2 text-center">
                    {emp.EmpCode.Lastname}, {emp.EmpCode.Firstname}
                  </td>
                  <td>{emp.sss_contrib_employee}</td>
                  <td>{emp.philhealth_contrib_employee}</td>
                  <td>{emp.pagibig_contrib_employee}</td>
                  <td>{emp.wtax}</td>
                  <td>{emp.fch_loan}</td>
                  <td>{emp.sss_loan}</td>
                  <td>{emp.pagibig_loan}</td>
                  <td>{emp.rfc_loan}</td>
                  <td>{emp.are_loan}</td>
                  <td className="font-semibold">
                    {formatCurrency(emp.total_deductions)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}