import {  useState } from "react";
import { EmployeeRow } from "../types/preparePayroll";
import RequestModal from "../components/Modal";
import SweetAlert from "../components/Swal";
import { useEmpLoansByCycle } from "../hooks/useLoans";
import { EditBasicSalaryModal } from "./EditBasicSalary";


export type PayrollSavePayload = {
  empCode?: string;
  basic_salary?: number;
  old_salary?: number;
  cash_assistance?: number;
  pagibig_employee_share?: number;
  remarks?: string;
};


interface ViewEmployeePayrollProps {
  employeeSummary: EmployeeRow;
  onFinalSave: (payload: PayrollSavePayload) => Promise<void>;
  onQuickSave: (payload: PayrollSavePayload) => Promise<void>;
  onClose: () => void;
}



export const ViewEmployeePayroll: React.FC<ViewEmployeePayrollProps> = ({employeeSummary,onFinalSave,onQuickSave,onClose}) => {


  const [basicSalary, setBasicSalary] = useState<number>(employeeSummary.basic_salary ?? 0);
  const [pagibigEmployeeShare, setPagibigEmployeeShare] = useState<string>(employeeSummary.pagibig_employee_share?.toString() ?? "");
  const [cashAssistance, setCashAssistance] = useState<string>(employeeSummary.cash_assistance?.toString() ?? "");
  const [sss] = useState<number>(Number(employeeSummary.sss_contrib ?? 0));
  const [philHealth] = useState<number>(Number(employeeSummary.phil_rate ?? 0));

  
  const [hasBasicSalary] = useState(employeeSummary.basic_salary > 0);


  const [showAddBasicSalary, setShowAddBasicSalary] = useState(false);




  // loans display use effect and query here ↓
  
  const { data, isLoading } = useEmpLoansByCycle({
    empCode: employeeSummary.EmpCode,
    payPeriod: employeeSummary.month_pay,
    payCycle: employeeSummary.next_payroll,
  });

  const fchLoan =
  isLoading || !data?.FCH_LOAN
    ? 0
    : data.FCH_LOAN.hasLedgerForCurrentCycle
      ? 0
      : data.FCH_LOAN.per_payroll_deduct;

const sssLoan =
  isLoading || !data?.SSS_LOAN
    ? 0
    : data.SSS_LOAN.hasLedgerForCurrentCycle
      ? 0
      : data.SSS_LOAN.per_payroll_deduct;

const rfcLoan =
  isLoading || !data?.RFC_LOAN
    ? 0
    : data.RFC_LOAN.hasLedgerForCurrentCycle
      ? 0
      : data.RFC_LOAN.per_payroll_deduct;

const pagibigLoan =
  isLoading || !data?.PAGIBIG_LOAN
    ? 0
    : data.PAGIBIG_LOAN.hasLedgerForCurrentCycle
      ? 0
      : data.PAGIBIG_LOAN.per_payroll_deduct;
const areloan =
  isLoading || !data?.ARE_LOAN
    ? 0
    : data.ARE_LOAN.hasLedgerForCurrentCycle
      ? 0
      : data.ARE_LOAN.per_payroll_deduct;

  
  
  return (
    <div className="bg-white rounded-lg pb-4 space-y-4 px-2 py-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-4">

        <div className="grid gap-y-1">
          <label className="font-bold">EMP CODE</label>
          <input
            type="text"
            value={employeeSummary.EmpCode}
            readOnly
            className="border py-2 px-2 rounded-lg bg-gray-100"
          />
        </div>

        <div className="grid gap-y-1">
          <label className="font-bold">BRANCH</label>
          <input
            type="text"
            value={employeeSummary.BranchCode?.branchCode}
            readOnly
            className="border py-2 px-2 rounded-lg bg-gray-100"
          />
        </div>

        <div className="grid">
        <label className="font-bold">BASIC SALARY</label>
        <div className="flex gap-x-2">
        <input
            type="number"
            value={basicSalary}
            readOnly
            className="border py-2 px-2 rounded-lg bg-gray-100 cursor-not-allowed"
          />
        <button
          onClick={() => setShowAddBasicSalary(true)}
          className="px-6 rounded bg-blue-600 hover:bg-blue-500 text-white">
          Edit
        </button>
        </div>
      </div>



    
      <div className="grid">
      <label className="font-bold">PAG-IBIG</label>
        <input
          type="number"
          value={pagibigEmployeeShare}
          onChange={(e) => setPagibigEmployeeShare(e.target.value)}
          className="border py-2 px-2 rounded-lg"
        />
    </div>

    <div className="grid">
        <label className="font-bold">CASH ASSISTANCE</label>
           <input
            type="number"
            value={cashAssistance}
            onChange={(e) => setCashAssistance(e.target.value)}
            className={`border py-2 px-2 rounded-lg bg-gray-100`}
          />
    </div>


        <div className="grid gap-y-1">
          <label className="font-bold">SSS</label>
          <input
            type="text"
            value={sss}
            readOnly
            className="border py-2 px-2 rounded-lg bg-gray-100"
          />
        </div>

        <div className="grid gap-y-1">
          <label className="font-bold">PHIL HEALTH</label>
          <input
            type="text"
            value={philHealth}
            readOnly
            className="border py-2 px-2 rounded-lg bg-gray-100"
          />
        </div>

        {/* Loan Code ↓ */}

        <div className="grid gap-y-1">
          <label className="font-bold">FCH LOAN</label>
          <input
            type="number"
            value={fchLoan}
            readOnly
            className="border py-2 px-2 rounded-lg bg-gray-100"
          />
        </div>

        <div className="grid gap-y-1">
          <label className="font-bold">SSS LOAN</label>
          <input
            type="number"
            value={sssLoan}
            readOnly
            className="border py-2 px-2 rounded-lg bg-gray-100"
          />
        </div>

        <div className="grid gap-y-1">
          <label className="font-bold">RFC LOAN</label>
          <input
            type="number"
            value={rfcLoan}
            readOnly
            className="border py-2 px-2 rounded-lg bg-gray-100"
          />
        </div>

        <div className="grid gap-y-1">
          <label className="font-bold">PAG-IBIG LOAN</label>
          <input
            type="number"
            value={pagibigLoan}
            readOnly
            className="border py-2 px-2 rounded-lg bg-gray-100"
          />
        </div>

        <div className="grid gap-y-1">
          <label className="font-bold">ARE LOAN</label>
          <input
            type="number"
            value={areloan}
            readOnly
            className="border py-2 px-2 rounded-lg bg-gray-100"
          />
        </div>

        {/* Loan Code ↑ */}

      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button onClick={onClose} className="px-4 py-2 bg-slate-300 hover:bg-slate-200 rounded">Cancel</button>
        <button
    
        onClick={() =>
          onFinalSave({
            ...(hasBasicSalary && {
              basic_salary: basicSalary,
              cash_assistance:cashAssistance !== "" ? Number(cashAssistance) : undefined,
            }),

            pagibig_employee_share:pagibigEmployeeShare !== "" ? Number(pagibigEmployeeShare) : undefined
          })
        }
        className={`px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-500`}>
        Update
      </button>
      </div>



        {showAddBasicSalary && (
          <RequestModal
            size="sm"
            nested
            title="Edit Basic Salary"
            onClose={() => setShowAddBasicSalary(false)}>
            <EditBasicSalaryModal
              currentSalary={basicSalary}
              onSave={async (payload) => {
                await onQuickSave({

                 empCode: employeeSummary.EmpCode,
                  basic_salary: payload.new_salary,
                  old_salary: payload.old_salary,
                  cash_assistance: payload.cash_assistance,
                  remarks: payload.remarks,

                });

                setBasicSalary(payload.new_salary);
                setCashAssistance(payload.cash_assistance.toString());

                SweetAlert.successAlert("Salary updated");
                setShowAddBasicSalary(false);
              }}
              onClose={() => setShowAddBasicSalary(false)}
            />
          </RequestModal>
        )}


    </div>
  );
};
