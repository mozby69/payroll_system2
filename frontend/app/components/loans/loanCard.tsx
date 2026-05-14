"use client";

import GenButton from "@/app/components/Buttons";
import { useClosedLoan, useLoanDetails } from "../../hooks/useLoans";
import RequestModal from "../Modal";
import { useRef, useState } from "react";
import ModifyLoan from "./loanModal";
import SweetAlert from "../Swal";
import EarlyPayModal from "./earlyPayModal";
import SkipPayModal from "./skipPayModal";
import { InfoProps, LoanLedgerItem } from "@/app/types/loanTypes";
import { useReactToPrint } from "react-to-print";
import EditLoanLedger from "./editLoanLedger";

type LoanCardProps = {
  loan: {
    loan_id: number;
    fullname: string;
    loan_type: string;
    principal: number;
    term_value: number;
    term_unit: string;
    start_date: string;
    status: string;
    others_types: string;
    per_payroll_deduct: number;
    deduct_allowance: boolean;
    extended_term: number;
  };
  isOpen: boolean;
  onToggle: () => void;
};

 type LoanContext = {
   loan_id: number;
   fullname:string;
 }

export default function LoanCard({ loan, isOpen, onToggle }: LoanCardProps) {

  const [editContext, setEditContext] = useState<LoanContext | null>(null);
  const [earlyPay, setEarlyPay] = useState<LoanContext | null> (null);
  const [editLoan, setEditLoan] = useState<LoanContext | null> (null);
  const [skipPay, setSkipPay] = useState<LoanContext | null> (null);
  const [openMenu, setOpenMenu] = useState(false);
 

  const ledgerRef = useRef<HTMLDivElement>(null);

  const { data: details, isLoading } = useLoanDetails(
    loan.loan_id,
    isOpen
  );

  const { mutate: closeLoan } = useClosedLoan();



  const handleClosed = (loan_id: number) => {
    SweetAlert.remarksConfirmationAlert(
      "Close Loan",
      "Please provide remarks before closing this loan",
      "Reason for closing",
      (remarks) => {
        closeLoan(
          {
            loan_id,
            payload: { remarks },
          },
          {
            onSuccess: () => {
              SweetAlert.successAlert("Success", "Loan has been closed.");
            },
          }
        );
      }
    );
  };


  const handlePrintLedger = useReactToPrint({
    contentRef: ledgerRef,
    documentTitle: `Loan Ledger -${loan.loan_id}`,
  })


  return (
    <div className="flex flex-col gap-y-4 bg-mainLight shadow-lg p-4 rounded-md">

      <div className="grid grid-cols-4 gap-y-4 gap-x-6 p-6 border border-mainNeutral rounded-lg">
        <Info label="Fullname" value={loan.fullname} />
        <Info label="Loan Type" value={loan.loan_type} />
        
        {loan.others_types != "" && (
           <Info label="Sub Type" value={loan.others_types} />
        )}
        <Info label="Principal" value={loan.principal} />
        <Info label="Original Term" value={`${loan.term_value} ${loan.term_unit}`} />
        <Info
          label="Start Date"
          value={new Date(loan.start_date).toLocaleDateString()}
        />
        <Info
          label="Per Payroll Deduction"
          value={loan.per_payroll_deduct}
        />
        <Info
          label="Deduct Allowance"
          value={loan.deduct_allowance ? "Yes" : "No"}
        />
        <Info label="Extended Term" value={`${loan.extended_term} MONTHS`} />

       
      </div>


      <div className="flex justify-between items-center">
        <span
          className={`text-sm font-medium px-2 py-1 rounded ${
            loan.status === "ACTIVE"
            ? "bg-positive"
            : loan.status === "COMPLETED"
            ? "bg-mainBg"
            : "bg-negative"
          } text-white`}
        >
          {loan.status}
        </span>

        <div className="flex items-center gap-x-3 relative">
          <GenButton variant="outline" onClick={onToggle}>
            {isOpen ? "Hide" : "View More"}
          </GenButton>

          {loan.status === "ACTIVE" && (
            <GenButton 
              variant="main"
              onClick={()=>{
                setEarlyPay({
                  loan_id: loan.loan_id,
                  fullname: loan.fullname
                });
                setOpenMenu(false);
              }}
            >
              Early Pay
            </GenButton>
          )}

          {loan.status === "ACTIVE" && (
            <div className="relative">
              <GenButton
                variant="secondary"
                onClick={() => setOpenMenu((prev) => !prev)}
              >
                ⋮
              </GenButton>

              {openMenu && (
              
                <div className="absolute right-0 mt-2 bg-white  rounded shadow-md w-40 z-20">

                    <GenButton
                      variant="edit"
                      className="w-full text-left px-4 py-2 text-sm rounded-t-lg rounded-b-none"
                      onClick={() => {
                        setEditContext({
                          loan_id: loan.loan_id,
                          fullname: loan.fullname,
                        });
                        setOpenMenu(false);
                      }}
                      >
                      Edit Loan
                    </GenButton>
    
                 
                  
                  
                  <div>
                    <GenButton
                      variant="primary"
                      className="w-full text-left px-4 py-2 text-sm rounded-none "
                      onClick={()=>{
                        setSkipPay({
                          loan_id: loan.loan_id,
                          fullname: loan.fullname
                        });
                        setOpenMenu(false);
                      }}
                    >
                      Skipped Pay
                    </GenButton>

                      <GenButton
                        variant="danger"
                        className="w-full text-left px-4 py-2 text-sm rounded-b-lg rounded-t-none"
                        onClick={() => {
                          handleClosed(loan.loan_id);
                          setOpenMenu(false);
                        }}
                      >
                        Close Loan
                      </GenButton>
                  </div>
                
                </div>
              )}
              
            </div>
           )}
        </div>
      </div>


      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? "max-h-150 opacity-100 mt-2" : "max-h-0 opacity-0"}
        `}
      >
        <div ref={ledgerRef} className="print-container border rounded-lg p-4 space-y-3 bg-mainNeutral">
             <style>{`
                     
                    @media print {

                      @page {
                        size: auto;          
                        margin: 10mm;        
                      }

                      .no-print {
                        display: none !important;
                      }

                      .print-only {
                        display: block !important;
                      }

                      body {
                        background: white !important;
                      }

                      .print-container {
                        background: white !important;
                        box-shadow: none !important;
                        border: none !important;
                        width: 100%;
                        overflow: visible !important;
                      }

                      table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-block: 2rem;
                      }

                      th, td {
                        font-size: 11px;
                        padding:4px;
                        word-break: break-word;
                      }

                      thead {
                        display: table-header-group;
                        background-color: #7c7c7c;
                        color: white;
                      }

                      tr {
                        page-break-inside: avoid;
                      }
                    }



                    `}</style>
          {isLoading || !details ? (
            <p className="text-sm text-mainGray">Loading ledger...</p>
          ) : (
            <>
              <div className="flex justify-end no-print gap-x-4 gap-y-2">
                

                  <GenButton variant="primary" onClick={handlePrintLedger}>
                    Print Loan Ledger
                  </GenButton>

                  <GenButton variant="edit"
                    onClick={()=>{
                      setEditLoan({
                        loan_id: loan.loan_id,
                        fullname: loan.fullname
                      });
                    }}
                  >
                    Edit Loan Ledger
                  </GenButton>
              </div>

              <div className="print-only mb-6 flex flex-col justify-start items-start w-full gap-4">
                <div className="flex justify-between items-center py-4 px-6 bg-mainNeutral mb-6 rounded-sm">
                  <h1 className="text-xl font-bold">Employee Loan Ledger</h1>
                  <h2 className="text-md"><strong>Loan ID: </strong>{loan.loan_id}</h2>
                </div>
                <div className="flex justify-between items-center">
                  <p><strong>Creditor: </strong>{loan.fullname}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm border px-4 py-4 rounded-sm">
                <p>
                  <strong>Start Date: </strong>{" "}
                  {new Date(details.start_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Principal: </strong> {details.principal}
                </p>
                <p>
                  <strong>Total Paid: </strong> {details.totalPaid}
                </p>
                <p>
                  <strong>Remaining Balance: </strong>{" "}
                  {details.remainingBalance}
                </p>
              </div>

              <hr />

                <ul className="space-y-2">
                    {details.ledger.length === 0 ? (
                        <li className="text-sm text-mainGray">
                        No ledger entries found.
                        </li>
                    ) : (
                        <>
                        <li className="grid grid-cols-6 text-xs font-semibold text-mainGray border-b border-mainGray  pb-2">
                            <span>Transaction Date</span>
                            <span>Payroll Cycle Date</span>
                            <span>Transaction</span>
                            <span className="text-right">Credit</span>
                            <span className="text-right">Debit</span>
                            <span className="text-right">Remarks</span>
                        </li>

                        {details.ledger.map((l: LoanLedgerItem) => (
                            <li
                            key={l.loan_ledger_id}
                            className="grid grid-cols-6 text-sm items-center py-1 gap-x-4"
                            >
                            <span>
                              {l.created_at
                                ? new Date(l.created_at).toLocaleDateString()
                                : "-"}
                            </span>
                            <span>
                              {l.transaction_date
                                ? new Date(l.transaction_date).toLocaleDateString()
                                : "-"}
                            </span>
                            <span>{l.transaction_type}</span>
                            <span className="text-right">
                                {l.credit_amount}
                            </span>
                            <span className="text-right">
                                {l.debit_amount}
                            </span>
                             <span className="text-right">
                                {l.remarks}
                            </span>
                            </li>
                        ))}
                        </>
                    )}
                </ul>


            </>
          )}


        </div>
      </div>



        {editContext && (
          <RequestModal
            size="xl"
            title={`Modify ${editContext.fullname} Loan`}
            onClose={() => setEditContext(null)}
          >
            <ModifyLoan loan_id={editContext.loan_id} fullname={editContext.fullname}/>
            
          </RequestModal>
        )}

        {earlyPay && (
          <RequestModal
              size="xl"
              title={`${earlyPay.fullname}, Would like to pay early?`}
              onClose={()=>setEarlyPay(null)}
          >
            <EarlyPayModal loan_id={earlyPay.loan_id} fullname={earlyPay.fullname} onSuccess={() => setEarlyPay(null)}/>
          </RequestModal>
        )}

        {editLoan && (
          <RequestModal 
              size = "xl"
              title={`${editLoan.fullname}, Would like to edit this ledger?`}
              onClose={()=>setEditLoan(null)}
          >
             <EditLoanLedger loan_id={editLoan.loan_id} fullname={editLoan.fullname} onSuccess={() => setEditLoan(null)}/>
          </RequestModal>

        )}

        {skipPay && (
          <RequestModal
              size="xl"
              title={`${skipPay.fullname}, Would like to skip payment?`}
              onClose={()=>setSkipPay(null)}
          >
            <SkipPayModal loan_id={skipPay.loan_id} fullname={skipPay.fullname} onSuccess={()=>setSkipPay(null)}/>
          </RequestModal>
        )}

    </div>
  );
}

function Info({ label, value }: InfoProps) {
  return (
    <div>
      <span className="text-sm text-mainGray">{label}</span>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
