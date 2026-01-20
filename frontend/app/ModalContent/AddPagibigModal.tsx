import { useState } from "react";

interface AddPagibigModalProps {
    empCode?: string;
    onSave: (payload: {
      pagibig_employee_share: number;
      pagibig_employer_share: number;
    }) => void;
    onClose: () => void;
  }
  
  export const AddPagibigModal: React.FC<AddPagibigModalProps> = ({empCode,onSave,onClose}) => {
    const [employeeShare, setEmployeeShare] = useState<number | "">("");
    const [employerShare, setEmployerShare] = useState<number | "">("");
    return (
      <div className="space-y-4">
        <div className="grid gap-y-2">
          <label className="font-bold">EMPLOYEE SHARE</label>
          <input
            type="number"
            placeholder="Enter amount"
            value={employeeShare}
            onChange={(e) =>
              setEmployeeShare(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="border py-2 px-2 rounded-lg"
          />
        </div>
  
        <div className="grid gap-y-2">
          <label className="font-bold">EMPLOYER SHARE</label>
          <input
            placeholder="Enter amount"
            type="number"
            value={employerShare}
            onChange={(e) =>
              setEmployerShare(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="border py-2 px-2 rounded-lg"
          />
        </div>
  
        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-300 rounded">
            Cancel
          </button>
  
          <button
            onClick={() =>
              onSave({
                pagibig_employee_share: Number(employeeShare || 0),
                pagibig_employer_share: Number(employerShare || 0),
              })
            }
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded">
            Add Pag-IBIG
          </button>
        </div>
      </div>
    );
  };
  