interface Props {
    onBack: () => void;
    onNext: () => void;
  }
  
  export default function StepComputePayroll({ onBack, onNext }: Props) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Compute Payroll
        </h2>
  
        <div className="text-sm text-slate-600">
          Payroll computation logic and previews go here.
        </div>
  
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="rounded-lg border px-5 py-2 text-sm"
          >
            Back
          </button>
  
          <button
            onClick={onNext}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm text-white"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }
  