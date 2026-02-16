import { useEffect, useState } from "react";
import { EmployeeRow, PayrollSummary } from "../types/preparePayroll";
import Image from 'next/image'
import { AddPagibigModal } from "./AddPagibigModal";
import RequestModal from "../components/Modal";
import { AddBasicSalaryModal } from "./AddBasicSalary";
import SweetAlert from "../components/Swal";
import { useEmpLoansByCycle } from "../hooks/useLoans";


export type PayrollSavePayload = {
  basic_salary?: number;
  cash_assistance?:number;
  pagibig_employee_share?: number;
  pagibig_employer_share?: number;
};



interface ViewEmployeePayrollProps {
  employeeSummary: EmployeeRow;
  onFinalSave: (payload: PayrollSavePayload) => Promise<void>;
  onQuickSave: (payload: PayrollSavePayload) => Promise<void>;
  onClose: () => void;
}



export const ViewEmployeePayroll: React.FC<ViewEmployeePayrollProps> = ({employeeSummary,onFinalSave,onQuickSave,onClose}) => {


  const [basicSalary, setBasicSalary] = useState<number>(employeeSummary.basic_salary ?? 0);
  const [pagibigEmployeeShare, setPagibigEmployeeShare] = useState<number>(employeeSummary.pagibig_employee_share ?? 0);
  const [pagibigEmployerShare, setPagibigEmployerShare] = useState<number>(employeeSummary.pagibig_employer_share ?? 0);
  const [cashAssistance, setCashAssistance] = useState<number>(Number(employeeSummary.cash_assistance ?? 0));
  const [sss, setSSS] = useState<number>(Number(employeeSummary.sss_contrib ?? 0));
  const [philHealth, setPhilHealth] = useState<number>(Number(employeeSummary.phil_rate ?? 0));

  
  const [hasBasicSalary, setHasBasicSalary] = useState(employeeSummary.basic_salary > 0);
  const [hasPagibig, setHasPagibig] = useState(employeeSummary.pagibig_id !== "N/A");
  const [showAddPagibig, setShowAddPagibig] = useState(false);
  const [showAddBasicSalary, setShowAddBasicSalary] = useState(false);
  const [fchLoan, setFchLoan] = useState(employeeSummary.fch_loan ?? 0);
  const [sssLoan, setSssLoan] = useState(employeeSummary.sss_loan ?? 0);
  const [rfcLoan, setRfcLoan] = useState(employeeSummary.rfc_loan ?? 0)
  const [pagibigLoan, setPagibigLoan] = useState(employeeSummary.pagibig_loan ?? 0);





  // loans display use effect and query here ↓
  
  const { data, isLoading } = useEmpLoansByCycle({
    empCode: employeeSummary.EmpCode,
    payPeriod: employeeSummary.month_pay,
    payCycle: employeeSummary.next_payroll,
  });

  useEffect(() => {
    if (!data) return;

    if (data.FCH_LOAN) {
      setFchLoan(
        data.FCH_LOAN.hasLedgerForCurrentCycle
          ? 0
          : data.FCH_LOAN.per_payroll_deduct
      );
    } else {
      setFchLoan(0);
    }
    if (data.RFC_LOAN) {
      setRfcLoan(
        data.RFC_LOAN.hasLedgerForCurrentCycle
          ? 0
          : data.RFC_LOAN.per_payroll_deduct
      );
    } else {
      setRfcLoan(0);
    }

    if (data.SSS_LOAN) {
      setSssLoan(
        data.SSS_LOAN.hasLedgerForCurrentCycle
          ? 0
          : data.SSS_LOAN.per_payroll_deduct
      );
    } else {
      setSssLoan(0);
    }

    if (data.PAGIBIG_LOAN) {
      setPagibigLoan(
        data.PAGIBIG_LOAN.hasLedgerForCurrentCycle
          ? 0
          : data.PAGIBIG_LOAN.per_payroll_deduct
      );
    } else {
      setPagibigLoan(0);
    }
  }, [data]);

  useEffect(() => {
    if (isLoading) {
      setFchLoan(0);
      setSssLoan(0);
      setPagibigLoan(0);
      setRfcLoan(0);
    }
  }, [isLoading]);


  // loans display use effect and query here ↑


  

  const onAddBasicSalary = () => {
    setShowAddBasicSalary(true);
  };

  const canUpdate = hasBasicSalary || hasPagibig;

  useEffect(() => {
    setBasicSalary(employeeSummary.basic_salary ?? 0);
    setCashAssistance(Number(employeeSummary.cash_assistance ?? 0));
    setPagibigEmployeeShare(employeeSummary.pagibig_employee_share ?? 0);
    setPagibigEmployerShare(employeeSummary.pagibig_employer_share ?? 0);
    setSSS(Number(employeeSummary.sss_contrib ?? 0));
    setPhilHealth(Number(employeeSummary.phil_rate ?? 0));
  
    setHasBasicSalary((employeeSummary.basic_salary ?? 0) > 0);
    setHasPagibig(employeeSummary.pagibig_id !== "N/A");
  }, [employeeSummary]);
  

  
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
            onChange={(e) => setBasicSalary(Number(e.target.value))}
            disabled={!hasBasicSalary}
            className={`border py-2 px-2 rounded-lg ${
              !hasBasicSalary ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />

          <button
            onClick={onAddBasicSalary}
            disabled={hasBasicSalary}
            className={`px-6 rounded text-white ${
              hasBasicSalary
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500"
            }`}>
            Add
          </button>
        </div>
      </div>



    
      <div className="grid">
      <label className="font-bold">PAG-IBIG</label>
      <div className="flex gap-x-2">
        <input
          type="number"
          value={pagibigEmployeeShare}
          onChange={(e) => setPagibigEmployeeShare(Number(e.target.value))}
          disabled={!hasPagibig}
          className={`border py-2 px-2 rounded-lg ${
            !hasPagibig ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
        />

        <button
          onClick={() => setShowAddPagibig(true)}
          disabled={hasPagibig}
          className={`px-6 rounded text-white ${
            hasPagibig
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500"
          }`}>
          Add
        </button>
      </div>
    </div>

    <div className="grid">
        <label className="font-bold">
          CASH ASSISTANCE {!hasBasicSalary && "(Add Basic Salary first)"}
        </label>

           <input
            type="number"
            value={cashAssistance}
            onChange={(e) => setCashAssistance(Number(e.target.value))}
            disabled={!hasBasicSalary}
            className={`border py-2 px-2 rounded-lg ${
              !hasBasicSalary ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
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

        {/* Loan Code ↑ */}

      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button onClick={onClose} className="px-4 py-2 bg-slate-300 hover:bg-slate-200 rounded">Cancel</button>
        <button
        disabled={!canUpdate}
        onClick={() =>
          onFinalSave({
            ...(hasBasicSalary && {
              basic_salary: basicSalary,
              cash_assistance: cashAssistance,
            }),
            ...(hasPagibig && {
              pagibig_employee_share: pagibigEmployeeShare,
              pagibig_employer_share: pagibigEmployerShare,
            }),
          })
        }
        className={`px-4 py-2 rounded ${
          canUpdate
            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        Update
      </button>
      </div>


      {showAddPagibig && (
            <RequestModal
              size="sm"
              nested
              title="Add Pag-IBIG"
              onClose={() => setShowAddPagibig(false)}>
              <AddPagibigModal
            onSave={async (payload) => {
              await onQuickSave({
                pagibig_employee_share: payload.pagibig_employee_share,
                pagibig_employer_share: payload.pagibig_employer_share,
              });

              setPagibigEmployeeShare(payload.pagibig_employee_share);
              setPagibigEmployerShare(payload.pagibig_employer_share);
              setHasPagibig(true);

              SweetAlert.successAlert("Pag-IBIG added");
              setShowAddPagibig(false);
            }}
            onClose={() => setShowAddPagibig(false)}
          />
            </RequestModal>
          )}



      {showAddBasicSalary && (
        <RequestModal
            size="sm"
            nested
            title="Add Basic Salary"
            onClose={() => setShowAddBasicSalary(false)}>
        <AddBasicSalaryModal
          onSave={async (payload) => {
            await onQuickSave({
              basic_salary: payload.basic_salary,
              cash_assistance: payload.cash_assistance,
    
            });
            setBasicSalary(payload.basic_salary);
            setCashAssistance(payload.cash_assistance);
            setHasBasicSalary(true);
            SweetAlert.successAlert("Salary added");
            setShowAddBasicSalary(false);
          }}
          onClose={() => setShowAddBasicSalary(false)}
        />
          </RequestModal>
        )}


    </div>
  );
};
