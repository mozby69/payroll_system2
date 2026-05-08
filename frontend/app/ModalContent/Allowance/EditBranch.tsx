import { useUpdateAbsentOverride, useUpdateBranch } from "@/app/hooks/useAllowance";
import { useFetchBranches } from "@/app/hooks/useGeneral";
import { AllowanceProps } from "@/app/types/allowanceType";
import { useState } from "react";





type EditBranchProps = {
    data: AllowanceProps | null;
    selectedMonth:string;
    onClose: () => void;
  };
  
  export default function EditBranchAllowance({ data,selectedMonth, onClose }: EditBranchProps) {
    const { data: branches = [] } = useFetchBranches();
    const updateBranch = useUpdateBranch();
    const [selectedBranch, setSelectedBranch] = useState<string>(data?.BranchCode.branchCode ?? "");
    const [absent,setAbsent] = useState<number>(0);
    const updateAbsent = useUpdateAbsentOverride();
  
    if (!data) return null;
  

    const handleUpdate = () => {
        if (!data) return;
      
        updateBranch.mutate({
          EmpCode: data.EmpCode,
          branchCode: selectedBranch,
          selectedMonth: selectedMonth, 
        });

        updateAbsent.mutate({
          EmpCode: data.EmpCode,
          selectedMonth,
          absent_hours: absent,
        })
      
        onClose();
      };


    return (
      <div>

        <div className="grid grid-rows-2 gap-y-4">
       
        <div>
          <label className="block mb-2 text-sm text-gray-600">
          Select Branch
          </label>
    
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded">
            {/* current branch shown automatically via value */}
            {branches.map((b) => (
              <option key={b.branchCode} value={b.branchCode}>
                {b.branchCode} 
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="" className="block mb-2 text-sm text-gray-600">Absent Count</label>
          <input
           value={absent}
           onChange={(e) => setAbsent(Number(e.target.value))}
           type="number"
           placeholder="Input absent count..."
           className="w-full px-3 py-2 border border-gray-300 rounded"/>
        </div>

        </div>
     




  
        <div className="flex justify-end border-t border-slate-300 gap-x-2 mt-4 pt-4">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded">
            Close
          </button>
  
          <button
            onClick={() => {
                handleUpdate();
            }}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded">
            Update
          </button>
        </div>
      </div>
    );
  }
