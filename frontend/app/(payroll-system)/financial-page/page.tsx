"use client";
import SpreadSheet, { SpreadsheetRow } from "@/app/components/reports/SpreadSheet";
import SweetAlert from "@/app/components/Swal";
import {  useDisplayForApprovalPayroll, useDisplayPayroll, useSaveFinalPayroll } from "@/app/hooks/usePayrollArchive";





export default function FinancialPage(){
      const { data, isLoading } = useDisplayForApprovalPayroll();
      const savePayroll = useSaveFinalPayroll();

     const rows: SpreadsheetRow[] = (data?.data ?? []).map((emp) => ({
        name: `${emp.EmpCode.Lastname}, ${emp.EmpCode.Firstname}`,
        basicPay: emp.semi_monthly,
        overtime: emp.overtime,
        late: emp.late_count,
        absence: emp.absence,
        gross: emp.gross_pay,
        wtax: emp.wtax,
        sss: emp.sss_contrib_employee,
        philhealth: emp.philhealth_contrib,
        pagibig: emp.pagibig_contrib_employee,
        arE: 0,
        fch: 0,
        salaryLoan: 0,
        calamityLoan: 0,
        pagibigSalaryLoan: 0,
        netPayable: emp.net_pay,
        sssEmployer: emp.sss_contrib_employer,
        philEmployer: emp.philhealth_contrib,
        pagibigEmployer: emp.pagibig_contrib_employer,
    
      }));


      const handleSave = () => {
        SweetAlert.confirmationAlert(
          "Confirm Save Payroll",
          "Are you sure you want to save this payroll?",
          () => {
            savePayroll.mutate();
          }
        );
      };
    
      


    return (
        <div className="p-4">
            
            <div className="flex justify-end px-4 gap-x-4">
            <button className="bg-red-700 hover:bg-red-400 px-4 py-2 rounded-lg text-white">Recheck</button>
            <button onClick={handleSave}
                    disabled={savePayroll.isPending}
                    className="rounded-lg bg-green-600 hover:bg-green-500 px-6 py-2 text-sm text-white disabled:opacity-50">
                    {savePayroll.isPending ? "Saving..." : "Save Payroll"}
            </button>
            </div>
        
          
              <SpreadSheet data={rows} />
        </div>
    );
}