
import {
  useDisplayEmployeeVariance,
  useUpdateVarianceCategory,
} from "@/app/hooks/useVariance";

import {
  CycleCategory,
  VarianceEmployee2,
} from "@/app/types/varianceType";

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

type VarianceTotals = {
  basic: number;
  pagibigEE: number;
  pagibigER: number;
  wtax: number;
  sssEE: number;
  sssER: number;
  philEE: number;
  philER: number;
};

// ==========================================
// CALCULATE TOTALS
// ==========================================

function calculateVarianceTotals(
  employees: VarianceEmployee2[]
): VarianceTotals {
  return employees.reduce<VarianceTotals>(
    (acc, employee) => {
      acc.basic += Number(employee.basic_variance ?? 0);

      acc.pagibigEE += Number(
        employee.pagibig_employee_variance ?? 0
      );

      acc.pagibigER += Number(
        employee.pagibig_employer_variance ?? 0
      );

      acc.wtax += Number(employee.wtax_variance ?? 0);

      acc.sssEE += Number(
        employee.sss_employee_variance ?? 0
      );

      acc.sssER += Number(
        employee.sss_employer_variance ?? 0
      );

      acc.philEE += Number(
        employee.phil_employee_variance ?? 0
      );

      acc.philER += Number(
        employee.phil_employer_variance ?? 0
      );

      return acc;
    },
    {
      basic: 0,
      pagibigEE: 0,
      pagibigER: 0,
      wtax: 0,
      sssEE: 0,
      sssER: 0,
      philEE: 0,
      philER: 0,
    }
  );
}

// ==========================================
// EMPLOYEE VARIANCE TABLE
// NO TOTAL PER CATEGORY
// ==========================================

function VarianceTable({
  employees,
  paycode,
  cycle,
  company_id,
  customCategories,
}: VarianceTableProps) {
  const { mutate: updateCategory, isPending } =
    useUpdateVarianceCategory();

  const showPagibig = !paycode.includes("-1-15-");

  if (employees.length === 0) {
    return null;
  }

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
                    {formatAmount(employee.wtax_variance)}
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

              <td className="border border-slate-400 p-2 print:hidden">
                <select
                  defaultValue=""
                  disabled={isPending}
                  className="min-w-45 rounded border border-gray-300 px-2 py-1 text-xs"
                  onChange={(event) => {
                    const category = event.target.value;

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
                  <option value="">Move to...</option>

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

// ==========================================
// GRAND TOTAL TABLE
// DISPLAYED ONLY ONCE
// ==========================================

function GrandTotalTable({
  totals,
  paycode,
}: {
  totals: VarianceTotals;
  paycode: string;
}) {
  const showPagibig = !paycode.includes("-1-15-");

  const headerClass =
    "border border-slate-400 bg-gray-100 p-2 text-center";

  const totalClass =
    "border border-slate-400 bg-indigo-50 p-2 text-right font-bold text-slate-800";

  return (
    <div className="mt-6 overflow-x-auto px-1">
      <h2 className="mb-2 text-sm font-bold uppercase text-slate-800">
        Total
      </h2>

      <table className="w-full border-collapse border text-sm">
        <thead>
          <tr>
            <th className={headerClass}>
              Description
            </th>

            <th className={headerClass}>
              Basic
            </th>

            {showPagibig && (
              <>
                <th className={headerClass}>
                  Pag-IBIG EE
                </th>

                <th className={headerClass}>
                  Pag-IBIG ER
                </th>

                <th className={headerClass}>
                  WTax
                </th>
              </>
            )}

            <th className={headerClass}>
              SSS EE
            </th>

            <th className={headerClass}>
              SSS ER
            </th>

            <th className={headerClass}>
              PhilHealth EE
            </th>

            <th className={headerClass}>
              PhilHealth ER
            </th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="border border-slate-400 bg-indigo-50 p-2 font-bold">
              GRAND TOTAL
            </td>

            <td className={totalClass}>
              {formatAmount(totals.basic)}
            </td>

            {showPagibig && (
              <>
                <td className={totalClass}>
                  {formatAmount(totals.pagibigEE)}
                </td>

                <td className={totalClass}>
                  {formatAmount(totals.pagibigER)}
                </td>

                <td className={totalClass}>
                  {formatAmount(totals.wtax)}
                </td>
              </>
            )}

            <td className={totalClass}>
              {formatAmount(totals.sssEE)}
            </td>

            <td className={totalClass}>
              {formatAmount(totals.sssER)}
            </td>

            <td className={totalClass}>
              {formatAmount(totals.philEE)}
            </td>

            <td className={totalClass}>
              {formatAmount(totals.philER)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ==========================================
// MAIN EMPLOYEE VARIANCE COMPONENT
// ==========================================

export default function EmployeeVariance({
  paycode,
  cycle,
  company_id,
}: Props) {
  const { data, isLoading } =
    useDisplayEmployeeVariance(company_id, cycle);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!company_id) {
    return null;
  }

  const variance = data?.data;

  const customCategories =
    variance?.custom_categories ?? [];

  // ==========================================
  // DEFAULT CATEGORIES
  // ==========================================

  const sections: Section[] = [
    {
      title: "Probationary",
      employees:
        variance?.Probationary?.employees ?? [],
    },
    {
      title: "Back to Work (Special Leave)",
      employees:
        variance?.back_to_work_with_specialleave
          ?.employees ?? [],
    },
    {
      title: "Back to Work (Without Special Leave)",
      employees:
        variance?.back_to_work_without_specialleave
          ?.employees ?? [],
    },
    {
      title: "Missing (Special Leave)",
      employees:
        variance?.missing_in_current_with_specialleave
          ?.employees ?? [],
    },
    {
      title: "Missing (Without Special Leave)",
      employees:
        variance?.missing_in_current_without_specialleave
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

  // ==========================================
  // CUSTOM CATEGORIES
  // ==========================================

  const customSections: Section[] =
    customCategories.map((category) => ({
      title: category.title,
      employees: category.employees,
    }));

  // ==========================================
  // COMBINE ALL CATEGORIES
  // ==========================================

  const allSections: Section[] = [
    ...sections,
    ...customSections,
  ];

  const visibleSections = allSections.filter(
    (section) => section.employees.length > 0
  );

  // ==========================================
  // CALCULATE ONE GRAND TOTAL
  // ACROSS ALL CATEGORIES
  // ==========================================

  const allEmployees = visibleSections.flatMap(
    (section) => section.employees
  );

  const grandTotals =
    calculateVarianceTotals(allEmployees);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-4 px-4">
      {/* EMPLOYEE CATEGORY TABLES */}
      {visibleSections.map((section) => (
        <div key={section.title}>
          <h2 className="mb-2 text-xs font-bold uppercase">
            {section.title} ({section.employees.length})
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

      {/* ONE GRAND TOTAL FOR ALL CATEGORIES */}
      {allEmployees.length > 0 && (
        <GrandTotalTable
          totals={grandTotals}
          paycode={paycode}
        />
      )}
    </div>
  );
}
