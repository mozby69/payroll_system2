"use client";

import { useMemo, useState } from "react";
import { useEmpLoanById, useRemoveLoanLedger, useUpdateLedgerDate } from "@/app/hooks/useLoans";
import { LedgerRow } from "@/app/types/loanTypes";
import SweetAlert from "../Swal";


type Props = {
  loan_id: number;
  fullname: string;
  onSuccess: () => void,
};

export default function EditLoanLedger({
  loan_id,
  fullname,
  onSuccess,
}: Props) {
  const { data, isLoading, isError } = useEmpLoanById(
    loan_id,
    !!loan_id
  );

  const { mutate: removeLedger } = useRemoveLoanLedger();
  const { mutate: updateLedgerDate } = useUpdateLedgerDate();

  const [editingLedgerId, setEditingLedgerId] = useState<number | null>(null);
  const [editedDate, setEditedDate] = useState<string>("");



  const rows: LedgerRow[] = useMemo(() => {
    if (!data) return [];

    const existingRows: LedgerRow[] = data.ledger;

    return [...existingRows];
  }, [data]);

  if (isLoading) {
    return <p className="text-sm text-mainGray">Loading loan...</p>;
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-negative">
        Failed to load loan
      </p>
    );
  }
  

    const handleRemovePay = (ledger_id: number) => {

    SweetAlert.remarksConfirmationAlert(
        "Remove Payment",
        "Provide remarks before removing this payment.",
        "Reason",
        (remarks) => {

        removeLedger(
            {
            loan_id,
            ledger_id,
            remarks
            },
            {
            onSuccess: () => {
                SweetAlert.successAlert("Success", "Ledger removed");
                onSuccess();
            }
            }
        );

        }
    );
    };

    const handleStartEditDate = (ledgerId: number, currentDate: string | null) => {
        setEditingLedgerId(ledgerId);

        if (currentDate) {
            const formatted = new Date(currentDate).toISOString().split("T")[0];
            setEditedDate(formatted);
        }
    };

    const handleSaveDate = (ledger_id: number) => {

        SweetAlert.remarksConfirmationAlert(
            "Update Date",
            "Provide remarks before updating this transaction date",
            "Reason",
            (remarks) => {

            updateLedgerDate(
                {
                loan_id,
                ledger_id,
                transaction_date: editedDate,
                remarks
                },
                {
                onSuccess: () => {
                    SweetAlert.successAlert(
                    "Updated",
                    "Transaction date updated"
                    );
                }
                }
            );

            setEditingLedgerId(null);
            }
        );
    };

  return (
    <div className="flex flex-col gap-y-6 p-4">
      <div className="grid grid-cols-3 gap-4 text-sm items-end">
        <p><strong>Employee:</strong> {fullname}</p>
        <p><strong>Principal:</strong> {data.principal}</p>
        <p>
          <strong>Term:</strong>{" "}
          {`${data.term_value} ${data.term_unit}`}
        </p>

        <p>
          <strong>Total Payout:</strong>{" "}
          {data.totalExpectedDeductions}
        </p>
        <p>
          <strong>Remaining Payout:</strong>{" "}
          {data.remainingPayment}
        </p>
        <p>
          <strong>Total Paid:</strong> {data.totalPaid}
        </p>
      </div>

      <ul className="space-y-1 overflow-y-auto max-h-80">
        <li className="grid grid-cols-6 text-xs font-semibold gap-x-4 border-y py-2  px-4">
          <span>Date</span>
          <span className="text-center">Transaction</span>
          <span className="text-center">Status</span>
          <span className="text-right">Credit</span>
          <span className="text-right">Debit</span>
          <span className="text-right">Action</span>
        </li>

        {rows.map((l) => {
          const canEditDate = !(
            l.isDeduction &&
            l.isCreated &&
            (l.isSkipped || !l.isPaid)
          );

          return (
            <li
              key={l.loan_ledger_id}
              className={`grid grid-cols-6 text-sm py-2 px-4 ${
                !canEditDate ? "italic opacity-80 bg-mainNeutral" : ""
              }`}
            >
              <span>
                {editingLedgerId === Number(l.loan_ledger_id) && canEditDate ? (
                  <input
                    type="date"
                    value={editedDate}
                    onChange={(e) => setEditedDate(e.target.value)}
                    onBlur={() => handleSaveDate(Number(l.loan_ledger_id))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveDate(Number(l.loan_ledger_id));
                      }
                    }}
                    autoFocus
                    className="border px-1 text-xs rounded"
                  />
                ) : (
                  <span
                    onDoubleClick={() => {
                      if (canEditDate) {
                        handleStartEditDate(
                          Number(l.loan_ledger_id),
                          l.transaction_date
                        );
                      }
                    }}
                    className={`${
                      canEditDate
                        ? "cursor-pointer hover:underline"
                        : "cursor-default text-gray-400"
                    }`}
                  >
                    {l.transaction_date
                      ? new Date(l.transaction_date).toLocaleDateString()
                      : "-"}
                  </span>
                )}
              </span>

              <span className="text-center">{l.transaction_type}</span>

              <span className="text-center">{l.payment_status ?? "-"}</span>

              <span className="text-right">
                {l.isPaid ? l.credit_amount : "-"}
              </span>

              <span className="text-right">
                {l.isCreated ? l.debit_amount : "-"}
              </span>

              <span className="text-right">
                {(l.isSkipped || l.isPaid) &&
                  !l.isCreated &&
                  data.status !== "Closed" && (
                    <button
                      onClick={() =>
                        handleRemovePay(Number(l.loan_ledger_id))
                      }
                      className="text-negative underline text-xs font-semibold cursor-pointer hover:scale-[1.2]"
                    >
                      Remove
                    </button>
                  )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
