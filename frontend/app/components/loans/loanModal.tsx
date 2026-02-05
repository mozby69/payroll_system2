"use client";

import { useEffect, useState } from "react";
import { useEmpLoanById, useUpdateLoan } from "@/app/hooks/useLoans";
import GenButton from "../Buttons";
import SweetAlert from "../Swal";

type LoanModal = {
  loan_id: number;
  fullname: string;
};

export default function ModifyLoan({ loan_id, fullname }: LoanModal) {
  
  const { data, isLoading, isError } = useEmpLoanById(loan_id, !!loan_id);
  const updateLoan = useUpdateLoan();
  const [loanType, setLoanType] = useState<
    "FCH_LOAN" | "SSS_LOAN" | "PAGIBIG_LOAN"
  >("FCH_LOAN");

  const [principal, setPrincipal] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [termValue, setTermValue] = useState(1);
  const [termUnit, setTermUnit] = useState<"MONTHS" | "YEARS">("MONTHS");
  const [deductAllowance, setDeductAllowance] = useState(false);

  useEffect(() => {
    if (!data) return;

    setLoanType(data.loan_type);
    setPrincipal(Number(data.principal));
    setStartDate(data.start_date.slice(0, 7));
    setTermValue(data.term_value);
    setTermUnit(data.term_unit);
    setDeductAllowance(data.deduct_allowance);
  }, [data]);


  if (isLoading) {
    return <p className="text-sm text-mainGray">Loading loan...</p>;
  }

  if (isError || !data) {
    return <p className="text-sm text-negative">Failed to load loan</p>;
  }

  const isLocked = data.totalPaid > 0;



  const handleSave = () => {
    try{
      updateLoan.mutate({
      loan_id,
      payload: {
        loan_type: loanType,
        principal: Number(principal),
        term_value: termValue,
        term_unit: termUnit,
        start_date: `${startDate}-01`,
        deduct_allowance: deductAllowance,
      },
    });
    SweetAlert.successAlert("Loan udpated successfully");
    }
    catch{
      SweetAlert.errorAlert("Failed to update loan");
    }
   
  };
  return (
    <div className="flex flex-col gap-y-6">

      <div className="flex flex-col gap-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">
              Type of Loan
            </label>
            <select
              value={loanType}
              onChange={(e) =>
                setLoanType(e.target.value as typeof loanType)
              }
              disabled={isLocked}
              className="disabled:opacity-50 disabled:cursor-not-allowed w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white"
            >
              <option value="FCH_LOAN">FCH Loan</option>
              <option value="SSS_LOAN">SSS Loan</option>
              <option value="PAGIBIG_LOAN">Pag-IBIG Loan</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">
              Principal Amount
            </label>
            <input
              type="number"
              value={principal}
              disabled={isLocked}
              onChange={(e) =>
                setPrincipal(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="disabled:opacity-50 disabled:cursor-not-allowed w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">
              Start Date
            </label>
            <input
              type="month"
              value={startDate}
              disabled={isLocked}
              onChange={(e) => setStartDate(e.target.value)}
              className="disabled:opacity-50 disabled:cursor-not-allowed w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">
              Term
            </label>
            <input
              type="number"
              min={1}
              value={termValue}
              disabled={isLocked}
              onChange={(e) => setTermValue(Number(e.target.value))}
              className="disabled:opacity-50 disabled:cursor-not-allowed w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white"
            />
          </div>
          <div className="flex flex-col gap-2 lg:col-span-2">
            <label className="text-sm font-semibold text-gray-700">
              Term Unit
            </label>
            <select
              value={termUnit}
              onChange={(e) =>
                setTermUnit(e.target.value as typeof termUnit)
              }
              disabled={isLocked}
              className="disabled:opacity-50 disabled:cursor-not-allowed w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white"
            >
              <option value="MONTHS">Months</option>
              <option value="YEARS">Years</option>
            </select>
          </div>
          <div className="inline-flex gap-2 w-full items-center col-span-1 md:col-span-2 lg:col-span-3">
              <input
                  type="checkbox"
                  checked={deductAllowance}
                  onChange={(e) => setDeductAllowance(e.target.checked)}
                  className="h-4 w-4"
              />
              <label className="text-sm font-semibold">
                  Do you want to deduct in allowance?
              </label>
          </div>
        </div>

        <div className="flex justify-end items-center pb-6">
            <GenButton variant="positive"  
              onClick={handleSave}
              >Save Changes</GenButton>
        </div>
      </div>
    </div>
  );
}










