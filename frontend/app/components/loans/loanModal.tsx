"use client";

import { useState } from "react";
import { useEmpLoanById, useUpdateLoan,  useOverrideEmployeeLoan} from "@/app/hooks/useLoans";
import GenButton from "../Buttons";
import SweetAlert from "../Swal";
import { LoanType, RoundingType, TermUnit,StartDeductLoan } from "@/app/types/loanTypes";

type LoanModal = {
  loan_id: number;
  fullname: string;
};

type LoanForm = {
  loan_type: "FCH_LOAN" | "SSS_LOAN" | "PAGIBIG_LOAN" | "RFC_LOAN" | "OTHERS" | "ARE_LOAN";
  rounding_type: "Tens" | "Ones" | "Five";
  start_deduction_cycle: "10" | "25" | "15" | "30";
  newPerPayroll: number;
  principal: number;
  start_date: string;
  term_value: number;
  term_unit: "MONTHS" | "YEARS";
  deduct_allowance: boolean;
  deduct_first_pay:boolean;
  deduct_sec_pay:boolean;
  others_types: string;
};

export default function ModifyLoan({ loan_id }: LoanModal) {
  const { data, isLoading, isError } = useEmpLoanById(loan_id, !!loan_id);
  const updateLoan = useUpdateLoan();
  const overrideLoan = useOverrideEmployeeLoan();

  const [form, setForm] = useState<LoanForm | null>(null);

  if (isLoading) {
    return <p className="text-sm text-mainGray">Loading loan...</p>;
  }

  if (isError || !data) {
    return <p className="text-sm text-negative">Failed to load loan</p>;
  }

  if (!form) {
    setForm({
      loan_type: data.loan_type,
      rounding_type: data.rounding_types,
      start_deduction_cycle: data.start_deduction_cycle,
      principal: Number(data.principal),
      start_date: data.start_date.slice(0, 7),
      term_value: data.term_value,
      newPerPayroll: Number(data.per_payroll_deduct),
      term_unit: data.term_unit,
      deduct_allowance: data.deduct_allowance,
      deduct_first_pay:data.deduct_first_pay,
      deduct_sec_pay: data.deduct_sec_pay,
      others_types: data.others_types,
    });
    return null;
  }

  const isLocked = data.totalPaid > 0;
  
  const handleSave = () => {

  // ======================================
  // ACTIVE LOAN WITH PAYMENTS
  // ======================================
  if (isLocked) {

    const currentDeduction =
      Number(data.per_payroll_deduct);

    const newDeduction =
      Number(form.newPerPayroll);

    // ======================================
    // NO CHANGES
    // ======================================
    if (
      !form.newPerPayroll ||
      newDeduction === currentDeduction
    ) {

      SweetAlert.successAlert(
        "No loan override changes detected"
      );

      return;
    }

    // ======================================
    // OVERRIDE ACTIVE LOAN
    // ======================================
    overrideLoan.mutate(
      {
        loan_id,
        payload: {
          newPerPayroll: newDeduction,
        },
      },
      {
        onSuccess: () => {

          SweetAlert.successAlert(
            "Loan override successful"
          );
        },

       onError: (error) => {

          const err = error as {
            response?: {
              data?: {
                message?: string;
              };
            };
          };

          const message =
            err.response?.data?.message ||
            "Failed to override loandsds";

          SweetAlert.errorAlert(message);
        },
      }
    );

    return;
  }

  // ======================================
  // NORMAL UPDATE
  // ======================================
  updateLoan.mutate(
    {
      loan_id,
      payload: {
        ...form,
        start_date: `${form.start_date}-01`,
      },
    },
    {
      onSuccess: () => {

        SweetAlert.successAlert(
          "Loan updated successfully"
        );
      },

      onError: () => {

        SweetAlert.errorAlert(
          "Failed to update loan"
        );
      },
    }
  );
};
  return (
    <div className="flex flex-col gap-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Type of Loan</label>
          <select
            value={form.loan_type}
            disabled={isLocked}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setForm({
                ...form,
                loan_type: e.target.value as LoanType,
              })
            }
            className="disabled:opacity-50 w-full px-3 py-2.5 border rounded-md"
          >
            <option value="FCH_LOAN">FCH Loan</option>
            <option value="SSS_LOAN">SSS Loan</option>
            <option value="PAGIBIG_LOAN">Pag-IBIG Loan</option>
            <option value="RFC_LOAN">RFC Housing Loan</option>
            <option value="ARE_LOAN">ARE Loan</option>
            <option value="OTHERS">Others...</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">
                Select Deduction Start
            </label>
            <select 
                value={form.start_deduction_cycle} 
                disabled={isLocked}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setForm({
                    ...form,
                    start_deduction_cycle: e.target.value as StartDeductLoan,
                  })
            }
                className="disabled:opacity-50 w-full px-3 py-2.5 border rounded-md"
            >
                <option value="10">1st Pay 10-25-cycle</option>
                <option value="25">2nd Pay 10-25-cycle</option>
                <option value="15">1st Pay 15-30-cycle</option>
                <option value="30">2nd Pay 15-30-cycle</option>
            </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Principal</label>
          <input
            type="number"
            disabled={isLocked}
            value={form.principal}
            onChange={(e) =>
              setForm({ ...form, principal: Number(e.target.value) })
            }
            className="disabled:opacity-50 w-full px-3 py-2.5 border rounded-md"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Start Date</label>
          <input
            type="month"
            disabled={isLocked}
            value={form.start_date}
            onChange={(e) =>
              setForm({ ...form, start_date: e.target.value })
            }
            className="disabled:opacity-50 w-full px-3 py-2.5 border rounded-md"
          />
        </div>

        { form.loan_type === "FCH_LOAN" && (
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">
                    Type of Rounding
                </label>
                <select 
                    value={form.rounding_type} 
                    disabled={isLocked}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setForm({
                        ...form,
                        rounding_type: e.target.value as RoundingType,
                      })
                    }
                    className="disabled:opacity-50 w-full px-3 py-2.5 border rounded-md"
                >
                    <option value="Tens">Nearest Tens</option>
                    <option value="Ones">Nearest Ones</option>
                    <option value="Five">Nearest Five</option>
                </select>
            </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Term</label>
          <input
            type="number"
            min={1}
            disabled={isLocked}
            value={form.term_value}
            onChange={(e) =>
              setForm({ ...form, term_value: Number(e.target.value) })
            }
            className="disabled:opacity-50 w-full px-3 py-2.5 border rounded-md"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Term Unit</label>
          <select
            disabled={isLocked}
            value={form.term_unit}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setForm({
                ...form,
                term_unit: e.target.value as TermUnit,
              })
            }
            className="disabled:opacity-50 w-full px-3 py-2.5 border rounded-md"
          >
            <option value="MONTHS">Months</option>
            <option value="YEARS">Years</option>
          </select>
        </div>

        <div className="flex flex-col gap-4 col-span-full">
           { form.loan_type === "ARE_LOAN" && (
            <label className="text-sm font-semibold">
              Where do you want to deduct it?
            </label>)}
            <div className="flex flex-wrap gap-8 w-full">
               { form.loan_type === "ARE_LOAN" && (
              <div className="flex items-center gap-2 col-span-full">
                  <input
                    type="checkbox"
                    disabled={isLocked}
                    checked={form.deduct_first_pay}
                    onChange={(e) =>
                      setForm({ ...form, deduct_first_pay : e.target.checked })
                    }
                  />
                  <label className="text-sm font-semibold">
                    Deduct in First Pay.?
                  </label>

              </div>)}
                  
              { form.loan_type === "ARE_LOAN" && (
              <div className="flex items-center gap-2 col-span-full">
                  <input
                    type="checkbox"
                    disabled={isLocked}
                    checked={form.deduct_sec_pay}
                    onChange={(e) =>
                      setForm({ ...form, deduct_sec_pay: e.target.checked })
                    }
                  />
                  <label className="text-sm font-semibold">
                    Deduct in Second Pay?
                  </label>

              </div>)}


              <div className="flex items-center gap-2 col-span-full">
                <input
                  type="checkbox"
                  disabled={isLocked}
                  checked={form.deduct_allowance}
                  onChange={(e) =>
                    setForm({ ...form, deduct_allowance: e.target.checked })
                  }
                />
                <label className="text-sm font-semibold">
                  Deduct in allowance?
                </label>

                </div>

            </div>
            
          </div>

      

      </div>
      {isLocked && (
             <div className="w-full flex flex-col gap-3">

        <div className="w-[50%] flex flex-col gap-2">

          <label className="text-sm font-semibold">
            Per Payroll Deduction
          </label>

          {/* CURRENT VALUE */}
          <div className="text-sm text-gray-500">
            Current Deduction:
            <span className="font-semibold ml-1">
              ₱{Number(data.per_payroll_deduct).toLocaleString()}
            </span>
          </div>

          {/* NEW VALUE */}
          <input
            type="number"
            value={form.newPerPayroll}
            onChange={(e) =>
              setForm({
                ...form,
                newPerPayroll: Number(e.target.value),
              })
            }
            className="w-full px-3 py-2.5 border rounded-md"
          />

        </div>

        <div className="text-sm text-gray-600 leading-relaxed">
          Changing this value will update the payroll deduction
          amount and automatically recalculate the remaining
          loan terms and balance.
        </div>

      </div>

      )}
      <div className="flex justify-end">
        <GenButton variant="positive" onClick={handleSave}>
          Save Changes
        </GenButton>
      </div>
    </div>
  );
}