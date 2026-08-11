import { useDisplayEmployeeVariance, useUpdateVarianceCategory } from "@/app/hooks/useVariance";
import { CycleCategory, VarianceEmployee2 } from "@/app/types/varianceType";
import { formatAmount } from "@/app/utils/currencyConverter";



interface Props {
    paycode: string;
    cycle: CycleCategory;
    company_id?: string;
}
type CustomVarianceCategory = {
    id: number;
    key: string;
    title: string;
    employees: VarianceEmployee2[];
};
type Section = {
    title: string;
    employees: VarianceEmployee2[];
};

type VarianceTableProps = {
    employees: VarianceEmployee2[];
    paycode: string;
    cycle: CycleCategory;
    company_id: string;
    customCategories: CustomVarianceCategory[];
    isSalaryAdjustment?: boolean;
};

function VarianceTable({
    employees,
    paycode,
    cycle,
    company_id,
    customCategories,
}: VarianceTableProps) {
    const { mutate: updateCategory, isPending } =
        useUpdateVarianceCategory();

    if (employees.length === 0) {
        return null;
    }

    const showPagibig = !paycode.includes("-1-15-");

    return (
        <div className="mb-4 overflow-x-auto px-1">
            <table className="w-full border-collapse border text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-slate-400 p-2">
                            Employee
                        </th>

                        <th className="border border-slate-400 p-2">
                            Emp Code
                        </th>

                        <th className="border border-slate-400 p-2">
                            Basic
                        </th>

                        {showPagibig && (
                            <>
                                <th className="border border-slate-400 p-2">
                                    Pag-IBIG EE
                                </th>

                                <th className="border border-slate-400 p-2">
                                    Pag-IBIG ER
                                </th>

                                <th className="border border-slate-400 p-2">
                                    WTax
                                </th>
                            </>
                        )}

                        <th className="border border-slate-400 p-2">
                            SSS EE
                        </th>

                        <th className="border border-slate-400 p-2">
                            SSS ER
                        </th>

                        <th className="border border-slate-400 p-2">
                            PhilHealth EE
                        </th>

                        <th className="border border-slate-400 p-2">
                            PhilHealth ER
                        </th>

                        {/* <th className="border border-slate-400 p-2">
                            {isSalaryAdjustment ? "Remarks" : "Leave"}
                        </th> */}

                        <th className="border border-slate-400 p-2 print:hidden">
                            Move Category
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {employees.map((employee) => (
                        <tr key={employee.EmpCode}>
                            <td className="border border-slate-400 p-2">
                                {employee.EmpCode}
                            </td>

                            <td className="border border-slate-400 p-2">
                                {employee.Lastname}, {employee.Firstname}
                            </td>

                            <td className="border border-slate-400 p-2 text-right">
                                {formatAmount(employee.basic_variance)}
                            </td>

                            {showPagibig && (
                                <>
                                    <td className="border border-slate-400 p-2 text-right">
                                        {formatAmount(
                                            employee.pagibig_employee_variance
                                        )}
                                    </td>

                                    <td className="border border-slate-400 p-2 text-right">
                                        {formatAmount(
                                            employee.pagibig_employer_variance
                                        )}
                                    </td>

                                    <td className="border border-slate-400 p-2 text-right">
                                        {formatAmount(
                                            employee.wtax_variance
                                        )}
                                    </td>
                                </>
                            )}

                            <td className="border border-slate-400 p-2 text-right">
                                {formatAmount(
                                    employee.sss_employee_variance
                                )}
                            </td>

                            <td className="border border-slate-400 p-2 text-right">
                                {formatAmount(
                                    employee.sss_employer_variance
                                )}
                            </td>

                            <td className="border border-slate-400 p-2 text-right">
                                {formatAmount(
                                    employee.phil_employee_variance
                                )}
                            </td>

                            <td className="border border-slate-400 p-2 text-right">
                                {formatAmount(
                                    employee.phil_employer_variance
                                )}
                            </td>

                            {/* <td className="border border-slate-400 p-2">
                                {isSalaryAdjustment
                                    ? employee.remarks ?? "-"
                                    : employee.leaveName ?? "-"}
                            </td> */}

                            <td className="border border-slate-400 p-2 print:hidden">
                                <select
                                    defaultValue=""
                                    disabled={isPending}
                                    className="min-w-45 rounded border border-gray-300 px-2 py-1 text-xs"
                                    onChange={(event) => {
                                        const category =
                                            event.target.value;

                                        if (!category) {
                                            return;
                                        }

                                        updateCategory({
                                            EmpCode: employee.EmpCode,
                                            PayCode: paycode,
                                            company_id,
                                            cycle,
                                            category,
                                        });
                                    }}
                                >
                                    <option value="">
                                        Move to...
                                    </option>

                                    <option value="Probationary">
                                        Probationary
                                    </option>

                                    <option value="back_to_work_with_specialleave">
                                        Back to Work (Special Leave)
                                    </option>

                                    <option value="back_to_work_without_specialleave">
                                        Back to Work (Without Special Leave)
                                    </option>

                                    <option value="missing_in_current_with_specialleave">
                                        Missing (Special Leave)
                                    </option>

                                    <option value="missing_in_current_without_specialleave">
                                        Missing (Without Special Leave)
                                    </option>

                                    <option value="resigned">
                                        Resigned
                                    </option>

                                    <option value="wtax_adjustment">
                                        WTax Adjustment
                                    </option>

                                    <option value="salary_adjustment_increase">
                                        Salary Adjustment (Increase)
                                    </option>

                                    <option value="salary_adjustment_decrease">
                                        Salary Adjustment (Decrease)
                                    </option>

                                    <option value="others">
                                        Others
                                    </option>
                                    {customCategories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.key}
                                        >
                                            {category.title}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


export default function EmployeeVariance({
  paycode,
  cycle,
  company_id,
}: Props) {
  const { data, isLoading } =
    useDisplayEmployeeVariance(
      company_id,
      cycle
    );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!company_id) {
    return null;
  }

  const variance = data?.data;

  const customCategories =
    variance?.custom_categories ?? [];

  const sections: Section[] = [
    {
      title: "Probationary",
      employees:
        variance?.Probationary?.employees ?? [],
    },

    {
      title: "Back to Work (Special Leave)",
      employees:
        variance
          ?.back_to_work_with_specialleave
          ?.employees ?? [],
    },

    {
      title: "Back to Work (Without Special Leave)",
      employees:
        variance
          ?.back_to_work_without_specialleave
          ?.employees ?? [],
    },

    {
      title: "Missing (Special Leave)",
      employees:
        variance
          ?.missing_in_current_with_specialleave
          ?.employees ?? [],
    },

    {
      title: "Missing (Without Special Leave)",
      employees:
        variance
          ?.missing_in_current_without_specialleave
          ?.employees ?? [],
    },

    {
      title: "Resigned",
      employees:
        variance?.resigned?.employees ?? [],
    },

    {
      title: "WTax Adjustment",
      employees:
        variance?.wtax_adjustment?.employees ?? [],
    },

    {
      title: "Salary Adjustment (Increase)",
      employees:
        variance?.salary_adjustment?.increase ?? [],
    },

    {
      title: "Salary Adjustment (Decrease)",
      employees:
        variance?.salary_adjustment?.decrease ?? [],
    },

    {
      title: "Others",
      employees:
        variance?.others?.employees ?? [],
    },
  ];

  const customSections: Section[] =
    customCategories.map((category) => ({
      title: category.title,
      employees: category.employees,
    }));

  const allSections = [
    ...sections,
    ...customSections,
  ];

  const visibleSections =
    allSections.filter(
      (section) =>
        section.employees.length > 0
    );

  return (
    <div className="space-y-4 px-4">
      {visibleSections.map((section) => (
        <div key={section.title}>
          <h2 className="mb-2 text-xs font-bold uppercase">
            {section.title}
            {" "}
            ({section.employees.length})
          </h2>

          <VarianceTable
            employees={section.employees}
            paycode={paycode}
            cycle={cycle}
            company_id={company_id}
            customCategories={customCategories}
            isSalaryAdjustment={
              section.title ===
                "Salary Adjustment (Increase)" ||
              section.title ===
                "Salary Adjustment (Decrease)"
            }
          />
        </div>
      ))}
    </div>
  );
}