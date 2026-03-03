"use client";
import GenButton from "@/app/components/Buttons";
import CompanyFilter from "@/app/components/CompanyFilter";
import RequestModal from "@/app/components/Modal";
import PayrollSpreadsheetPrint from "@/app/components/reports/PrintPayrollSpreadsheet";
import SpreadSheet, { SpreadsheetRow } from "@/app/components/reports/SpreadSheet";
import SweetAlert from "@/app/components/Swal";
import { toNumber } from "@/app/helper/SpreadsheetHelper";
import {  useDisplayForApprovalPayroll, useReCheckPayroll, useSaveFinalPayroll } from "@/app/hooks/usePayrollArchive";

import FinancialVarianceModal from "@/app/ModalContent/Financial/financialVariance";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print"





export default function FinancialPage(){

      const { data, isLoading } = useDisplayForApprovalPayroll();
      const isEmpty = !data || !data.data || data.data.length === 0;
      const savePayroll = useSaveFinalPayroll();
      const recheckPayroll = useReCheckPayroll();
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [loading] = useState(false);
      const [selectedCompany, setSelectedCompany] = useState("");
      const printRef = useRef<HTMLDivElement>(null)

   

      const payCode = data?.data?.[0]?.PayCode ?? "-";
      const currentCycle = data?.data?.[0]?.CycleCategory ?? "";

     const rows: SpreadsheetRow[] = (data?.data ?? [])
     .filter((emp) => {
      if (!selectedCompany) return true;
      return emp.EmpCode.BranchCode?.company_id === selectedCompany;
      })
     .map((emp) => ({
        name: `${emp.EmpCode.Lastname}, ${emp.EmpCode.Firstname}`,
        basicPay: emp.semi_monthly,
        overtime: emp.overtime,
        late: emp.late_count,
        undertime: emp.undertime,
        absence: emp.absence,
        gross: emp.gross_pay,
        wtax: emp.wtax,
        sss: emp.sss_contrib_employee,
        philhealth: emp.philhealth_contrib_employee,
        pagibig: emp.pagibig_contrib_employee,
        arE: emp.are_loan,

        // Loan Code ↓
        rfc: emp.rfc_loan,
        fch: emp.fch_loan,
        salaryLoan: emp.sss_loan,
        pagibigSalaryLoan: emp.pagibig_loan,
        // Loan Code ↑
        
        calamityLoan: 0,
        netPayable: emp.net_pay,
        sssEmployer: emp.sss_contrib_employer,
        philEmployer: emp.philhealth_contrib_employer,
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
            acc.undertime += toNumber(row.undertime);
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
            undertime:0,
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


        const handlePrint1 = useReactToPrint({
          contentRef: printRef,
          documentTitle: `Payroll-${payCode}`,
        })

    return ( 
        <div className="py-8 px-4">
         
       
            <div className="flex justify-between px-4 gap-x-4">
              <div className="inline-flex justify-start items-center gap-8">
                <GenButton
                variant="primary"
                 disabled={isLoading || isEmpty}
                 onClick={openModal}
                 >View Variance</GenButton>
                 <GenButton
                    variant="main"
                    onClick={handlePrint1}
                    disabled={loading}
                    >
                    {loading ? "Generating PDF..." : "Print Payroll"}
                </GenButton>
              </div>
             
              <div className="flex gap-x-4">
                <GenButton onClick={handleRecheck}
                        variant="edit"
                        disabled={recheckPayroll.isPending || isLoading || isEmpty}
                        >
                        {recheckPayroll.isPending ? "Saving..." : "Reopen Payroll"}
                </GenButton>
                <GenButton onClick={handleSave}
                        variant="positive"
                        disabled={savePayroll.isPending || isLoading || isEmpty}
                        >
                        {savePayroll.isPending ? "Saving..." : "Save Payroll"}
                </GenButton>
              </div>
            </div>
        
            <div className="flex justify-between mt-10">

                <div className="px-4 text-slate-700">
                    <span className="font-semibold">Payroll Period:</span> {payCode}
                </div>

                <div>
                  <CompanyFilter
                  value={selectedCompany}
                  cycle={currentCycle}         
                  onChange={setSelectedCompany}
                />
                </div>
            </div>

              <SpreadSheet data={rows} totals={totals}/>


                 {isModalOpen && (
                        <RequestModal size="xxxl" title="VIEW VARIANCE" onClose={closeModal}>
                          <FinancialVarianceModal/>
                        </RequestModal>
                      )}
            <div className="hidden print:block">
                <PayrollSpreadsheetPrint payCode={payCode} ref={printRef} data={rows} companyCode={selectedCompany} />
            </div>
        </div>
    );
}