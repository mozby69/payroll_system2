import { useState } from "react";
import { useAddLoan, useEmployeeSearch } from "../hooks/usePreparePayroll";
import SweetAlert from "../components/Swal";





export const AddLoanModal = ({ onClose }: { onClose: () => void }) => {
  const addLoan = useAddLoan();

  const [search, setSearch] = useState("");
  const [selectedEmp, setSelectedEmp] = useState<{
    EmpCode: string;
    Firstname: string;
    Lastname: string;
  } | null>(null);

  const { data: employees } = useEmployeeSearch(search);

  const [loanType, setLoanType] = useState<"FCH_LOAN" | "SSS_LOAN" | "PAGIBIG_LOAN">("FCH_LOAN");
  const [principal, setPrincipal] = useState<number | "">("");
  const [termValue, setTermValue] = useState(1);
  const [termUnit, setTermUnit] = useState<"MONTHS" | "YEARS">("MONTHS");
  const [startDate, setStartDate] = useState("");

  const handleSave = async () => {
    if (!selectedEmp || !principal || !startDate) return;

    await addLoan.mutateAsync({
      empCode: selectedEmp.EmpCode,
      loan_type: loanType,
      principal: Number(principal),
      term_value: termValue,
      term_unit: termUnit,
      start_date: startDate,
    });

    SweetAlert.successAlert("Loan added");
    onClose();
  };

  return (
    <div className="p-6 space-y-6">


      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Employee
        </label>
        <input
          type="text"
          placeholder="Search name or employee code..."
          value={selectedEmp ? `${selectedEmp.Lastname}, ${selectedEmp.Firstname}` : search}
          onChange={(e) => {
            setSelectedEmp(null);
            setSearch(e.target.value);
          }}
          className="w-full border border-gray-300 px-4 py-2.5 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />

        {!selectedEmp && employees?.length > 0 && (
          <div className="absolute z-10 bg-white border border-gray-200 w-full rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
            {employees.map((emp: any) => (
              <div
                key={emp.EmpCode}
                onClick={() => {
                  setSelectedEmp(emp);
                  setSearch("");
                }}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0">
                <div className="font-medium text-gray-900">
                  {emp.Lastname}, {emp.Firstname}
                </div>
                <div className="text-sm text-gray-500">
                  {emp.EmpCode}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



   

 
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

      <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
           EMPCODE
          </label>
          <input
            type="text"
            placeholder="Enter amount"
            value={selectedEmp?.EmpCode ?? ""}
            readOnly
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Type of Loan
          </label>
          <select 
            value={loanType} 
            onChange={e => setLoanType(e.target.value as any)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="FCH_LOAN">FCH Loan</option>
            <option value="SSS_LOAN">SSS Loan</option>
            <option value="PAGIBIG_LOAN">Pag-IBIG Loan</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Principal Amount
          </label>
          <input
            type="number"
            placeholder="Enter amount"
            value={principal}
            onChange={e => setPrincipal(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Start Date
          </label>
          <input 
            type="date" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Term 
          </label>
          <input 
            type="number" 
            min={1} 
            placeholder="Enter duration"
            value={termValue} 
            onChange={e => setTermValue(Number(e.target.value))}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Term Unit
          </label>
          <select 
            value={termUnit} 
            onChange={e => setTermUnit(e.target.value as any)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="MONTHS">Months</option>
            <option value="YEARS">Years</option>
          </select>
        </div>
      </div>

     
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button onClick={onClose}
          className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave} 
          className="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition-colors shadow-sm">
          Save Loan
        </button>
      </div>
    </div>
  );
};

