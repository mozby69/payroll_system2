"use client";

import { useMemo } from "react";
import { useClosedLoan, useEmpLoanById, usePayEmployeeLoan } from "@/app/hooks/useLoans";
import GenButton from "../Buttons";
import { LedgerRow } from "@/app/types/loanTypes";
import SweetAlert from "../Swal";


type Props = {
  loan_id: number;
  fullname: string;
  onSuccess: () => void,
};

export default function SkipPayModal({
  loan_id,
  fullname,
  onSuccess,
}: Props) {
  const { data, isLoading, isError } = useEmpLoanById(
    loan_id,
    !!loan_id
  );

  const payLoan = usePayEmployeeLoan();
  const { mutate: closeLoan, isPending } = useClosedLoan();

  const rows: LedgerRow[] = useMemo(() => {
    if (!data) return [];

    const existingRows: LedgerRow[] = data.ledger;

    const unpaidRows: LedgerRow[] = Array.from(
      { length: data.remainingPayment },
      (_, i) => ({
        loan_ledger_id: `unpaid-${i}`,
        transaction_date: null,
        transaction_type: "PAYROLL_DEDUCT",
        payment_status: "PENDING",
        debit_amount: 0,
        credit_amount: 0,
        isPaid: false,
        isDeduction: true,
        isCreated:false,
      })
    );

    return [...existingRows, ...unpaidRows];
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


  const handleSkipPay = () => {
    SweetAlert.confirmationAlert(
      "Skip Payment",
      "Are you sure you want to proceed for skip payment?",
      () => {
        payLoan.mutate({
            loan_id: data.loan_id,
            actionType: "SKIPPED",
        });
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

        {rows.map((l) => (
          <li
            key={l.loan_ledger_id}
            className={`grid grid-cols-6 text-sm py-2 px-4 ${
              l.isDeduction && !l.isPaid && !l.isCreated 
                ? "italic opacity-70 bg-mainNeutral"
                : ""
            }`}
          >
            <span className="">
              {l.transaction_date
                ? new Date(l.transaction_date).toLocaleDateString()
                : "-"}
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
              {l.isDeduction &&
                !l.isPaid &&
                !l.isCreated &&
                data.status !== "Closed" && (
                  <button
                    onClick={handleSkipPay}
                    className="text-mainhighlight underline text-xs font-semibold cursor-pointer hover:scale-[1.2]"
                  >
                    Skip
                  </button>
                )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
