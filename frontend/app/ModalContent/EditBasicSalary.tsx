import { useState } from "react";
import SweetAlert from "../components/Swal";

interface EditBasicSalaryModalProps {
  currentSalary: number;
  onSave: (payload: {
    old_salary: number;
    new_salary: number;
    cash_assistance: number;
    remarks: string;
  }) => void;
  onClose: () => void;
}

export const EditBasicSalaryModal: React.FC<EditBasicSalaryModalProps> = ({
  currentSalary,
  onSave,
  onClose,
}) => {
  const [basicSalary, setBasicSalary] = useState<number>(currentSalary);
  const [cashAssistance] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>("");

  return (
    <div className="space-y-4">
      <div className="grid gap-y-2">
        <label className="font-bold">Basic Salary</label>
        <input
          type="number"
          value={basicSalary}
          onChange={(e) => setBasicSalary(Number(e.target.value))}
          className="border border-gray-400 py-2 px-2 rounded-lg"
        />
      </div>

      {/* <div className="grid gap-y-2">
        <label className="font-bold">Cash Assistance</label>
        <input
          type="number"
          value={cashAssistance}
          onChange={(e) => setCashAssistance(Number(e.target.value))}
          className="border py-2 px-2 rounded-lg"
        />
      </div> */}

      <div className="grid gap-y-2">
        <label htmlFor="" className="font-bold">Remarks</label>
        <select name="" id="" value={remarks} onChange={(e) => setRemarks(e.target.value)}
         className={`border px-2 py-2 rounded-lg ${!remarks ? "border-red-300" : "border-gray-400"}`}>
          <option value="" disabled>Select Remarks</option>
          <option value="Probationary">Probationary</option>
          <option value="Regular">Regular</option>
          <option value="Salary_Increase">Salary Increase</option>
          <option value="Merit_Increase">Merit Increase</option>
          <option value="Transfer">Transfer</option>
          </select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button onClick={onClose} className="px-4 py-2 bg-slate-300 rounded">
          Cancel
        </button>

        <button
        onClick={() => {
          if (!remarks.trim()) {
            SweetAlert.warningAlert("Warning","Remarks is required")
            return;
          }

          if (basicSalary === currentSalary) {
            SweetAlert.warningAlert("Warning","No changes detected")
            return;
          }

          onSave({
            old_salary: currentSalary,
            new_salary: basicSalary,
            cash_assistance: cashAssistance,
            remarks: remarks.trim(),
          });
          
        }}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded"
      >
        Save Changes
      </button>
      </div>
    </div>
  );
};