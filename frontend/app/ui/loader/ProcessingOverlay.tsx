export function ProcessingOverlay({ message }: { message?: string }) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-80 text-center shadow-lg">
          <div className="mx-auto mb-4 h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-lg font-semibold">Processing Payroll</h2>
          <p className="text-sm text-slate-600 mt-2">
            {message ?? "Please wait. Do not close this page."}
          </p>
        </div>
      </div>
    );
  }
  