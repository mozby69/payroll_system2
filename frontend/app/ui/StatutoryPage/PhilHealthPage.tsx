import { useFetchPhilList, useUpdatePhilhealth } from "@/app/hooks/useStatutory";
import {  useState } from "react";






export default function PhilhealthPage() {
    const { data: philhealth_data, isLoading } = useFetchPhilList();
    const updateMutation = useUpdatePhilhealth();
  
    const [percentage, setPercentage] = useState<string>("");

    const initialRate = philhealth_data?.SettingPercentage ?? "";
    
    if (percentage === "" && initialRate !== "") {
      setPercentage(initialRate);
    }
  
    const handleUpdate = async () => {
      if (!philhealth_data) return;
  
      await updateMutation.mutateAsync({
        id: philhealth_data.id,
        SettingPercentage: percentage,
      });
    };
  
    if (isLoading) return <p>Loading...</p>;
    if (!philhealth_data) return null;

      return (
        <>
        <div className="max-w-xl bg-white border border-slate-200 rounded-xl shadow-sm p-6">
 
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800">
              {philhealth_data.SettingName} Configuration
            </h2>
            <p className="text-sm text-slate-500">
              Update the current contribution percentage rate.
            </p>
          </div>
    
         
          <div className="grid gap-2 mb-6">
            <label className="text-sm font-medium text-slate-700">
              Philhealth Rate
            </label>
    
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.01"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="w-40 border border-slate-300 px-4 py-2 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:border-blue-500 transition"
              />
    
                <span className="text-sm text-slate-500">
                {percentage ? `= ${(Number(percentage) * 100).toFixed(2)} %`  : "Enter rate"}
                </span>
            </div>
          </div>
    
  
          <div className="flex justify-end border-t pt-4">
            <button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-500 hover:cursor-pointer
                         disabled:bg-blue-300 
                         text-white text-sm font-medium 
                         px-5 py-2 rounded-lg 
                         transition">
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>



        </>
      );
}