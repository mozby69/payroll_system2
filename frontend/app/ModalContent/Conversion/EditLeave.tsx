import { useUpdateVacationLeave } from "@/app/hooks/useConversion";
import { conversionProps } from "@/app/types/conversionType";
import { useState } from "react";






interface EditLeaveProps {
  data: conversionProps;
  onClose: () => void;
}

export default function EditLeave({ data, onClose }: EditLeaveProps) {
  const [leaveConvert, setLeaveConvert] = useState<number | ''>(data.leave_convert ? Number(data.leave_convert) : '');
  const [vacation] = useState<number>(Number(data.vacation) ?? 0);



  const { mutate: updateLeave, isPending } = useUpdateVacationLeave();


  const handleUpdate = () => {
    updateLeave(
      {
        id: data.id,
        leave_convert: leaveConvert === '' ? 0 : leaveConvert,
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



        <div className={`space-y-1.5 transition-opacity duration-200`}>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Remaining Vacation Leave Days
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
              readOnly
              className="w-full pl-9 pr-4 py-2.5 text-sm font-medium text-gray-800 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all placeholder:text-gray-300"
              placeholder="Enter number of days"
            />
          </div>
          <p className="text-xs text-gray-400">Available Vacation leave per DTR</p>
        </div>


        <div className={`space-y-1.5 transition-opacity duration-200`}>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            VL FOR CONVERT
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <input
              type="number"
              value={leaveConvert}
              onChange={(e) => {
                const value = e.target.value;
                setLeaveConvert(value === '' ? '' : Number(value));
              }}
              className="w-full pl-9 pr-4 py-2.5 text-sm font-medium text-gray-800 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all placeholder:text-gray-300"
              placeholder="Enter number of days"
            />
          </div>
          <p className="text-xs text-gray-400">Input vacation leave to convert</p>
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