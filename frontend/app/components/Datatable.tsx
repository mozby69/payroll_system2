import { Column } from "../types/preparePayroll";

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
}

export default function Datatable<T>({ columns, data }: DataTableProps<T>) {

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-linear-to-r from-green-700 to-green-800 text-white">
            {columns.map((col, index) => (
              <th key={index}
                className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider border-b border-lime-600">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-6 text-center text-slate-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => ( 
              <tr key={rowIndex}
                className="hover:bg-slate-50 transition-colors duration-150 border border-green-100">
                {columns.map((col, colIndex) => (
                  <td key={colIndex}
                    className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                   {col.render ? col.render(row) : col.accessor?.(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>

      </table>
    </div>
  );
}
