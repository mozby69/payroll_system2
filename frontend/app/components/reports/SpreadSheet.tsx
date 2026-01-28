import { PayrollEmployee } from "@/app/hooks/usePayrollArchive";
import { dummySummary } from "@/app/types/dummyData";

interface Props {
  data: PayrollEmployee[];
}
 
export default function SpreadSheet({ data }: Props) {
  return (
    <div className="print-area w-full p-4">
      <table className="w-full border-collapse text-[9pt] table-auto">
        <thead>

        <tr className="border-t border-gray-300">
            <th colSpan={13}></th>
            <th colSpan={2} className="text-center py-2 border border-gray-300 align-middle bg-gray-50">SSS LOANS</th>
            <th colSpan={2}></th>
            <th colSpan={3} className="text-center py-2 border border-gray-300 align-middle bg-gray-50">EMPLOYER SHARE</th>
          </tr>

          <tr className=" bg-gray-100">
            <th className="w-10 py-2 align-middle">No.</th>
            <th className="w-40 py-2 align-middle">Name</th>
            <th className="py-2 align-middle">Basic Pay</th>
            <th className="py-2 align-middle">Overtime</th>
            <th className="py-2 align-middle">Late</th>
            <th className="py-2 align-middle">Absence</th>
            <th className="py-2 align-middle">Gross</th>
            <th className="py-2 align-middle">W/Tax</th>
            <th className="py-2 align-middle">SSS</th>
            <th className="py-2 align-middle">PhilHealth</th>
            <th className="py-2 align-middle">Pag-ibig</th>
            <th className="py-2 align-middle">AR/E</th>
            <th className="py-2 align-middle">FCH</th>
            <th className="py-2 border border-gray-300 align-middle">Salary</th>
            <th className="py-2 border border-gray-300 align-middle">Calamity</th>
            <th className="py-2 align-middle">Pag. Sal. Ln</th>
            <th className="py-2 align-middle font-bold">Net Payable</th>
            <th className="py-2 align-middle border border-gray-300">SSS</th>
            <th className="py-2 align-middle border border-gray-300">PhilHealth</th>
            <th className="py-2 align-middle border border-gray-300">Pag-ibig</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, idx) => (
            <tr key={row.EmpCodeId} className="border-b border-gray-300">
              <td className="py-2 text-center">{idx + 1}</td>

              {/* ✅ Firstname + Lastname */}
              <td className="py-2 text-center">
                {row.EmpCode.Lastname}, {row.EmpCode.Firstname}
              </td>

              <td className="py-2 text-center">{row.semi_monthly}</td>
              <td className="py-2 text-center">{row.overtime}</td>
              <td className="py-2 text-center">{row.late_count}</td>
              <td className="py-2 text-center">{row.TotalAbsentHours}</td>
              <td className="py-2 text-center">0</td>
              <td className="py-2 text-center">0</td>
              <td className="py-2 text-center">0</td>
              <td className="py-2 text-center">0</td>
              <td className="py-2 text-center">0</td>
              <td className="py-2 text-center">0</td>
              <td className="py-2 text-center">0</td>
              <td className="py-2 text-center">0</td>
              <td className="py-2 text-center">0</td>
              <td className="py-2 text-center">0</td>
              <td className="py-2 text-center font-semibold bg-blue-50">0</td>
              <td className="py-2 text-center">0</td>
              <td className="py-2 text-center">0</td>
              <td className="py-2 text-center">0</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
