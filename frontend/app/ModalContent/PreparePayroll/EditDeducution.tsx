"use client";

import { ComputedProps } from "@/app/services/preparePayroll";
import { useState } from "react";
import { useUpdateDeduction } from "@/app/hooks/usePreparePayroll";
import SweetAlert from "@/app/components/Swal";
import AuthenticationModal from "@/app/components/editableLoanModal/AuthenticationModal"
import { useVerifyPassword } from "@/app/hooks/useEditableLoan";


type Props = {
  employee: ComputedProps;
  onClose?: () => void;
};

export default function EditDeduction({ employee, onClose }: Props) {
  const { mutate, isPending } = useUpdateDeduction();
  const [openModal, setOpenModal] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [verifiedUserId, setVerifiedUserId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  console.log(isDetailModalOpen);

  const [late, setLate] = useState<string>(
    employee.LateCount && employee.LateCount > 0 ? String(employee.LateCount) : ""
  );

  const [absent, setAbsent] = useState<string>(
    employee.TotalAbsentHours && Number(employee.TotalAbsentHours) > 0
      ? String(employee.TotalAbsentHours) : ""
  );

  const [undertime, setUndertime] = useState<string>(
    employee.TotalUndertime && employee.TotalUndertime > 0
      ? String(employee.TotalUndertime)
      : ""
  );

  const [overtime, setOvertime] = useState<string>(
    employee.TotalOvertime && Number(employee.TotalOvertime) > 0
      ? String(employee.TotalOvertime)
      : ""
  );

    const [grossPay, setGrossPay] = useState<string>(
    employee.gross_pay_edit && employee.gross_pay_edit > 0 ? String(employee.gross_pay_edit) : ""
  );

  const verifyPasswordMutation = useVerifyPassword();

  const handleSubmit = () => {
    mutate(
      {
        PayCode: employee.PayCode,
        EmpCodeId: employee.EmpCodeId,
        PayrollPeriod: employee.PayrollPeriod,
        LateCount: late === "" ? 0 : Number(late),
        TotalAbsentHours: absent === "" ? 0 : Number(absent),
        TotalUndertime: undertime === "" ? 0 : Number(undertime),
        TotalOvertime: overtime === "" ? 0 : Number(overtime),
        gross_pay_edit: grossPay === "" ? 0 : Number(grossPay),
      },
      {
        onSuccess: () => {
          onClose?.();
          SweetAlert.successAlert("Saved successfully");
        },
      }
    );
  };


  // const handleOpenModal = () =>{
  //   setOpenModal(true);
  // }
  const handleCloseModal = () => {
    setOpenModal(false);
    setIsChecked(false); 
  }


  const handlePasswordConfirm = async (password: string) => {
    try {
      const result = await verifyPasswordMutation.mutateAsync(password);
      setVerifiedUserId(result.user_id);
      SweetAlert.successAlert("Access Granted");
      setOpenModal(false);
      setIsDetailModalOpen(true);
    } catch {
      SweetAlert.errorAlert("Invalid password or no permission");
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="flex flex-col w-full">
          <label className="pb-1">LATE</label>
          <input
            type="number"
            value={late}
            placeholder="Input late count.."
            onChange={(e) => setLate((e.target.value))}
            className="border border-gray-400 p-2 rounded w-full"
          />
        </div>

        <div className="flex flex-col w-full">
          <label className="pb-1">ABSENT</label>
          <input
            type="number"
            value={absent}
            placeholder="Input absent count.."
            onChange={(e) => setAbsent((e.target.value))}
            className="border border-gray-400 p-2 rounded w-full"
          />
        </div>

        <div className="flex flex-col w-full">
          <label className="pb-1">UNDERTIME</label>
          <input
            type="number"
            value={undertime}
            placeholder="Input undertime count.."
            onChange={(e) => setUndertime((e.target.value))}
            className="border border-gray-400 p-2 rounded w-full"
          />
        </div>

        <div className="flex flex-col w-full">
          <label className="pb-1">OVERTIME</label>
          <input
            type="number"
            value={overtime}
            placeholder="Input overtime amount.."
            onChange={(e) => setOvertime((e.target.value))}
            className="border border-gray-400 p-2 rounded w-full"
          />
        </div>


        <div className={`flex flex-col w-full ${verifiedUserId ? "visible" : "invisible"}`}>
          <label className="pb-1">GROSS PAY</label>
          <input
            type="number"
            value={grossPay}
            placeholder="Input gross amount..."
            onChange={(e) => setGrossPay((e.target.value))}
            className="border border-gray-400 p-2 rounded w-full"
          />
        </div>

        <div className="flex justify-between p-2 gap-x-4 rounded w-2/12 col-span-full border border-gray-400">
          <label className="">Special Case</label>
          <input type="checkbox" checked={isChecked}
            onChange={(e) => {
              const checked = e.target.checked;
              setIsChecked(checked);
              if (checked) {
                setOpenModal(true);
              } else {
                setOpenModal(false);
              }
            }}
            className="w-5 h-5 accent-green-600 cursor-pointer"
          />
        </div>

      </div>

      <div className="flex justify-end gap-2 pt-8">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-300 hover:bg-slate-200 rounded">
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="px-4 py-2 rounded bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-50">
          {isPending ? "Updating..." : "Update"}
        </button>
      </div>



        <AuthenticationModal
            isOpen={openModal}
            onClose={handleCloseModal}
            onConfirm={handlePasswordConfirm}
        />



           {/* {openModal && (
            <RequestModal size="sm" title={`Edit Gross`} onClose={handleCloseModal}>
              <EditGrossPay
      

              />
            </RequestModal>
          )} */}
      

    </div>
  );
}