import { useVarianceArchivePerCompany } from "@/app/hooks/useVariance";
import { CompanyVarianceArchive, CompanyVarianceRow, EmployeeVarianceArchiveData, EmployeeVarianceCategory, EmployeeVarianceItem, FinalVarianceData } from "@/app/types/varianceType";
import { formatAmount } from "@/app/utils/currencyConverter";
import { EmployeeHeader, formatCategoryTitle, getPayrollHalf, TableHeader, TempReplaceCompanyName } from "../helper";
import { useMemo, useState } from "react";
import { TabItem, Tabs } from "@/app/components/Tab";

type Props = {
    mainArchiveId: string;
};

export default function VariancePerCompanyArchive({ mainArchiveId }: Props) {
    const { data, isLoading, isError } = useVarianceArchivePerCompany(mainArchiveId);

    const [activeTab, setActiveTab] = useState<string>("");

    const tabs = useMemo<TabItem<string>[]>(
        () =>
            data?.archives.map((archive) => ({
                key: archive.company_id,
                label: archive.company_id,
            })) ?? [],
        [data?.archives]
    );


    const effectiveActiveTab =
        activeTab &&
            tabs.some((tab) => tab.key === activeTab)
            ? activeTab
            : tabs[0]?.key ?? "";

    const selectedArchive = useMemo(
        () =>
            data?.archives.find(
                (archive) =>
                    archive.company_id === effectiveActiveTab
            ),
        [data?.archives, effectiveActiveTab]
    );

    if (isLoading) {
        return (
            <div className="py-10 text-center text-slate-500">
                Loading variance archive...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="py-10 text-center text-red-500">
                Failed to load variance archive.
            </div>
        );
    }

    if (!data) {
        return null;
    }

    if (data.archives.length === 0) {
        return (
            <div className="py-10 text-center text-slate-500">
                No variance archive found.
            </div>
        );
    }

    return (
        <>
            <div className="py-4">
                <Tabs
                    activeTab={effectiveActiveTab}
                    onChange={setActiveTab}
                    tabs={tabs}
                />
            </div>

            {selectedArchive && (
                <>
                    <div className="p-2">
                        <CompanyVarianceTable
                            archive={selectedArchive}
                        />
                    </div>

                    <div className="mt-10 pt-6 px-2">
                        <EmployeeVarianceList
                            employeeVariance={
                                selectedArchive.employee_variance
                            }
                            paycode={
                                selectedArchive.company_variance
                                    .current.paycode ?? ""
                            }
                        />
                    </div>

                    <div className="p-2">
                        <FinalVarianceArchive
                            finalVariance={
                                selectedArchive.final_variance
                            }
                            paycode={
                                selectedArchive.company_variance
                                    .current.paycode ?? ""
                            }
                        />

                    </div>
                </>
            )}
        </>
    );
}

type CompanyVarianceTableProps = {
    archive: CompanyVarianceArchive;
    companyName?: string;
};

