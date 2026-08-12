import { GmailAccountResponse } from "@/app/types/empTypes";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

type Props = {
  data: GmailAccountResponse;
  isLoading?: boolean;
};

export default function GmailAccountList({
  data,
  isLoading = false,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,

    documentTitle: "Gmail Account List",

    pageStyle: `
      @page {
        size: landscape;
        margin: 15mm;
      }

      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .print-area {
          width: 100% !important;
          overflow: visible !important;
        }

        table {
          width: 100% !important;
          border-collapse: collapse !important;
          font-size: 10px !important;
        }

        th,
        td {
          padding: 6px !important;
          white-space: nowrap !important;
        }

        thead {
          display: table-header-group;
        }

        tr {
          page-break-inside: avoid;
        }
      }
    `,
  });

  if (isLoading) {
    return (
      <div className="py-10 text-center text-sm text-slate-500">
        Loading Gmail accounts...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-slate-500">
        No employees found.
      </div>
    );
  }

  return (
    <div>
      <div className="py-4 flex justify-end">
        <button
          type="button"
          onClick={handlePrint}
          className="bg-green-700 text-white px-8 py-2.5 rounded hover:bg-green-600"
        >
          Print
        </button>
      </div>

      <div
        ref={printRef}
        className="print-area overflow-x-auto"
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-700">
            Employee Gmail Account List
          </h2>
        </div>

        <table className="w-full border-collapse text-sm text-slate-700">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-300 px-4 py-3 text-left font-semibold">
                Employee Code
              </th>

              <th className="border border-slate-300 px-4 py-3 text-left font-semibold">
                Name
              </th>

              <th className="border border-slate-300 px-4 py-3 text-left font-semibold">
                Gmail Account
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((employee) => (
              <tr
                key={employee.emp_code}
                className="hover:bg-slate-50"
              >
                <td className="border border-slate-300 px-4 py-3">
                  {employee.emp_code}
                </td>

                <td className="border border-slate-300 px-4 py-3">
                  {employee.name}
                </td>

                <td className="border border-slate-300 px-4 py-3">
                  {employee.gmail_account?.trim() || (
                    <span className="text-slate-400">
                      No Gmail account
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}