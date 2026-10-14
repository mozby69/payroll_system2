import { AttendanceBreakdown, ComputedProps } from "@/app/services/preparePayroll";



type Props = {
  employee: ComputedProps;
  onClose?: () => void;
};

export default function ViewOvertime({employee}: Props) {
  const hasOvertime =
    Object.values(employee.OvertimeAtt).some(
      (time) => time.slice(0, 5) !== "00:00"
    ) ||
    Object.values(employee.RegularAtt).some(
      (time) => time.slice(0, 5) !== "00:00"
    ) ||
    Object.values(employee.NightShiftAtt).some(
      (time) => time.slice(0, 5) !== "00:00"
    ) ||
    Object.values(employee.NightShiftOtAtt).some(
      (time) => time.slice(0, 5) !== "00:00"
    );

  return (
    <div className="space-y-4">
      <div className="font-bold text-lg text-slate-600">
        {`${employee.EmpCode.Lastname}, ${employee.EmpCode.Firstname}`}
      </div>

      {!hasOvertime ? (
        <div className="border rounded-lg p-8 text-center bg-slate-50">
          <div className="text-slate-500 font-medium text-lg">
            No overtime for this employee.
          </div>
        </div>
      ) : (
        <>
          <AttendanceSection
            title="Overtime"
            data={employee.OvertimeAtt}
          />

          <AttendanceSection
            title="Regular Overtime(Under 8 Hours)"
            data={employee.RegularAtt}
          />

          <AttendanceSection
            title="Night Shift"
            data={employee.NightShiftAtt}
          />

          <AttendanceSection
            title="Night Shift Overtime"
            data={employee.NightShiftOtAtt}
          />
        </>
      )}
    </div>
  );
}





interface AttendanceSectionProps {
  title: string;
  data: AttendanceBreakdown;
}

function AttendanceSection({title,data}: AttendanceSectionProps) {

  const entries = Object.entries(data).filter(([, hours]) => {
    const displayTime = hours.slice(0, 5);
    return displayTime !== "00:00";
  });

  if (entries.length === 0) return null;

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-3">
        {title}
      </h3>

      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left pb-2">Day Type</th>
            <th className="text-right">Time</th>
          </tr>
        </thead>

        <tbody>
          {entries.map(([type, hours]) => (
            <tr key={type}>
              <td>{type}</td>
              <td className="text-right font-mono font-semibold">  {hours.slice(0, 5)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


