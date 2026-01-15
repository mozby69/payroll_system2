"use client";
import { useImportBranches } from "../hooks/usePreparePayroll";

export default function Import2() {
  const { mutate, isPending, data, error } = useImportBranches();

  const handleImport = () => {
    if (isPending) return;
    mutate();
  };

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold mb-4">Import Branches</h1>

      <button
        onClick={handleImport}
        disabled={isPending}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {isPending ? "Importing..." : "Import Branches"}
      </button>

      {data && (
        <div className="mt-3 text-green-700">
          <p>Branches imported: {data.inserted.branches}</p>
          <p>Employees imported: {data.inserted.employees}</p>
          <p>Employees Details imported: {data.inserted.employeeDetails}</p>
          <p>Company Details imported: {data.inserted.companyDetails}</p>
        </div>
      )}

      {error && (
        <p className="mt-3 text-red-600">
          Import failed
        </p>
      )}
    </div>
  );
}
