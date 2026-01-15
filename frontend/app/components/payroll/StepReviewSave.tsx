interface Props {
    onBack: () => void;
  }
  
  export default function StepReviewSave({ onBack }: Props) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Review & Save Payroll
        </h2>
  
        <div className="text-sm text-slate-600">
          Final payroll summary and confirmation.
        </div>
  
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="rounded-lg border px-5 py-2 text-sm"
          >
            Back
          </button>
  
          <button
            className="rounded-lg bg-green-600 px-6 py-2 text-sm text-white"
          >
            Save Payroll
          </button>
        </div>
      </div>
    );
  }
  