export type StepStatus = "completed" | "current" | "pending";

export interface Step {
  id: number;
  title: string;
  status: StepStatus;
}

interface StepperProps {
  steps: Step[];
}

export default function Stepper({ steps }: StepperProps) {
  return (
    <div className="flex w-full items-center justify-center">
      {steps.map((step, index) => (
        <div key={step.id} className="flex flex-1 items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold
                ${
                  step.status === "completed"
                    ? "bg-green-600 text-white"
                    : step.status === "current"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
            >
              {step.id}
            </div>

            <span
              className={`mt-2 text-xs
                ${
                  step.status === "current"
                    ? "text-blue-600"
                    : step.status === "completed"
                    ? "text-green-600"
                    : "text-slate-400"
                }`}
            >
              {step.title}
            </span>
          </div>

          {index < steps.length - 1 && (
            <div
              className={`mx-2 h-0.5 flex-1
                ${
                  step.status === "completed"
                    ? "bg-green-600"
                    : "bg-slate-200"
                }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
