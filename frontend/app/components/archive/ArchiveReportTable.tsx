import { formatCurrency } from "@/app/utils/currencyConverter";

type Employee = {
  empCode: string;
  name: string;
  halfBasic: number;
  overtime: number;
  late: number;
  absences: number;
  total: number;
  pagIbigEmployeer: number;
  sssEmployeer: number;
  philhealthEmployeer: number;
};

type Props = {
  title: string;
  employees: Employee[];
};

export default function ArchiveReportTable({ title, employees }: Props) {
  if (!employees || employees.length === 0) return null;

  const toNumber = (val: unknown): number => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  const totals = employees.reduce(
    (acc, e) => ({
      halfBasic: acc.halfBasic + toNumber(e.halfBasic),
      overtime: acc.overtime + toNumber(e.overtime),
      late: acc.late + toNumber(e.late),
      absences: acc.absences + toNumber(e.absences),
      total: acc.total + toNumber(e.total),
      pagibig: acc.pagibig + toNumber(e.pagIbigEmployeer),
      sss: acc.sss + toNumber(e.sssEmployeer),
      philhealth: acc.philhealth + toNumber(e.philhealthEmployeer),
    }),
    {
      halfBasic: 0,
      overtime: 0,
      late: 0,
      absences: 0,
      total: 0,
      pagibig: 0,
      sss: 0,
      philhealth: 0,
    }
  );

  return (
    <div className="mt-8">

      {/* Section Title */}
      <h3 className="font-semibold text-lg mb-2">{title}</h3>

      <table className="w-full border-collapse text-sm table-fixed">

        <thead>
          <tr className="bg-gray-100 text-xs font-semibold">
            <th className="border px-2 py-1 text-left w-[22%]">EMPLOYEE</th>
            <th className="border px-2 py-1 text-right w-[9%]">HALF BASIC</th>
            <th className="border px-2 py-1 text-right w-[9%]">OVERTIME</th>
            <th className="border px-2 py-1 text-right w-[8%]">LATE</th>
            <th className="border px-2 py-1 text-right w-[9%]">ABSENCES</th>
            <th className="border px-2 py-1 text-right w-[9%]">TOTAL</th>
            <th className="border px-2 py-1 text-right w-[9%]">PAG-IBIG</th>
            <th className="border px-2 py-1 text-right w-[8%]">SSS</th>
            <th className="border px-2 py-1 text-right w-[9%]">PHILHEALTH</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr key={emp.empCode} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{emp.name}</td>

              <td className="border px-2 py-1 text-right tabular-nums">
                {formatCurrency(emp.halfBasic)}
              </td>

              <td className="border px-2 py-1 text-right tabular-nums">
                {formatCurrency(emp.overtime)}
              </td>

              <td className="border px-2 py-1 text-right tabular-nums">
                {formatCurrency(emp.late)}
              </td>

              <td className="border px-2 py-1 text-right tabular-nums">
                {formatCurrency(emp.absences)}
              </td>

              <td className="border px-2 py-1 text-right tabular-nums font-medium">
                {formatCurrency(emp.total)}
              </td>

              <td className="border px-2 py-1 text-right tabular-nums">
                {formatCurrency(emp.pagIbigEmployeer)}
              </td>

              <td className="border px-2 py-1 text-right tabular-nums">
                {formatCurrency(emp.sssEmployeer)}
              </td>

              <td className="border px-2 py-1 text-right tabular-nums">
                {formatCurrency(emp.philhealthEmployeer)}
              </td>
            </tr>
          ))}
        </tbody>

        {/* Totals Row */}
        <tfoot>
          <tr className="bg-gray-200 font-semibold">
            <td className="border px-2 py-1 text-right">TOTAL</td>

            <td className="border px-2 py-1 text-right">
              {formatCurrency(totals.halfBasic)}
            </td>

            <td className="border px-2 py-1 text-right">
              {formatCurrency(totals.overtime)}
            </td>

            <td className="border px-2 py-1 text-right">
              {formatCurrency(totals.late)}
            </td>

            <td className="border px-2 py-1 text-right">
              {formatCurrency(totals.absences)}
            </td>

            <td className="border px-2 py-1 text-right">
              {formatCurrency(totals.total)}
            </td>

            <td className="border px-2 py-1 text-right">
              {formatCurrency(totals.pagibig)}
            </td>

            <td className="border px-2 py-1 text-right">
              {formatCurrency(totals.sss)}
            </td>

            <td className="border px-2 py-1 text-right">
              {formatCurrency(totals.philhealth)}
            </td>
          </tr>
        </tfoot>

      </table>
    </div>
  );
}