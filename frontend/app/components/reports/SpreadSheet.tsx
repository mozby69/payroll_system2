import { useState } from "react";
import SweetAlert from "../Swal";
import { useSaveWtaxOverride } from "@/app/hooks/usePayrollArchive";

export interface SpreadsheetRow {
  name: string;
  basicPay: number;
  overtime: number;
  late: number;
  undertime: number;
  absence: number;
  gross: number;
  wtax: number;
  sss: number;
  philhealth: number;
  pagibig: number;
  arE: number;
  fch: number;
  rfc: number;
  salaryLoan: number;
  calamityLoan: number;
  pagibigSalaryLoan: number;
  netPayable: number;
  sssEmployer: number;
  philEmployer: number;
  pagibigEmployer: number;

  rowKey: string;
  PayCode: string;
  EmpCodeId: string;
  PayrollPeriod: string;
  computedWtax: number;
}


interface TotalsType{
  basicPay: number;
  overtime: number;
  late: number;
  undertime: number;
  absence: number;
  gross: number;
  wtax: number;
  sss: number;
  philhealth: number;
  pagibig: number;
  netPayable: number;
  sssEmployer: number;
  philEmployer: number;
  pagibigEmployer: number;
}

interface Props {
  data: SpreadsheetRow[];
  totals: TotalsType;
  onWtaxChange: (key: string, value: number) => void;
}


interface EditableProps {
  value: number;
  rowKey: string;
  emp: {
    PayCode: string;
    EmpCodeId: string;
    PayrollPeriod: string;
    computedWtax: number;
  };
  onChange: (key: string, value: number) => void;
}

function EditableWtax({
  value,
  rowKey,
  emp,
  onChange
}: EditableProps) {
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveOverride = useSaveWtaxOverride();

  const handleSave = async () => {
   
    if (value === emp.computedWtax) {
      return;
    }

    if (isSaving) return;

    try {
      setIsSaving(true);

      await saveOverride.mutateAsync({
        PayCode: emp.PayCode,
        EmpCodeId: emp.EmpCodeId,
        PayrollPeriod: emp.PayrollPeriod,
        computedWtax: emp.computedWtax,
        editedValue: value
      });

      SweetAlert.successAlert("Saved successfully");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (editing) {
    return (
      <input
        type="number"
        value={value}
        autoFocus
        onChange={(e) =>
          onChange(rowKey, Number(e.target.value))
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setEditing(false);
            handleSave();
          }
        }}
        onBlur={() => {
          setEditing(false);
          handleSave();
        }}
        className="w-20 border px-1"
      />
    );
  }



  return (
    <div onDoubleClick={() => setEditing(true)}>
      {value.toFixed(2)}
    </div>
  );
}

