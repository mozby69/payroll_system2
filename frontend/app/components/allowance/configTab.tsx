import { useFetchEmergencyAllowanceList, useUpdateEmergencyAllowance } from "@/app/hooks/useAllowance";
import { useState } from "react";





export default function ConfigTab() {
    const { data } = useFetchEmergencyAllowanceList();
    const { mutate, isPending } = useUpdateEmergencyAllowance();

    const [isEmergency, setIsEmergency] = useState<boolean | null>(null);
    const [amount, setAmount] = useState<number | null>(null);

    const checked = isEmergency ?? data?.is_emergency ?? false;
    const value = amount ?? data?.emergency_allowance_amount ?? 0;

    const handleUpdate = () => {
        if (!data?.allowance_id) return;

        mutate({
            allowance_id: data.allowance_id,
            is_emergency: checked,
            emergency_allowance_amount: value,
        });
    };

    return (
        <div className="p-6 max-w-xl">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">

     
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                        Emergency Allowance Settings
                    </h2>
                    <p className="text-sm text-gray-500">
                        Enable or configure emergency allowance for employees.
                    </p>
                </div>

               
                <div className="flex items-center justify-between border rounded-lg p-4">
                    <div>
                        <p className="text-sm font-medium text-gray-700">
                            Activate Emergency Allowance
                        </p>
                        <p className="text-xs text-gray-500">
                            Turn on to allow emergency allowance.
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setIsEmergency(e.target.checked)}
                        className="h-5 w-5 accent-blue-600 cursor-pointer"
                    />
                </div>

          
                {checked && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Emergency Allowance Amount
                        </label>

                        <input
                            type="number"
                            value={value}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter amount"
                        />
                    </div>
                )}

        
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleUpdate}
                        disabled={isPending || !data}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-white text-sm font-medium hover:bg-blue-700 transition disabled:bg-gray-400">
                        {isPending ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}


