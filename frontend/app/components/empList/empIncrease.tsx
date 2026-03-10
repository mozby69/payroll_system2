import { useBulkIncreaseSalary, useEmployeesByCompany } from "@/app/hooks/employees";
import {useCompanies} from "@/app/hooks/useGeneral";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmployeeIncreaseItem } from "@/app/types/empTypes";
import SweetAlert from "../Swal";
import GenButton from "../Buttons";


type Props = {
  open: boolean;
  onClose: () => void;
};

export default function EmpIncrease({ open, onClose }: Props) {

    const bulkIncreaseMutation = useBulkIncreaseSalary();
    const { data: companies } = useCompanies();
    const [selectedCompany, setSelectedCompany] = useState<string>("");

    const defaultCompany = companies?.[0]?.CompanyCode ?? "";
    const effectiveCompany = selectedCompany || defaultCompany;

    const { data: employees } =
    useEmployeesByCompany(effectiveCompany);


  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(
    new Set()
  );

  const [selectedBranch, setSelectedBranch] = useState<string>("");

  const branchOptions = useMemo(() => {
    if (!employees) return [];

    const unique = new Set(
        employees.map((e) => e.BranchCode?.branchCode || "NO BRANCH")
    );

    return Array.from(unique).sort();
    }, [employees]);

    const grouped = useMemo(() => {
    if (!employees) return {};

    const filteredEmployees = selectedBranch
        ? employees.filter(
            (e) =>
            (e.BranchCode?.branchCode || "NO BRANCH") ===
            selectedBranch
        )
        : employees;

    return filteredEmployees.reduce((acc, emp) => {
        const branch =
        emp.BranchCode?.branchCode || "NO BRANCH";

        if (!acc[branch]) acc[branch] = [];
        acc[branch].push(emp);

        return acc;
    }, {} as Record<string, EmployeeIncreaseItem[]>);
    }, [employees, selectedBranch]);

  const toggleEmployee = (empCode: string) => {
    setSelectedEmployees((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(empCode)) {
        newSet.delete(empCode);
      } else {
        newSet.add(empCode);
      }

      return newSet;
    });
  };

  const toggleBranch = (emps: EmployeeIncreaseItem[]) => {
    setSelectedEmployees((prev) => {
      const newSet = new Set(prev);

      const allSelected = emps.every((e) =>
        newSet.has(e.EmpCode)
      );

      emps.forEach((e) => {
        if (allSelected) {
          newSet.delete(e.EmpCode);
        } else {
          newSet.add(e.EmpCode);
        }
      });

      return newSet;
    });
  };
  
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

    const handlIncrease = () => {
    if (selectedEmployees.size === 0) {
        SweetAlert.warningAlert(
        "No Selection",
        "Please select at least one employee."
        );
        return;
    }

    SweetAlert.remarksConfirmationAlertandDropdown(
        "Increase Employee Salary",
        "Select reason and enter increase amount.",
        [
        { value: "Salary Increase", label: "Salary Increase" },
        { value: "Goverment Increase", label: "Goverment Increase" },
        { value: "Merit Increase", label: "Merit Increase" },
        { value: "Transfer Salary", label: "Salary Mod (Transfered Emp)" },
        ],
        async ({ reason, amount }) => {
        try {
            await bulkIncreaseMutation.mutateAsync({
            empCodes: Array.from(selectedEmployees),
            amount,
            reason,
            });

            SweetAlert.successAlert(
            "Salary updated successfully"
            );

            setSelectedEmployees(new Set());
        }catch (error) {
        SweetAlert.warningAlert(
            "Update Failed",
            `${error instanceof Error ? error.message : String(error)}`
        );
        }
        }
    );
    };
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />

      <div
        className="absolute top-0 right-4 bottom-0 w-full max-w-xl
        bg-mainLight shadow p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg">
            Employee Salary Increase
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="inline-flex justify-start items-start gap-4 w-full">
            <select
                className="px-3 py-2 bg-mainNeutral rounded-md w-full mb-6"
                value={selectedCompany || defaultCompany}
                onChange={(e) => {
                setSelectedCompany(e.target.value);
                setSelectedBranch("");
                setSelectedEmployees(new Set());
                }}
                >
                {companies?.map((c) => (
                    <option key={c.CompanyCode} value={c.CompanyCode}>
                    {c.CompanyName}
                    </option>
                ))}
            </select>

            <select
                className="px-3 py-2 bg-mainNeutral rounded-md w-full mb-6"
                value={selectedBranch}
                onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    setSelectedEmployees(new Set());
                }}
                >
                <option value="">All Branches</option>

                {branchOptions.map((branch) => (
                    <option key={branch} value={branch}>
                    {branch}
                    </option>
                ))}
            </select>
          
        </div>

          <div className="inline-flex w-full justify-end pb-6">
              <GenButton variant="primary" className="w-[40%] inline-flex items-center justify-center" onClick={handlIncrease}>
                    Saved Salary Increase
                </GenButton>
          </div>

        {Object.entries(grouped).map(([branch, emps]) => {
          const branchAllSelected = emps.every((e) =>
            selectedEmployees.has(e.EmpCode)
          );

          return (
            <div
              key={branch}
              className="mb-6 bg-mainLight px-6 py-4 drop-shadow-xl/25 rounded-md"
            >
              <div className="flex justify-between items-center bg-mainBg text-mainLight px-3 py-2 rounded-md">
                <h3 className="font-bold">
                  Branch: {branch}
                </h3>

                <button
                  onClick={() => toggleBranch(emps)}
                  className="text-sm underline"
                >
                  {branchAllSelected
                    ? "Unselect All"
                    : "Select All"}
                </button>
              </div>

              <div className="grid grid-cols-3 font-semibold px-3 py-2 mt-3">
                <span>Select</span>
                <span>Employee</span>
                <span className="text-right">
                  Basic Salary
                </span>
              </div>

              <div className="space-y-2">
                {emps.map((emp) => {
                  const fullName = [
                    emp.Firstname,
                    emp.Middlename,
                    emp.Lastname,
                  ]
                    .filter(Boolean)
                    .join(" ");

                  return (
                    <div
                    key={emp.EmpCode}
                    className="grid grid-cols-[60px_1fr_120px] items-center border px-3 py-2 rounded-md"
                    >
                    <input
                        type="checkbox"
                        checked={selectedEmployees.has(emp.EmpCode)}
                        onChange={() => toggleEmployee(emp.EmpCode)}
                        className="scale-150"
                    />

                    <span className="truncate">{fullName}</span>

                    <span className="text-right">
                        ₱ {emp.employeepayroll?.basic_salary ?? 0}
                    </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}