export default function SpreadSheet({ data,totals,onWtaxChange }: Props) {
  return (
    <div className="print-area1 w-full p-4">
      <table className="w-full border-collapse text-[9pt] table-auto">
        <thead>
          <tr className="border border-gray-300">
            <th colSpan={15}></th>
            <th
              colSpan={2}
              className="text-center py-2 border border-gray-300 align-middle bg-gray-50"
            >
              SSS LOANS
            </th>
            <th colSpan={2}></th>
            <th
              colSpan={3}
              className="text-center py-2 border border-gray-300 align-middle bg-gray-50"
            >
              EMPLOYER SHARE
            </th>
          </tr>

          <tr className="bg-gray-100 border border-slate-300">
            <th className="w-10 py-2 border border-slate-300">No.</th>
            <th className="w-40 py-2 border border-slate-300">Name</th>
            <th className="border border-slate-300">Basic Pay</th>
            <th className="border border-slate-300">Overtime</th>
            <th className="border border-slate-300">Late</th>
            <th className="border border-slate-300">Undertime</th>
            <th className="border border-slate-300">Absence</th>
            <th className="border border-slate-300">Gross</th>
            <th className="border border-slate-300">W/Tax</th>
            <th className="border border-slate-300">SSS</th>
            <th className="border border-slate-300">PhilHealth</th>
            <th className="border border-slate-300">Pag-ibig</th>
            <th className="border border-slate-300">AR/E</th>
            <th className="border border-slate-300">RFC</th>
            <th className="border border-slate-300">FCH</th>
            <th className="border border-gray-300">Salary</th>
            <th className="border border-gray-300">Calamity</th>
            <th>Pag. Sal. Ln</th>
            <th className="font-bold border border-slate-300">Net Payable</th>
            <th className="border border-gray-300">SSS</th>
            <th className="border border-gray-300">PhilHealth</th>
            <th className="border border-gray-300">Pag-ibig</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={20}
                className="py-6 border border-gray-300 italic text-center text-lg bg-gray-50 text-slate-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="border border-gray-300">
                <td className="py-2 text-center">{idx + 1}</td>
                <td className="py-2 text-center">{row.name}</td>
                <td className="py-2 text-center">{row.basicPay}</td>
                <td className="py-2 text-center">{row.overtime}</td>
                <td className="py-2 text-center">{row.late}</td>
                <td className="py-2 text-center">{row.undertime}</td>
                <td className="py-2 text-center">{row.absence}</td>
                <td className="py-2 text-center">{row.gross}</td>
                <td>
                  <EditableWtax
                    value={row.wtax}
                    rowKey={row.rowKey}
                    emp={{
                      PayCode: row.PayCode,
                      EmpCodeId: row.EmpCodeId,
                      PayrollPeriod: row.PayrollPeriod,
                      computedWtax: row.computedWtax
                    }}
                    onChange={onWtaxChange}
                  />
                </td>
                <td className="py-2 text-center">{row.sss}</td>
                <td className="py-2 text-center">{row.philhealth}</td>
                <td className="py-2 text-center">{row.pagibig}</td>
                <td className="py-2 text-center">{row.arE}</td>
                <td className="py-2 text-center">{row.rfc}</td>
                <td className="py-2 text-center">{row.fch}</td>
                <td className="py-2 text-center">{row.salaryLoan}</td>
                <td className="py-2 text-center">{row.calamityLoan}</td>
                <td className="py-2 text-center">{row.pagibigSalaryLoan}</td>

                <td className="py-2 text-center font-semibold bg-blue-50">
                  {row.netPayable.toFixed(2)}
                </td>

                <td className="py-2 text-center">{row.sssEmployer}</td>
                <td className="py-2 text-center">{row.philEmployer}</td>
                <td className="py-2 text-center">{row.pagibigEmployer}</td>
              </tr>
            ))
          )}
        </tbody>

        <tfoot>
        <tr className="border-t-2 border-black font-bold bg-gray-100">
          <td colSpan={2} className="py-2 text-center border border-gray-400">
            GRAND TOTAL
          </td>

          <td className="text-center border border-gray-400">{totals.basicPay.toFixed(2)}</td>
          <td className="text-center border border-gray-400">{totals.overtime.toFixed(2)}</td>
          <td className="text-center border border-gray-400">{totals.late.toFixed(2)}</td>
          <td className="text-center border border-gray-400">{totals.undertime.toFixed(2)}</td>
          <td className="text-center border border-gray-400">{totals.absence.toFixed(2)}</td>
          <td className="text-center border border-gray-400">{totals.gross.toFixed(2)}</td>
          <td className="text-center border border-gray-400">{totals.wtax.toFixed(2)}</td>
          <td className="text-center border border-gray-400">{totals.sss.toFixed(2)}</td>
          <td className="text-center border border-gray-400">{totals.philhealth.toFixed(2)}</td>
          <td className="text-center border border-gray-400">{totals.pagibig.toFixed(2)}</td>
          <td colSpan={6} className="border border-gray-400"></td>
          <td className="text-center bg-blue-200 border border-gray-400">{totals.netPayable.toFixed(2)}</td>
          <td className="text-center border border-gray-400">{totals.sssEmployer.toFixed(2)}</td>
          <td className="text-center border border-gray-400">{totals.philEmployer.toFixed(2)}</td>
          <td className="text-center border border-gray-400">{totals.pagibigEmployer.toFixed(2)}</td>
        </tr>
      </tfoot>


      </table>
    </div>
  );
}




