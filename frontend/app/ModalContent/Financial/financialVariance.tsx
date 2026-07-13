import { useDisplayVariance } from "@/app/hooks/useVariance";
import { CycleCategory } from "@/app/types/varianceType";
import EmployeeVariance from "./EmployeeVariance"; 
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
//import EmployeeVariance from "./EmployeeVariance";



interface Props {
  paycode: string;
  cycle: CycleCategory;
  company_id?: string;
}

type VarianceRow = {
  paycode?: string;
  basic_pay?: number;
  basic_pay_variance?: number;

  pagibig_employee?: number;
  pagibig_employer?: number;
  wtax?: number;

  sss_employee?: number;
  sss_employee_variance?: number;
  sss_employer?: number;
  sss_employer_variance?: number;

  phil_employee?: number;
  phil_employee_variance?: number;
  phil_employer?: number;
  phil_employer_variance?: number;
};

type ColumnKey =
  | "basic_pay"
  | "pagibig_employee"
  | "pagibig_employer"
  | "wtax"
  | "sss_employee"
  | "sss_employer"
  | "phil_employee"
  | "phil_employer";

interface ColumnDefinition {
  key: ColumnKey;
  label: string;
  varianceKey?: keyof VarianceRow;
}

const allColumns: ColumnDefinition[] = [
  {
    key: "basic_pay",
    label: "BASIC",
    varianceKey: "basic_pay_variance",
  },
  {
    key: "pagibig_employee",
    label: "PAG-IBIG EMPLOYEE",
  },
  {
    key: "pagibig_employer",
    label: "PAG-IBIG EMPLOYER",
  },
  {
    key: "wtax",
    label: "WITHHOLDING TAX",
  },
  {
    key: "sss_employee",
    label: "SSS EMPLOYEE",
    varianceKey: "sss_employee_variance",
  },
  {
    key: "sss_employer",
    label: "SSS EMPLOYER",
    varianceKey: "sss_employer_variance",
  },
  {
    key: "phil_employee",
    label: "PHILHEALTH EMPLOYEE",
    varianceKey: "phil_employee_variance",
  },
  {
    key: "phil_employer",
    label: "PHILHEALTH EMPLOYER",
    varianceKey: "phil_employer_variance",
  },
];

export default function FinancialVarianceModal({
  paycode,
  cycle,
  company_id,
}: Props) {
  const { data, isLoading } = useDisplayVariance(company_id, cycle);

  const variance = data?.data;

  const rows: VarianceRow[] = variance
    ? [
      variance.older_prev,
      variance.recent_prev,
      variance.current,
      variance.variance,
    ]
    : [];

  const columns = allColumns.filter((column) => {
    return rows.some((row) => {
      const value = row[column.key];
      const varianceValue = column.varianceKey
        ? row[column.varianceKey]
        : undefined;

      return value !== undefined || varianceValue !== undefined;
    });
  });

  const getValue = (row: VarianceRow, column: ColumnDefinition) => {
    if (row.paycode === "VARIANCE" && column.varianceKey) {
      return Number(row[column.varianceKey] ?? row[column.key] ?? 0);
    }

    return Number(row[column.key] ?? 0);
  };

  const formatAmount = (value: number) => {
    const absValue = Math.abs(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return value < 0 ? `(${absValue})` : absValue;
  };


  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Deductions",
    pageStyle: `
    @page {
      size: landscape;
      margin: 20mm;
    }

    @media print {
      .table-print-wrapper {
        overflow: visible !important;
        width: 100% !important;
      }

      .print-area {
        overflow: visible !important;
      }

      table {
        width: 100% !important;
        font-size: 10px;
      }

      th, td {
        padding: 4px !important;
        white-space: nowrap;
      }
    }
  `,
  });


  return (
    <div className="p-1">


      <div className="py-4 flex justify-end">
        <button
          onClick={handlePrint}
          className="bg-blue-700 py-2 px-8 rounded text-white font-bold hover:bg-blue-500">
          Print
        </button>

      </div>


      <div ref={printRef} className="print-deductions">

        {isLoading ? (
          <div className="text-sm text-slate-500">Loading variance...</div>
        ) : (

          <div className="overflow-x-auto px-4">
            <div className="py-8 font-bold text-xs">
              <h2>EMB CAPITAL LENDING CORP.</h2>
              <h2>PAYROLL EXPLANATION</h2>
              <h2>FOR THE PERIOD :{paycode}</h2>
            </div>

            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-slate-400 px-3 py-2 text-left" />

                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="border border-slate-400 px-3 py-2 italic">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.paycode ?? "row"}-${index}`}
                    className={row.paycode === "VARIANCE" ? "font-semibold" : ""}>
                    <td className="border border-slate-400 px-3 py-2 whitespace-nowrap italic">
                      {row.paycode ?? ""}
                    </td>

                    {columns.map((column) => (
                      <td
                        key={`${row.paycode ?? "row"}-${column.key}-${index}`}
                        className="border border-slate-400 px-3 py-2 text-right italic">
                        {formatAmount(getValue(row, column))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


        )}


        <div className="py-4">
          <EmployeeVariance paycode={paycode} cycle={cycle} company_id={company_id} />
        </div>

      </div>

    </div>
  );
}