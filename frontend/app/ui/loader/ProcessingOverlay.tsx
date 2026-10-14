import { BulkPayslipProgress } from "@/app/components/archive/GeneratePayslipModal";

export function ProcessingOverlay({title="Processing Payroll", message }: { title?: string, message?: string }) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-80 text-center shadow-lg">
          <div className="mx-auto mb-4 h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-slate-600 mt-2">
            {message ?? "Please wait. Do not close this page."}
          </p>
        </div>
      </div>
    );
  }
  





type PayslipProgressOverlayProps = {
  progress: BulkPayslipProgress;
};



export function PayslipProgressOverlay({
  progress,
}: PayslipProgressOverlayProps) {
  const displayTotal =
    progress.total > 0
      ? progress.total
      : "Loading";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Sending Payslips
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Please keep this page open while
            the payslips are generated and
            emailed.
          </p>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {progress.completed} of{" "}
              {displayTotal} completed
            </span>

            <span className="text-sm font-semibold text-blue-600">
              {progress.percentage}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-[width] duration-300 ease-out"
              style={{
                width: `${progress.percentage}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-green-50 p-3 text-center">
            <p className="text-xl font-semibold text-green-700">
              {progress.sent}
            </p>

            <p className="text-xs font-medium text-green-600">
              Sent
            </p>
          </div>

          <div className="rounded-xl bg-amber-50 p-3 text-center">
            <p className="text-xl font-semibold text-amber-700">
              {progress.skipped}
            </p>

            <p className="text-xs font-medium text-amber-600">
              Skipped
            </p>
          </div>

          <div className="rounded-xl bg-red-50 p-3 text-center">
            <p className="text-xl font-semibold text-red-700">
              {progress.failed}
            </p>

            <p className="text-xs font-medium text-red-600">
              Failed
            </p>
          </div>
        </div>

        {progress.currentEmployeeCode && (
          <p className="mt-5 truncate text-center text-xs text-gray-500">
            Last processed employee:{" "}
            <span className="font-medium text-gray-700">
              {
                progress.currentEmployeeCode
              }
            </span>
          </p>
        )}
      </div>
    </div>
  );
}