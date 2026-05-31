"use client";
import GenButton from "@/app/components/Buttons";
import CompanyCycleFilter from "@/app/components/Company_CycleFilter";
import CompanyFilterCycle from "@/app/components/Company_CycleFilter";
import CompanyFilter from "@/app/components/CompanyFilter";
import RequestModal from "@/app/components/Modal";
import PayrollSpreadsheetPrint from "@/app/components/reports/PrintPayrollSpreadsheet";
import SpreadSheet, { SpreadsheetRow } from "@/app/components/reports/SpreadSheet";
import SweetAlert from "@/app/components/Swal";
import { useAuth } from "@/app/components/UserContext";
import { toNumber } from "@/app/helper/SpreadsheetHelper";
import {  useDisplayForApprovalPayroll, useReCheckPayroll, useReCheckPayrollToChecker, useSaveFinalPayroll, useSaveToApproverPayroll } from "@/app/hooks/usePayrollArchive";

import FinancialVarianceModal from "@/app/ModalContent/Financial/financialVariance";
import { toNamespacedPath } from "path";
import { useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print"





export default function FinancialPage(){

  
      const savePayroll = useSaveFinalPayroll();
      const recheckPayroll = useReCheckPayroll();
      const recheckPayrollToChecker = useReCheckPayrollToChecker();
      const saveToApprover = useSaveToApproverPayroll()
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [loading] = useState(false);
      //const [selectedCompany, setSelectedCompany] = useState("");
      const [cycle, setCycle] = useState("");
      const [company, setCompany] = useState("");
      const printRef = useRef<HTMLDivElement>(null)

      const { hasPermission,hasRole } = useAuth()


      let status: "FOR_CHECKER" | "FOR_APPROVER";

      if (hasRole("FINANCIAL_CHECKER")) {
        status = "FOR_CHECKER";
      } else if (hasRole("FINANCE_APPROVER")) {
        status = "FOR_APPROVER";
      } else {
        status = "FOR_CHECKER"; 
      }
      
      const { data, isLoading } = useDisplayForApprovalPayroll(status,company);

  

   
      const payCode = data?.data?.[0]?.PayCode ?? "-";
      const isEmpty = !data || !data.data || data.data.length === 0;

      const availableCompany = data?.availableCompany ?? [];

        const cycles = useMemo(() => {
          return [...new Set(availableCompany.map(c => c.cycle))];
        }, [availableCompany]);

        const companies = useMemo(() => {
          if (!cycle) return [];

          return [
            ...new Set(
              availableCompany
                .filter(c => c.cycle === cycle)
                .map(c => c.company_id)
            ),
          ];
        }, [cycle, availableCompany]);


      const filteredData = data?.data?.filter(
        (item) => item.CycleCategory === cycle
      ) ?? [];

      const isEmpty2 = filteredData.length === 0;

      const [editedWtax, setEditedWtax] = useState<Record<string, number>>({});

      const buildKey = (
        payCode: string,
        empId: string,
        period: string
        ): string => `${payCode}_${empId}_${period}`;



        const rows: SpreadsheetRow[] = !cycle ? [] : (data?.data ?? [])
        // .filter((emp) => {
        //   if (cycle && emp.CycleCategory !== cycle) return false;
      
        //   if (company && emp.EmpCode.BranchCode?.company_id !== company) {
        //     return false;
        //   }
      
        //   return true;
        // })
      .map((emp) => {
        const key = buildKey(
          emp.PayCode,
          emp.EmpCodeId,
          emp.PayrollPeriod
        );
    
        const finalWtax = editedWtax[key] ?? Number(emp.wtax);
    
        // const net =
        //   Number(emp.gross_pay) -
        //   (
        //     finalWtax +
        //     Number(emp.sss_contrib_employee) +
        //     Number(emp.philhealth_contrib_employee) +
        //     Number(emp.pagibig_contrib_employee) +
        //     Number(emp.are_loan) +
        //     Number(emp.rfc_loan) +
        //     Number(emp.fch_loan) +
        //     Number(emp.sss_loan) +
        //     Number(emp.pagibig_loan) +
        //     Number(emp.calamity_loan)
        //   );



          
         console.log('pagibig',emp.pagibig_loan);
    
        return {

          name: `${emp.EmpCode.Lastname}, ${emp.EmpCode.Firstname}`,
          basicPay: emp.semi_monthly,
          overtime: emp.overtime,
          late: emp.late_count,
          undertime: emp.undertime,
          absence: emp.absence,
          gross: emp.gross_pay,
          wtax: finalWtax,
          sss: emp.sss_contrib_employee,
          philhealth: emp.philhealth_contrib_employee,
          pagibig: emp.pagibig_contrib_employee,
          arE: emp.are_loan,
          rfc: emp.rfc_loan,
          fch: emp.fch_loan,
          salaryLoan: emp.sss_loan,
          calamityLoan: emp.calamity_loan,
          pagibigSalaryLoan: emp.pagibig_loan,
          netPayable: emp.net_pay,
          sssEmployer: emp.sss_contrib_employer,
          philEmployer: emp.philhealth_contrib_employer,
          pagibigEmployer: emp.pagibig_contrib_employer,
    
   
          rowKey: key,
          PayCode: emp.PayCode,
          EmpCodeId: emp.EmpCodeId,
          PayrollPeriod: emp.PayrollPeriod,
          computedWtax: Number(emp.computedWtax),
          officers_allowance:emp.officers_allowance,

              };
            });
    
      


      const handleSave = () => {
        SweetAlert.confirmationAlert(
          "Confirm Save Payroll",
          "Are you sure you want to save this payroll?",
          () => {
            savePayroll.mutate({cycle,companyId:company});
          }
        );
      };

      

      const handleRecheck = () => {
        SweetAlert.confirmationAlert(
          "Confirm Reopen Payroll",
          "Are you sure you want to this recheck payroll?",
          () => {
            recheckPayroll.mutate(company);
          }
        );
      };

      const handleRecheckToChecker = () => {
        SweetAlert.confirmationAlert(
          "Confirm Reopen Payroll",
          "Are you sure you want to this recheck payroll?",
          () => {
            recheckPayrollToChecker.mutate(company);
          }
        );
      };


      const handleSaveToApprover = () => {
        SweetAlert.confirmationAlert(
          "Confirm Save Payroll",
          "Are you sure you want to this save payroll?",
          () => {
            saveToApprover.mutate(company);
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
            acc.arE += toNumber(row.arE);
            acc.rfc += toNumber(row.rfc);
            acc.fch += toNumber(row.fch);
            acc.salaryLoan += toNumber(row.salaryLoan);
            acc.calamityLoan += toNumber(row.calamityLoan);
            acc.pagibigSalaryLoan += toNumber(row.pagibigSalaryLoan);
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
            arE:0,
            rfc:0,
            fch:0,
            salaryLoan:0,
            calamityLoan:0,
            pagibigSalaryLoan:0,
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
                  disabled={isLoading || isEmpty || !company}
                  onClick={openModal}
                >
                  View Variance
                </GenButton>
                 <GenButton
                    variant="main"
                    onClick={handlePrint1}
                    disabled={loading}
                    >
                    {loading ? "Generating PDF..." : "Print Payroll"}
                </GenButton>
              </div>
             
              <div className="flex gap-x-4">
          
                   
              {hasRole("FINANCIAL_CHECKER") && (
                <GenButton onClick={handleRecheck}
                        variant="edit"
                        disabled={recheckPayroll.isPending || isLoading || isEmpty || !company}>
                        {recheckPayroll.isPending ? "Saving..." : "Reopen Payroll"}
                </GenButton>
              )}

                {hasPermission("SAVE_FINAL_PAYROLL") && (
                  <>
                  <GenButton onClick={handleSave}
                          variant="positive"
                          disabled={savePayroll.isPending || isLoading || isEmpty2 || !cycle || !company}>
                          {savePayroll.isPending ? "Saving..." : "Save Payroll"}
                  </GenButton>

                  <GenButton onClick={handleRecheckToChecker}
                          variant="edit"
                          disabled={savePayroll.isPending || isLoading || isEmpty2 || !cycle || !company}>
                          {savePayroll.isPending ? "Saving..." : "Reopen Payroll"}
                  </GenButton>

                  </>
                )}

              {hasPermission("SAVE_TO_APPROVER") && (
                  <button onClick={handleSaveToApprover}
                   disabled={!cycle || !company || isEmpty}
                  className="bg-amber-800 px-4 rounded-md text-white cursor-pointer disabled:opacity-50 disabled:hover:cursor-not-allowed">Save Payroll</button>
                )}

              </div>
            </div>
        
            <div className="flex justify-between mt-10">

                <div className="px-4 text-slate-700">
                    <span className="font-semibold">Payroll Period:</span> {payCode}
                </div>

                <div>
              
                </div>
                <div className="flex gap-4 px-4 mt-4">

                    {/* Cycle */}
                    <select
                      className="border px-3 py-2 rounded"
                      value={cycle}
                      onChange={(e) => {
                        setCycle(e.target.value);
                        setCompany(""); // reset company
                      }}
                    >
                      <option value="">Select Cycle</option>
                      {cycles.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    {/* Company */}
                    <select
                      className="border px-3 py-2 rounded"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      disabled={!cycle}
                    >
                      <option value="">Select Company</option>
                      {companies.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

            </div>
            </div>

              <SpreadSheet
                      data={rows}
                      totals={totals}
                      onWtaxChange={(key, val) =>
                        setEditedWtax((prev) => ({
                          ...prev,
                          [key]: val
                        }))
                      }
                    />

              {isModalOpen && (
                <RequestModal size="xxl" title="VIEW VARIANCE" onClose={closeModal}>
                  <FinancialVarianceModal
                    paycode={payCode}
                    cycle={cycle}
                    company_id={company}
                  />
                </RequestModal>
              )}


            <div className="hidden print:block">
                <PayrollSpreadsheetPrint payCode={payCode} ref={printRef} data={rows} companyCode={company} />
            </div>
        </div>
    );
}