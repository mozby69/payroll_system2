import { useUpdateVacationLeave } from "@/app/hooks/useConversion";
import { conversionProps } from "@/app/types/conversionType";
import {  useState } from "react";






interface EditLeaveProps {
    data: conversionProps;
    onClose: () => void;
  }
  
  export default function EditLeave({ data, onClose }: EditLeaveProps) {
    const [leaveConvert, setLeaveConvert] = useState<boolean>(data.leave_convert ?? false);
    const [vacation, setVacation] = useState<number>(Number(data.vacation) ?? 0);

   
  
    const { mutate: updateLeave, isPending } = useUpdateVacationLeave();
     
  
    const handleUpdate = () => {
      updateLeave(
        {
          id: data.id,
          leave_convert: leaveConvert,
          Vacation: vacation,
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    };
  
    return (
        <>
          {/* Leave Conversion Card */}
          <div className="p-6 space-y-5">
      
            {/* Toggle Row */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Convert Vacation Leave</p>
                  <p className="text-xs text-gray-400">Enable to set convertible leave days</p>
                </div>
              </div>
      
              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setLeaveConvert(!leaveConvert)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  leaveConvert ? "bg-emerald-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    leaveConvert ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
      
            {/* Vacation Leave Input */}
            <div className={`space-y-1.5 transition-opacity duration-200 ${!leaveConvert ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Vacation Leave Days
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  type="number"
                  value={vacation}
                  disabled={!leaveConvert}
                  onChange={(e) => setVacation(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2.5 text-sm font-medium text-gray-800 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all placeholder:text-gray-300"
                  placeholder="Enter number of days"
                />
              </div>
              <p className="text-xs text-gray-400">Enter the total number of vacation leave days to convert.</p>
            </div>
          </div>
      
          {/* Divider */}
          <div className="h-px bg-gray-100 mx-6" />
      
          {/* Actions */}
          <div className="flex items-center justify-end gap-2 px-6 py-4">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isPending}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2">
              {isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </button>
          </div>
        </>
      );
  }