export function CompanyVarianceTable({ archive }: CompanyVarianceTableProps) {
    const variance = archive.company_variance;
    const paycode = variance.current.paycode ?? "";
    const payrollHalf = getPayrollHalf(paycode);
    const isFirstHalf = payrollHalf === "FIRST_HALF";

    return (
        <div className="w-full">


            <div className="mb-8 text-[13px] font-bold leading-4 text-slate-700">
                <p className="uppercase">
                    {TempReplaceCompanyName(archive.company_id)}
                </p>

                <p>PAYROLL EXPLANATION</p>

                <p>
                    FOR THE PERIOD : {paycode}
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px] text-slate-700">
                    <thead>
                        <tr>
                            <th className="border border-slate-400 px-3 py-3" />

                            <TableHeader>
                                BASIC
                            </TableHeader>

                            {!isFirstHalf && (
                                <>
                                    <TableHeader>
                                        <span className="block">
                                            PAG-IBIG
                                        </span>
                                        <span className="block">
                                            EMPLOYEE
                                        </span>
                                    </TableHeader>

                                    <TableHeader>
                                        <span className="block">
                                            PAG-IBIG
                                        </span>
                                        <span className="block">
                                            EMPLOYER
                                        </span>
                                    </TableHeader>

                                    <TableHeader>
                                        <span className="block">
                                            WITHHOLDING
                                        </span>
                                        <span className="block">
                                            TAX
                                        </span>
                                    </TableHeader>
                                </>
                            )}

                            <TableHeader>
                                <span className="block">
                                    SSS
                                </span>
                                <span className="block">
                                    EMPLOYEE
                                </span>
                            </TableHeader>

                            <TableHeader>
                                <span className="block">
                                    SSS
                                </span>
                                <span className="block">
                                    EMPLOYER
                                </span>
                            </TableHeader>

                            <TableHeader>
                                <span className="block">
                                    PHILHEALTH
                                </span>
                                <span className="block">
                                    EMPLOYEE
                                </span>
                            </TableHeader>

                            <TableHeader>
                                <span className="block">
                                    PHILHEALTH
                                </span>
                                <span className="block">
                                    EMPLOYER
                                </span>
                            </TableHeader>
                        </tr>
                    </thead>

                    <tbody>
                        <VarianceRow
                            label={variance.older_prev.paycode ?? ''}
                            data={variance.older_prev}
                            isFirstHalf={isFirstHalf}
                        />

                        <VarianceRow
                            label={variance.recent_prev.paycode ?? ''}
                            data={variance.recent_prev}
                            isFirstHalf={isFirstHalf}
                        />

                        <VarianceRow
                            label={paycode}
                            data={variance.current}
                            isFirstHalf={isFirstHalf}
                        />

                        <VarianceRow
                            label={
                                variance.variance.paycode ??
                                "VARIANCE"
                            }
                            data={variance.variance}
                            isVariance
                            isFirstHalf={isFirstHalf}
                        />
                    </tbody>
                </table>
            </div>
        </div>
    );
}




type VarianceRowProps = {
    label: string;
    data: CompanyVarianceRow;
    isVariance?: boolean;
    isFirstHalf: boolean;
};

function VarianceRow({ label, data, isVariance = false, isFirstHalf }: VarianceRowProps) {
    const basicValue = isVariance
        ? data.basic_pay_variance
        : data.basic_pay;

    const pagibigEmployee = isVariance
        ? data.pagibig_employee_variance
        : data.pagibig_employee;

    const pagibigEmployer = isVariance
        ? data.pagibig_employer_variance
        : data.pagibig_employer;

    const wtax = isVariance
        ? data.wtax_variance
        : data.wtax;

    const sssEmployee = isVariance
        ? data.sss_employee_variance
        : data.sss_employee;

    const sssEmployer = isVariance
        ? data.sss_employer_variance
        : data.sss_employer;

    const philEmployee = isVariance
        ? data.phil_employee_variance
        : data.phil_employee;

    const philEmployer = isVariance
        ? data.phil_employer_variance
        : data.phil_employer;

    const cellClass = `
    border
    border-slate-400
    px-3
    py-2
    text-right
    italic
    whitespace-nowrap
    ${isVariance ? "font-bold" : ""}
  `;

    const labelClass = `
    border
    border-slate-400
    px-3
    py-2
    italic
    whitespace-nowrap
    ${isVariance ? "font-bold" : ""}
  `;

    return (
        <tr>
            <td className={labelClass}>
                {label}
            </td>

            <td className={cellClass}>
                {formatAmount(basicValue)}
            </td>

            {!isFirstHalf && (
                <>
                    <td className={cellClass}>
                        {formatAmount(pagibigEmployee)}
                    </td>

                    <td className={cellClass}>
                        {formatAmount(pagibigEmployer)}
                    </td>

                    <td className={cellClass}>
                        {formatAmount(wtax)}
                    </td>
                </>
            )}

            <td className={cellClass}>
                {formatAmount(sssEmployee)}
            </td>

            <td className={cellClass}>
                {formatAmount(sssEmployer)}
            </td>

            <td className={cellClass}>
                {formatAmount(philEmployee)}
            </td>

            <td className={cellClass}>
                {formatAmount(philEmployer)}
            </td>
        </tr>
    );
}























type Props2 = {
    employeeVariance: EmployeeVarianceArchiveData | null;
    paycode: string;
};

type DisplayCategory = {
    key: string;
    title: string;
    employees: EmployeeVarianceItem[];
};

