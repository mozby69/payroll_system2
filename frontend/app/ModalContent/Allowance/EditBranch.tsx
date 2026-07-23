import { useUpdateAbsentOverride, useUpdateBranch } from "@/app/hooks/useAllowance";
import { useFetchBranches } from "@/app/hooks/useGeneral";
import { AllowanceProps } from "@/app/types/allowanceType";
import { useState } from "react";






type EditBranchProps = {
  data: AllowanceProps | null;
  selectedMonth: string;
  onClose: () => void;
};

export default function EditBranchAllowance({ data, selectedMonth, onClose }: EditBranchProps) {
  const { data: branches = [] } = useFetchBranches();
  const updateBranch = useUpdateBranch();
  const [selectedBranch, setSelectedBranch] = useState<string>(data?.BranchCode.branchCode ?? "");
  const [absent, setAbsent] = useState<number>(data?.absent_count ?? 0);
  const updateAbsent = useUpdateAbsentOverride();
  const [isExcluded, setIsExcluded] =
    useState<boolean>(data?.exclude ?? false);

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
      exclude:isExcluded,
    })

    onClose();
  };


  return (
    <div>

      <div className="grid grid-rows-2 gap-y-4">


        <div>
          <label>Employee</label>
          <h2 className="border border-gray-300 p-2 rounded mt-2">{`${data?.Lastname}, ${data?.Firstname}`}</h2>
        </div>

        <div>

          <label className="block mb-2 text-sm text-gray-600">
            Select Branch
          </label>

          <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded">
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
            className="w-full px-3 py-2 border border-gray-300 rounded" />
        </div>


        <div>
          <label className="mb-2 block text-sm text-gray-600">Exclude</label>

          <label htmlFor="exclude"
            className="flex cursor-pointer items-center justify-between rounded-md border border-gray-300 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Exclude employee
              </p>

              <p className="text-xs text-gray-500">
                Employee will not be included in the alowance.
              </p>
            </div>

            <div className="relative">
              <input
                id="exclude"
           
                type="checkbox"
                checked={isExcluded}
                onChange={(event) =>
                  setIsExcluded(event.target.checked)
                }
                className="peer sr-only"
              />

              <div
                className="h-6 w-11 rounded-full bg-gray-300
                  transition-colors duration-200
                  peer-checked:bg-green-600
                  peer-focus-visible:ring-2
                  peer-focus-visible:ring-green-500
                  peer-focus-visible:ring-offset-2
                "
              />

              <div
                className="absolute left-1 top-1 h-4 w-4 rounded-full
                    bg-white shadow-sm transition-transform duration-200
                    peer-checked:translate-x-5
                  "
              />
            </div>
          </label>
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
