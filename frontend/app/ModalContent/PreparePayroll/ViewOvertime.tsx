import { ComputedProps } from "@/app/services/preparePayroll";



type Props = {
  employee: ComputedProps;
  onClose?: () => void;
};


export default function ViewOvertime({
  employee,
  onClose,
}: Props) {
  return (
    <div>
      <h2>View Overtime</h2>

      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(employee.OvertimeAtt).map(([type, hours]) => (
            <tr key={type}>
              <td>{type}</td>
              <td>{hours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}