export function EmployeeVarianceList({ employeeVariance, paycode }: Props2) {
    if (!employeeVariance) {
        return (
            <div className="py-6 text-center text-sm text-slate-500">
                No employee variance archive found.
            </div>
        );
    }

    const isFirstHalf = getPayrollHalf(paycode) === "FIRST_HALF";

    const standardCategories: DisplayCategory[] =
        Object.entries(employeeVariance)
            .filter(([key]) => {
                return ![
                    "totalsVariance",
                    "custom_categories",
                    "salary_adjustment",
                ].includes(key);
            })
            .flatMap(([key, value]) => {
                if (!isEmployeeCategory(value)) {
                    return [];
                }

                if (value.employees.length === 0) {
                    return [];
                }

                return [
                    {
                        key,
                        title: formatCategoryTitle(key),
                        employees: value.employees,
                    },
                ];
            });

    const customCategories: DisplayCategory[] =
        employeeVariance.custom_categories
            ?.filter(
                (category) =>
                    category.employees.length > 0
            )
            .map((category) => ({
                key: category.key,
                title: category.title,
                employees: category.employees,
            })) ?? [];

    const salaryCategories: DisplayCategory[] = [];

    const salaryAdjustment =
        employeeVariance.salary_adjustment;

    if (
        salaryAdjustment &&
        salaryAdjustment.increase.length > 0
    ) {
        salaryCategories.push({
            key: "salary_adjustment_increase",
            title: "SALARY ADJUSTMENT - INCREASE",
            employees: salaryAdjustment.increase,
        });
    }

    if (
        salaryAdjustment &&
        salaryAdjustment.decrease.length > 0
    ) {
        salaryCategories.push({
            key: "salary_adjustment_decrease",
            title: "SALARY ADJUSTMENT - DECREASE",
            employees: salaryAdjustment.decrease,
        });
    }

    const categories = [
        ...standardCategories,
        ...customCategories,
        ...salaryCategories,
    ];

    if (categories.length === 0) {
        return (
            <div className="py-6 text-center text-sm text-slate-500">
                No employee variances found.
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {categories.map((category) => (
                <EmployeeVarianceCategoryTable
                    key={category.key}
                    category={category}
                    isFirstHalf={isFirstHalf}
                />
            ))}
        </div>
    );
}


function isEmployeeCategory(
    value: unknown
): value is EmployeeVarianceCategory {
    if (
        typeof value !== "object" ||
        value === null
    ) {
        return false;
    }

    if (!("employees" in value)) {
        return false;
    }

    const employees = (
        value as {
            employees: unknown;
        }
    ).employees;

    return Array.isArray(employees);
}




type CategoryTableProps = {
    category: DisplayCategory;
    isFirstHalf: boolean;
};

function EmployeeVarianceCategoryTable({
    category,
    isFirstHalf,
}: CategoryTableProps) {
    return (
        <div>
            <h3 className="mb-1 text-[11px] font-bold uppercase text-slate-700">
                {category.title} (
                {category.employees.length})
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[12px] text-slate-600">
                    <thead>
                        <tr className="bg-slate-50">
                            <EmployeeHeader>
                                Employee
                            </EmployeeHeader>

                            <EmployeeHeader>
                                Emp Code
                            </EmployeeHeader>

                            <EmployeeHeader>
                                Basic
                            </EmployeeHeader>

                            {!isFirstHalf && (
                                <>
                                    <EmployeeHeader>
                                        Pag-IBIG EE
                                    </EmployeeHeader>

                                    <EmployeeHeader>
                                        Pag-IBIG ER
                                    </EmployeeHeader>

                                    <EmployeeHeader>
                                        WTAX
                                    </EmployeeHeader>
                                </>
                            )}

                            <EmployeeHeader>
                                SSS EE
                            </EmployeeHeader>

                            <EmployeeHeader>
                                SSS ER
                            </EmployeeHeader>

                            <EmployeeHeader>
                                PhilHealth EE
                            </EmployeeHeader>

                            <EmployeeHeader>
                                PhilHealth ER
                            </EmployeeHeader>
                        </tr>
                    </thead>

                    <tbody>
                        {category.employees.map(
                            (employee) => (
                                <EmployeeVarianceRow
                                    key={employee.EmpCode}
                                    employee={employee}
                                    isFirstHalf={isFirstHalf}
                                />
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}




type EmployeeVarianceRowProps = {
    employee: EmployeeVarianceItem;
    isFirstHalf: boolean;
};

function EmployeeVarianceRow({ employee, isFirstHalf }: EmployeeVarianceRowProps) {
    const amountClass = "border border-slate-400 px-2 py-2 text-right whitespace-nowrap";

    return (
        <tr>
            <td className="border border-slate-400 px-2 py-2 whitespace-nowrap">
                {employee.Lastname},{" "}
                {employee.Firstname}
            </td>

            <td className="border border-slate-400 px-2 py-2 whitespace-nowrap">
                {employee.EmpCode}
            </td>

            <td className={amountClass}>
                {formatAmount(
                    employee.basic_variance
                )}
            </td>

            {!isFirstHalf && (
                <>
                    <td className={amountClass}>
                        {formatAmount(
                            employee.pagibig_employee_variance
                        )}
                    </td>

                    <td className={amountClass}>
                        {formatAmount(
                            employee.pagibig_employer_variance
                        )}
                    </td>

                    <td className={amountClass}>
                        {formatAmount(
                            employee.wtax_variance
                        )}
                    </td>
                </>
            )}

            <td className={amountClass}>
                {formatAmount(
                    employee.sss_employee_variance
                )}
            </td>

            <td className={amountClass}>
                {formatAmount(
                    employee.sss_employer_variance
                )}
            </td>

            <td className={amountClass}>
                {formatAmount(
                    employee.phil_employee_variance
                )}
            </td>

            <td className={amountClass}>
                {formatAmount(
                    employee.phil_employer_variance
                )}
            </td>
        </tr>
    );
}




type FinalVarianceArchiveProps = {
    finalVariance: FinalVarianceData | null;
    paycode: string;
};

export function FinalVarianceArchive({ finalVariance, paycode }: FinalVarianceArchiveProps) {
    if (!finalVariance) {
        return (
            <div className="py-6 text-center text-sm text-slate-500">
                No final variance archive found.
            </div>
        );
    }

    const isFirstHalf =
        getPayrollHalf(paycode) === "FIRST_HALF";

    const rows = isFirstHalf
        ? [
            {
                label: "Basic Pay Variance",
                value:
                    finalVariance.basic_pay_variance,
            },
            {
                label: "SSS Employee Variance",
                value:
                    finalVariance.sss_employee_variance,
            },
            {
                label: "SSS Employer Variance",
                value:
                    finalVariance.sss_employer_variance,
            },
            {
                label:
                    "PhilHealth Employee Variance",
                value:
                    finalVariance.phil_employee_variance,
            },
            {
                label:
                    "PhilHealth Employer Variance",
                value:
                    finalVariance.phil_employer_variance,
            },
        ]
        : [
            {
                label: "Basic Pay Variance",
                value:
                    finalVariance.basic_pay_variance,
            },
            {
                label:
                    "Pag-IBIG Employee Variance",
                value:
                    finalVariance.pagibig_employee_variance,
            },
            {
                label:
                    "Pag-IBIG Employer Variance",
                value:
                    finalVariance.pagibig_employer_variance,
            },
            {
                label:
                    "Withholding Tax Variance",
                value:
                    finalVariance.wtax_variance,
            },
            {
                label: "SSS Employee Variance",
                value:
                    finalVariance.sss_employee_variance,
            },
            {
                label: "SSS Employer Variance",
                value:
                    finalVariance.sss_employer_variance,
            },
            {
                label:
                    "PhilHealth Employee Variance",
                value:
                    finalVariance.phil_employee_variance,
            },
            {
                label:
                    "PhilHealth Employer Variance",
                value:
                    finalVariance.phil_employer_variance,
            },
        ];

    return (
        <div className="mt-8">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">
                Final Variance
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm text-slate-600">
                    <thead>
                        <tr>
                            <th className="border border-slate-400 px-3 py-2 text-left font-semibold">
                                Description
                            </th>

                            <th className="border border-slate-400 px-3 py-2 text-right font-semibold">
                                Variance
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.label}>
                                <td className="border border-slate-400 px-3 py-2">
                                    {row.label}
                                </td>

                                <td className="border border-slate-400 px-3 py-2 text-right">
                                    {formatAmount(row.value)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}