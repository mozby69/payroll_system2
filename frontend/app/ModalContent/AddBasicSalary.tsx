import { useState } from "react";


interface AddBasicSalaryModalProps {
    onSave: (payload: {
      basic_salary: number;
      cash_assistance: number;
    }) => void;
    onClose: () => void;
  }


  export const AddBasicSalaryModal: React.FC<AddBasicSalaryModalProps> = ({onSave,onClose}) => {
    const [basicSalary, setBasicSalary] = useState<number | "">("");
    const [cashAssistance, setCashAssistance] = useState<number | "">("");
    
  
    return (
        <div className="space-y-4">
          <div className="grid gap-y-2">
            <label className="font-bold">Basic Salary</label>
            <input
                type="number"
                placeholder="Enter amount"
                value={basicSalary}
                onChange={(e) =>
                  setBasicSalary(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="border py-2 px-2 rounded-lg"
              />
          </div>
    
          <div className="grid gap-y-2">
            <label className="font-bold">Cash Assistance</label>
            <input
              type="number"
              placeholder="Enter amount"
              value={cashAssistance}
              onChange={(e) =>
                setCashAssistance(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="border py-2 px-2 rounded-lg"
            />
          </div>
    
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={onClose} className="px-4 py-2 bg-slate-300 rounded">
              Cancel
            </button>
    
            <button
              onClick={() =>
                onSave({
                  basic_salary: Number(basicSalary || 0),
                  cash_assistance: Number(cashAssistance || 0),
                })
              }
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded">
              Add Salary
            </button>
          </div>
        </div>
      );
    };