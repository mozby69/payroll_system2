interface Props {
    data: any;
    onNext: () => void;
  }
  
  export default function StepConfirmEmployees({ data, onNext }: Props) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Confirm Employee Details
        </h2>
  
        <div className="text-sm text-slate-600">
          Attendance data preview ({data?.length ?? 0} employees)
        </div>
  
        <div className="flex justify-end">
          <button
            onClick={onNext}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-500"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }
  