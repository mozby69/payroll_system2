import { useEffect, useState } from "react";
import SweetAlert from "../Swal";
import { useFetchLoanLedger, useSaveOverrideLoan } from "@/app/hooks/useEditableLoan";
import { FetchLoanLedgerResponse, SubmitOverridePayload } from "@/app/types/editableLoanTypes";
import GenButton from "../Buttons";
import { useAuth } from "../UserContext";

type SelectedRow = {
  name: string;
  PayCode: string;
  EmpCodeId: string;
  PayrollPeriod: string;
};

interface Props {
  selectedRow: SelectedRow;
  loanType: string;
  master_id:number;
  onClose: () => void;
}

export default function EditLoanModal({
  selectedRow,
  loanType,
  master_id,
  onClose,
}: Props) {
  const { mutate, data, isPending, isError } = useFetchLoanLedger();


  const { user } = useAuth()
  
  const companyId = user?.company_id;

  const saveOverrideMutation = useSaveOverrideLoan(companyId);

  
  const [isCredit2x, setIsCredit2x] = useState(false);


  const getNextPayrollDate = (dateStr: string) => {
  const date = new Date(dateStr);

  const day = date.getDate();

  // clone date
  const next = new Date(date);

  // move to next month
  next.setMonth(next.getMonth() + 1);

  // keep same day (10 or 25)
  next.setDate(day);

  return next.toISOString();
};

  useEffect(() => {
    mutate({
      loanType,
      EmpCode: selectedRow.EmpCodeId,
      PayPeriod: selectedRow.PayrollPeriod,
      PayCode: selectedRow.PayCode,
    });
  }, [loanType, selectedRow, mutate]);

  

  const ledgerData = data as FetchLoanLedgerResponse | undefined;

  const isOverrideDisabled = ledgerData?.hasOverride;

  const displayLedgers = [...(ledgerData?.ledgers ?? [])];

  if (ledgerData?.isPrevPaymentMissing) {
    const ledgers = ledgerData?.ledgers ?? [];

    let lastLedger = null;

    if (ledgers.length > 0) {
    const last = ledgers[ledgers.length - 1];

    const offset = last.payroll_cycle === "25" ? 2 : 1;

    const index = ledgers.length - offset;

    lastLedger = index >= 0 ? ledgers[index] : last;
    }
    const cycleMap: Record<string, string> = {
    "25-pay-cycle": "10",
    "30-pay-cycle": "15",
    };

    displayLedgers.push({
        loan_ledger_id: -1,
        transaction_date: lastLedger
        ? getNextPayrollDate(lastLedger.transaction_date)
        : new Date().toISOString(),
        payroll_cycle:
        cycleMap[selectedRow.PayrollPeriod] ?? "25",
        debit_amount: 0,
        credit_amount: 0,
        payment_status: "MISSED",
        loan_id: ledgerData.loan_id ?? 0,
        transaction_type: "AUTO",
        remarks: "Missed Payment",
        created_at: new Date().toISOString(),
        EmpCodeId: selectedRow.EmpCodeId,
    });
  }

  const handleSubmitOverride = async () => {
    if (!ledgerData?.loan_id) return;

    const payload: SubmitOverridePayload = displayLedgers
      .filter((l) => l.payment_status === "MISSED")
      .map((l) => ({
        loan_id: l.loan_id,
        master_id: master_id,
        loan_type: loanType as "SSS_LOAN" | "PAGIBIG_LOAN",
        credit: l.credit_amount,
        payroll_cycle: selectedRow.PayrollPeriod,        
        payroll_period: selectedRow.PayCode,    
      }));

    if (payload.length === 0) {
      SweetAlert.errorAlert("No missed payments to override");
      return;
    }

    try {
      await saveOverrideMutation.mutateAsync(payload);

      SweetAlert.successAlert("Override saved successfully");

      onClose(); // close modal after success
    } catch (error) {
      console.error(error);
      SweetAlert.errorAlert("Failed to save override");
    }
  };

 
  const isChecked = ledgerData?.hasOverride || isCredit2x;

  return (
    <div>

      <h2 className="text-lg font-semibold mb-4">{loanType}</h2>

      <div className="grid grid-rows-2 gap-4">
          <div className="w-full flex justify-between">
              <p><strong>EmpCode:</strong> {selectedRow.EmpCodeId}</p>
              <p><strong>Emp Name:</strong> {selectedRow.name}</p>
          </div>
          <div className="w-full flex justify-between">
              <p><strong>Payroll Period:</strong> {selectedRow.PayrollPeriod}</p>
              <p><strong>Payroll Cycle:</strong> {selectedRow.PayCode}</p>
          </div>
      </div>


        {ledgerData?.message !== "No active loan" && (
          <div className="grid grid-rows-2 gap-4">
              <div className="mt-4">
                  <p>
                  <strong>Previous Payroll Status:</strong>{" "}
                  {isPending
                      ? "Checking..."
                      : isError
                      ? "Error"
                      : ledgerData?.isPrevPaymentMissing
                      ? "⚠️ Missed Payment"
                      : "✅ Paid"}
                  </p>
              </div>
              {ledgerData?.isPrevPaymentMissing && (
                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={ledgerData?.hasOverride}
                    onChange={(e) => setIsCredit2x(e.target.checked)}
                  />
                  <label>
                    {ledgerData?.hasOverride
                      ? "This entry has already been overridden."
                      : "Would you like to apply this credit to the current loan deduction?"}
                  </label>
                </div>
              )}
            
          </div>
        )}
        
       
      

        {!isPending && !isError && ledgerData?.message === "No active loan" && (
        <div className="mt-4 p-3 border rounded bg-gray-50 text-center text-gray-600">
            No active loan found for this employee.
        </div>
        )}
      {/* Ledger Table */}
      {displayLedgers.length > 0 && (
        <div className="mt-4 border p-3 rounded">
          <h3 className="font-semibold mb-2">Loan Ledger</h3>
            
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-1">Date</th>
                <th className="border p-1">Cycle</th>
                <th className="border p-1">Debit</th>
                <th className="border p-1">Credit</th>
                <th className="border p-1">Status</th>
              </tr>
            </thead>

            <tbody>
              {displayLedgers.map((item) => (
                <tr key={item.loan_ledger_id}>
                  <td className="border p-1">
                    {new Date(item.transaction_date).toLocaleDateString()}
                  </td>

                  <td className="border p-1">
                    {item.payroll_cycle ?? "-"}
                  </td>

                  <td className="border p-1">
                    {item.debit_amount}
                  </td>

                  <td className="border p-1">
                    {item.credit_amount}
                  </td>

                  <td className="border p-1">
                    {item.payment_status === "NEW" ? (
                      <span className="text-mainBg font-semibold">
                        Created
                      </span>
                    ) : item.payment_status === "PAID" ? (
                      <span className="text-positive font-semibold">
                        Paid
                      </span>
                    ) : item.payment_status === "MISSED" ? (
                      <span className="text-negative font-bold">
                        Missed
                      </span>
                    ) : (
                      <span className="text-negative font-semibold">
                        Unpaid
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end mt-4 gap-4">
        <GenButton variant="secondary" onClick={onClose}>
                    Cancel
        </GenButton>
        {isCredit2x && (
            <GenButton
              variant="primary"
              onClick={handleSubmitOverride}
              disabled={isOverrideDisabled || saveOverrideMutation.isPending}
            >
              {isOverrideDisabled
                ? "Override Already Exists"
                : saveOverrideMutation.isPending
                ? "Saving..."
                : "Submit Override"}
            </GenButton>
          )}
      </div>
    </div>
  );
}