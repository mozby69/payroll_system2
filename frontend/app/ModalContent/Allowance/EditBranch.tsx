import { useUpdateAbsentOverride, useUpdateAllowanceAmountOverride, useUpdateBranch } from "@/app/hooks/useAllowance";
import { useFetchBranches } from "@/app/hooks/useGeneral";
import { AllowanceProps } from "@/app/types/allowanceType";
import { useState } from "react";





type EditBranchProps = {
  data: AllowanceProps | null;
  selectedMonth: string;
  onClose: () => void;
};

export default function EditBranchAllowance({data, selectedMonth,onClose}: EditBranchProps) {
  const { data: branches = [] } = useFetchBranches();

  const updateBranch = useUpdateBranch();
  const updateAbsent = useUpdateAbsentOverride();
  const updateAllowanceAmount = useUpdateAllowanceAmountOverride();

  const [selectedBranch, setSelectedBranch] = useState(
    () => data?.BranchCode?.branchCode ?? ""
  );

  const [absent, setAbsent] = useState(
    () => Number(data?.absent_count ?? 0)
  );

  const [cashAssitance, setCashAssistance] = useState(
    () => Number(data?.cash_assistance ?? 0)
  );

  const [ecola, setEcola] = useState(
    () => Number(data?.ecola ?? 0)
  );

  const [isExcluded, setIsExcluded] = useState(
    () => Boolean(data?.exclude ?? false)
  );



 

  if (!data) return null;

 const handleUpdate = () => {
  const originalBranch = data.BranchCode?.branchCode ?? "";

  const originalAbsent = Number(data.absent_count ?? 0);

  const originalExcluded = Boolean(data.exclude ?? false);

  const originalCashAssistance = Number(data.cash_assistance ?? 0);

  const originalEcola = Number(data.ecola ?? 0);

  const branchChanged = selectedBranch !== originalBranch;

  const absentChanged = absent !== originalAbsent ||  isExcluded !== originalExcluded;

  const allowanceChanged = cashAssitance !== originalCashAssistance || ecola !== originalEcola;

  if (branchChanged) {
    updateBranch.mutate({
      EmpCode: data.EmpCode,
      branchCode: selectedBranch,
      selectedMonth,
    });
  }

  if (absentChanged) {
    updateAbsent.mutate({
      EmpCode: data.EmpCode,
      selectedMonth,
      absent_hours: absent,
      exclude: isExcluded,
    });
  }

  if (allowanceChanged) {
    updateAllowanceAmount.mutate({
      EmpCode: data.EmpCode,
      selectedMonth,
      cash_assistance: cashAssitance,
      ecola,
    });
  }

  onClose();
};

  return (
    <div>
      <div className="grid grid-rows-2 grid-cols-2  gap-4">
        <div>
          <label className="font-bold">Employee</label>

          <h2 className="border border-gray-300 p-2 rounded mt-2">
            {`${data.Lastname}, ${data.Firstname}`}
          </h2>
        </div>

        <div>
          <label className="block mb-2 text-sm text-gray-600 font-bold">
            Select Branch
          </label>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            {branches.map((b) => (
              <option key={b.branchCode} value={b.branchCode}>
                {b.branchCode}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm text-gray-600 font-bold">
            Absent Count
          </label>

          <input
            value={absent}
            onChange={(e) => setAbsent(Number(e.target.value))}
            type="number"
            placeholder="Input absent count..."
            className="w-full px-3 py-2 border border-gray-300 rounded font-mono"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm text-gray-600 font-bold">
            Cash Assistance
          </label>

          <input
            value={cashAssitance}
            onChange={(e) => setCashAssistance(Number(e.target.value))}
            type="number"
            placeholder="Input cash assistance..."
            className="w-full px-3 py-2 border border-gray-300 rounded font-mono"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm text-gray-600 font-bold">
            Ecola
          </label>

          <input
            value={ecola}
            onChange={(e) => setEcola(Number(e.target.value))}
            type="number"
            placeholder="Input ecola..."
            className="w-full px-3 py-2 border border-gray-300 rounded font-mono"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-600 font-bold">
            Exclude
          </label>

          <label
            htmlFor="exclude"
            className="flex cursor-pointer items-center justify-between rounded-md border border-gray-300 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-gray-700">
                Exclude employee
              </p>

              <p className="text-xs text-gray-500">
                Employee will not be included in the allowance.
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
                className="
                  h-6 w-11 rounded-full bg-gray-300
                  transition-colors duration-200
                  peer-checked:bg-green-600
                  peer-focus-visible:ring-2
                  peer-focus-visible:ring-green-500
                  peer-focus-visible:ring-offset-2
                "
              />

              <div
                className="
                  absolute left-1 top-1 h-4 w-4 rounded-full
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
          className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>

        <button
          onClick={handleUpdate}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
        >
          Update
        </button>
      </div>
    </div>
  );
}