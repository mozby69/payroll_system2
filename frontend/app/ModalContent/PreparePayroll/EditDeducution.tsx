"use client";

import { ComputedProps } from "@/app/services/preparePayroll";
import { useState } from "react";
import { useUpdateDeduction } from "@/app/hooks/usePreparePayroll";
import SweetAlert from "@/app/components/Swal";
import AuthenticationModal from "@/app/components/editableLoanModal/AuthenticationModal"
import { useVerifyPassword } from "@/app/hooks/useEditableLoan";
import { SummaryOverrideChanges, UpdateDeductionPayload } from "@/app/types/preparePayroll";


type Props = {
  employee: ComputedProps;
  onClose?: () => void;
};
type EditableField = keyof SummaryOverrideChanges;

export default function EditDeduction({ employee, onClose }: Props) {
  const { mutate, isPending } = useUpdateDeduction();


  const [openModal, setOpenModal] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [verifiedUserId, setVerifiedUserId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  console.log(isDetailModalOpen);

  const [editedFields, setEditedFields] = useState<Set<EditableField>>(() => new Set());

  const markFieldAsEdited = (field: EditableField) => {
    setEditedFields((currentFields) => {
      const nextFields = new Set(currentFields);
      nextFields.add(field);

      return nextFields;
    });
  };


  const [late, setLate] = useState<string>(
    employee.LateCount !== null &&
      employee.LateCount !== undefined
      ? String(employee.LateCount)
      : ""
  );

  const [absent, setAbsent] = useState<string>(
    employee.TotalAbsentHours !== null &&
      employee.TotalAbsentHours !== undefined
      ? String(employee.TotalAbsentHours)
      : ""
  );

  const [undertime, setUndertime] = useState<string>(
    employee.TotalUndertime !== null &&
      employee.TotalUndertime !== undefined
      ? String(employee.TotalUndertime)
      : ""
  );

  const [overtime, setOvertime] = useState<string>(
    employee.TotalOvertime !== null &&
      employee.TotalOvertime !== undefined
      ? String(employee.TotalOvertime)
      : ""
  );

  const [basicSalary, setBasicSalary] =
    useState<string>(
      employee.basic_salary !== null &&
        employee.basic_salary !== undefined
        ? String(employee.basic_salary)
        : ""
    );

  const [philhealthEmployee, setPhilhealthEmployee] =
    useState<string>(
      employee.philhealth_employee !== null &&
        employee.philhealth_employee !== undefined
        ? String(employee.philhealth_employee)
        : ""
    );

  const [philhealthEmployer, setPhilhealthEmployer] =
    useState<string>(
      employee.philhealth_employer !== null &&
        employee.philhealth_employer !== undefined
        ? String(employee.philhealth_employer)
        : ""
    );

  const [wtax, setWtax] = useState<string>(
    employee.final_wtax !== null &&
      employee.final_wtax !== undefined
      ? String(employee.final_wtax)
      : ""
  );





  const verifyPasswordMutation = useVerifyPassword();
  const toNumber = (value: string): number => {
    if (value.trim() === "") {
      return 0;
    }

    const parsedValue = Number(value);

    return Number.isFinite(parsedValue)
      ? parsedValue
      : 0;
  };

  const handleSubmit = () => {
    const changes: SummaryOverrideChanges = {};

    if (editedFields.has("LateCount")) {
      changes.LateCount = toNumber(late);
    }

    if (editedFields.has("TotalAbsentHours")) {
      changes.TotalAbsentHours = toNumber(absent);
    }

    if (editedFields.has("TotalUndertime")) {
      changes.TotalUndertime = toNumber(undertime);
    }

    if (editedFields.has("TotalOvertime")) {
      changes.TotalOvertime = toNumber(overtime);
    }

    if (editedFields.has("philhealth_employee")) {
      changes.philhealth_employee =
        toNumber(philhealthEmployee);
    }

    if (editedFields.has("philhealth_employer")) {
      changes.philhealth_employer =
        toNumber(philhealthEmployer);
    }

    if (editedFields.has("final_wtax")) {
      changes.final_wtax = toNumber(wtax);
    }

    if (editedFields.has("basic_salary")) {
      changes.basic_salary =
        toNumber(basicSalary);
    }

    if (Object.keys(changes).length === 0) {
      SweetAlert.errorAlert(
        "No fields were changed"
      );
      return;
    }

    const payload: UpdateDeductionPayload = {
      PayCode: employee.PayCode,
      EmpCodeId: employee.EmpCodeId,
      PayrollPeriod: employee.PayrollPeriod,
      changes,
    };

    mutate(payload, {
      onSuccess: () => {
        SweetAlert.successAlert(
          "Saved successfully"
        );

        onClose?.();
      },

      onError: () => {
        SweetAlert.errorAlert(
          "Failed to save changes"
        );
      },
    });
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
            placeholder="Input late count..."
            onChange={(event) => {
              setLate(event.target.value);
              markFieldAsEdited("LateCount");
            }}
            className="border border-gray-400 p-2 rounded w-full"
          />
        </div>

        <div className="flex flex-col w-full">
          <label className="pb-1">ABSENT</label>
          <input
            type="number"
            value={absent}
            placeholder="Input absent count..."
            onChange={(event) => {
              setAbsent(event.target.value);
              markFieldAsEdited("TotalAbsentHours");
            }}
            className="border border-gray-400 p-2 rounded w-full"
          />
        </div>

        <div className="flex flex-col w-full">
          <label className="pb-1">UNDERTIME</label>
          <input
            type="number"
            value={undertime}
            placeholder="Input undertime count..."
            onChange={(event) => {
              setUndertime(event.target.value);
              markFieldAsEdited("TotalUndertime");
            }}
            className="border border-gray-400 p-2 rounded w-full"
          />
        </div>

        <div className="flex flex-col w-full">
          <label className="pb-1">OVERTIME</label>
          <input
            type="number"
            value={overtime}
            placeholder="Input overtime amount..."
            onChange={(event) => {
              setOvertime(event.target.value);
              markFieldAsEdited("TotalOvertime");
            }}
            className="border border-gray-400 p-2 rounded w-full"
          />
        </div>


        <div className="flex flex-col w-full">
          <label className="pb-1">PHILHEALTH EMPLOYEE</label>
          <input
            type="number"
            value={philhealthEmployee}
            placeholder="Input amount..."
            onChange={(event) => {
              setPhilhealthEmployee(event.target.value);
              markFieldAsEdited("philhealth_employee");
            }}
            className="border border-gray-400 p-2 rounded w-full"
          />
        </div>



        <div className="flex flex-col w-full">
          <label className="pb-1">PHILHEALTH EMPLOYER</label>
          <input
            type="number"
            value={philhealthEmployer}
            placeholder="Input amount..."
            onChange={(event) => {
              setPhilhealthEmployer(event.target.value);
              markFieldAsEdited("philhealth_employer");
            }}
            className="border border-gray-400 p-2 rounded w-full"
          />
        </div>



        <div className="flex flex-col w-full">
          <label className="pb-1">WTAX</label>
          <input
            type="number"
            value={wtax}
            placeholder="Input amount..."
            onChange={(event) => {
              setWtax(event.target.value);
              markFieldAsEdited("final_wtax");
            }}
            className="border border-gray-400 p-2 rounded w-full"
          />
        </div>




        <div className={`flex flex-col w-full ${verifiedUserId ? "visible" : "invisible"}`}>
          <label className="pb-1">BASIC SALARY</label>
          <input
            type="number"
            value={basicSalary}
            placeholder="Input basic salary amount..."
            onChange={(event) => {
              setBasicSalary(event.target.value);
              markFieldAsEdited("basic_salary");
            }}
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