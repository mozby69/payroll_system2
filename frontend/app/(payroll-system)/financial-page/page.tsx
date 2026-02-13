"use client";
import RequestModal from "@/app/components/Modal";
import SpreadSheet, { SpreadsheetRow } from "@/app/components/reports/SpreadSheet";
import SweetAlert from "@/app/components/Swal";
import { toNumber } from "@/app/helper/SpreadsheetHelper";
import {  useDisplayForApprovalPayroll, useReCheckPayroll, useSaveFinalPayroll } from "@/app/hooks/usePayrollArchive";

import FinancialVarianceModal from "@/app/ModalContent/Financial/financialVariance";
import { useState } from "react";





export default function FinancialPage(){

      const { data, isLoading } = useDisplayForApprovalPayroll();
      const isEmpty = !data || !data.data || data.data.length === 0;
      const savePayroll = useSaveFinalPayroll();
      const recheckPayroll = useReCheckPayroll();
      const [isModalOpen, setIsModalOpen] = useState(false);

      const payCode = data?.data?.[0]?.PayCode ?? "-";


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

        // Loan Code ↓
        rfc: emp.rfc_loan,
        fch: emp.fch_loan,
        salaryLoan: emp.sss_loan,
        pagibigSalaryLoan: emp.pagibig_loan,
        // Loan Code ↑
        
        calamityLoan: 0,
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

      

      const handleRecheck = () => {
        SweetAlert.confirmationAlert(
          "Confirm Reopen Payroll",
          "Are you sure you want to this recheck payroll?",
          () => {
            recheckPayroll.mutate();
          }
        );
      };
    
    
      const totals = rows.reduce(
          (acc, row) => {
            acc.basicPay += toNumber(row.basicPay);
            acc.overtime += toNumber(row.overtime);
            acc.late += toNumber(row.late);
            acc.absence += toNumber(row.absence);
            acc.gross += toNumber(row.gross);
            acc.wtax += toNumber(row.wtax);
            acc.sss += toNumber(row.sss);
            acc.philhealth += toNumber(row.philhealth);
            acc.pagibig += toNumber(row.pagibig);
            acc.netPayable += toNumber(row.netPayable);
            acc.sssEmployer += toNumber(row.sssEmployer);
            acc.philEmployer += toNumber(row.philEmployer);
            acc.pagibigEmployer += toNumber(row.pagibigEmployer);
            return acc;
          },
          {
            basicPay: 0,
            overtime: 0,
            late: 0,
            absence: 0,
            gross: 0,
            wtax: 0,
            sss: 0,
            philhealth: 0,
            pagibig: 0,
            netPayable: 0,
            sssEmployer: 0,
            philEmployer: 0,
            pagibigEmployer: 0,
          }
        );


        const openModal = () => {;
          setIsModalOpen(true);
        };
      
        const closeModal = () => {;
          setIsModalOpen(false);
        };

    return (
        <div className="p-4">
            
            <div className="flex justify-between px-4 gap-x-4">
              <div>
                <button
                 disabled={isLoading || isEmpty}
                 onClick={openModal}
                 className="bg-blue-700 hover:bg-blue-500 hover:cursor-pointer text-white rounded-lg py-2 px-6 text-sm shadow disabled:opacity-50 disabled:hover:cursor-not-allowed">View Variance</button>
              </div>
              <div className="flex gap-x-4">
                <button onClick={handleRecheck}
                        disabled={recheckPayroll.isPending || isLoading || isEmpty}
                        className="rounded-lg bg-yellow-600 hover:bg-yellow-500 px-6 py-2 text-sm text-white disabled:opacity-50">
                        {recheckPayroll.isPending ? "Saving..." : "Reopen Payroll"}
                </button>
                <button onClick={handleSave}
                        disabled={savePayroll.isPending || isLoading || isEmpty}
                        className="rounded-lg bg-green-600 hover:bg-green-500 px-6 py-2 text-sm text-white disabled:opacity-50">
                        {savePayroll.isPending ? "Saving..." : "Save Payroll"}
                </button>
              </div>
            </div>
        
                <div className="mt-8 px-4 text-slate-700">
                  <span className="font-semibold">Payroll Period:</span> {payCode}
                </div>

              <SpreadSheet data={rows} totals={totals}/>


                 {isModalOpen && (
                        <RequestModal size="xxxl" title="VIEW VARIANCE" onClose={closeModal}>
                          <FinancialVarianceModal/>
                        </RequestModal>
                      )}


        </div>
    );
}