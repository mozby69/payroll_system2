import { useDisplayEmployeeVariance } from "@/app/hooks/useVariance";
import { CycleCategory, VarianceEmployee2 } from "@/app/types/varianceType";



interface Props {
    paycode: string;
    cycle: CycleCategory;
    company_id?: string;
}

type Section = {
    title: string;
    employees: VarianceEmployee2[];
};

type VarianceTableProps = {
    employees: VarianceEmployee2[];
    paycode: string;
    isSalaryAdjustment?: boolean;
};

function formatAmount(value: number) {
    return value.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function VarianceTable({
    employees,
    paycode,
    isSalaryAdjustment = false,
}: VarianceTableProps) {
    if (employees.length === 0) {
        return null;
    }

    const showPagibig = !paycode.includes("-1-15-");

    return (
        <div className="mb-4 overflow-x-auto px-1">
            <table className="w-full border-collapse border text-sm">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-slate-400 p-2">Employee</th>
                        <th className="border border-slate-400 p-2">Emp Code</th>

                        <th className="border border-slate-400 p-2">Basic</th>
                        {showPagibig && (
                            <>
                                <th className="border border-slate-400 p-2">Pag-IBIG EE</th>
                                <th className="border border-slate-400 p-2">Pag-IBIG ER</th>
                                <th className="border border-slate-400 p-2">WTax</th>
                            </>
                        )}
                        <th className="border border-slate-400 p-2">SSS EE</th>
                        <th className="border border-slate-400 p-2">SSS ER</th>
                        <th className="border border-slate-400 p-2">PhilHealth EE</th>
                        <th className="border border-slate-400 p-2">PhilHealth ER</th>



                        <th className="border border-slate-400 p-2">
                            {isSalaryAdjustment ? "Remarks" : "Leave"}
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {employees.map((employee) => (
                        <tr key={employee.EmpCode}>
                            <td className="border border-slate-400 p-2">{employee.EmpCode}</td>

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

                                    <td className="border border-slate-400  p-2 text-right">
                                        {formatAmount(
                                            employee.wtax_variance
                                        )}
                                    </td>
                                </>
                            )}

                            <td className="border border-slate-400  p-2 text-right">
                                {formatAmount(employee.sss_employee_variance)}
                            </td>

                            <td className="border border-slate-400  p-2 text-right">
                                {formatAmount(employee.sss_employer_variance)}
                            </td>

                            <td className="border border-slate-400  p-2 text-right">
                                {formatAmount(employee.phil_employee_variance)}
                            </td>

                            <td className="border border-slate-400  p-2 text-right">
                                {formatAmount(employee.phil_employer_variance)}
                            </td>


                            <td className="border border-slate-400 p-2">
                                {isSalaryAdjustment
                                    ? employee.remarks ?? "-"
                                    : employee.leaveName ?? "-"}
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
        useDisplayEmployeeVariance(company_id, cycle);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const variance = data?.data;

    const sections: Section[] = [
        {
            title: "Probationary",
            employees: variance?.Probationary?.employees ?? [],
        },
        {
            title: "Back to Work (Special Leave)",
            employees:
                variance?.back_to_work_with_specialleave?.employees ?? [],
        },
        {
            title: "Back to Work (Without Special Leave)",
            employees:
                variance?.back_to_work_without_specialleave?.employees ?? [],
        },
        {
            title: "Missing (Special Leave)",
            employees:
                variance?.missing_in_current_with_specialleave?.employees ?? [],
        },
        {
            title: "Missing (Without Special Leave)",
            employees:
                variance?.missing_in_current_without_specialleave?.employees ?? [],
        },
        {
            title: "Resigned",
            employees: variance?.resigned?.employees ?? [],
        },
           {
            title: "WTax Adjustment",
            employees: variance?.wtax_adjustment?.employees ?? [],
        },


        // NEW
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
    ];


    const visibleSections = sections.filter(
        (section) => section.employees.length > 0
    );

    const allEmployees = visibleSections.flatMap(
        (section) => section.employees
    );

    const showPagibig = !paycode.includes("-1-15-");

    const varianceTotals = {
        basic: allEmployees.reduce(
            (sum, employee) => sum + employee.basic_variance,
            0
        ),
        sssEmployee: allEmployees.reduce(
            (sum, employee) => sum + employee.sss_employee_variance,
            0
        ),
        sssEmployer: allEmployees.reduce(
            (sum, employee) => sum + employee.sss_employer_variance,
            0
        ),
        philhealthEmployee: allEmployees.reduce(
            (sum, employee) => sum + employee.phil_employee_variance,
            0
        ),
        philhealthEmployer: allEmployees.reduce(
            (sum, employee) => sum + employee.phil_employer_variance,
            0
        ),
        pagibigEmployee: allEmployees.reduce(
            (sum, employee) => sum + employee.pagibig_employee_variance,
            0
        ),
        pagibigEmployer: allEmployees.reduce(
            (sum, employee) => sum + employee.pagibig_employer_variance,
            0
        ),
        wtax_fin: allEmployees.reduce(
            (sum, employee) => sum + employee.wtax_variance,
            0
        ),
    };


    return (
        <div className="space-y-4 px-4">
            {visibleSections.map((section) => (
                <div key={section.title}>
                    <h2 className="mb-2 font-bold text-xs">
                        {section.title} ({section.employees.length})
                    </h2>
                    <VarianceTable
                        employees={section.employees}
                        paycode={paycode}
                        isSalaryAdjustment={
                            section.title === "Salary Adjustment (Increase)" ||
                            section.title === "Salary Adjustment (Decrease)"
                        }
                    />
                </div>
            ))}

            {allEmployees.length > 0 && (
                <div className="mt-5 overflow-x-auto">
                    <h2 className="mb-2 font-bold text-xs">
                        Variance Breakdown
                    </h2>

                    <table className="w-full border-collapse border text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-slate-400 p-2">Basic</th>
                                {showPagibig && (
                                    <>
                                        <th className="border border-slate-400  p-2">Pag-IBIG EE</th>
                                        <th className="border border-slate-400  p-2">Pag-IBIG ER</th>
                                        <th className="border border-slate-400  p-2">WTax</th>
                                    </>
                                )}
                                <th className="border border-slate-400 p-2">SSS EE</th>
                                <th className="border border-slate-400 p-2">SSS ER</th>
                                <th className="border border-slate-400 p-2">PhilHealth EE</th>
                                <th className="border border-slate-400 p-2">PhilHealth ER</th>


                            </tr>
                        </thead>

                        <tbody>
                            {allEmployees.map((employee) => (
                                <tr key={`breakdown-${employee.EmpCode}`}>
                                    <td className="border border-slate-400  p-2 text-right">
                                        {formatAmount(employee.basic_variance)}
                                    </td>

                                    {showPagibig && (
                                        <>
                                            <td className="border border-slate-400 p-2 text-right">
                                                {formatAmount(employee.pagibig_employee_variance)}
                                            </td>

                                            <td className="border border-slate-400 p-2 text-right">
                                                {formatAmount(employee.pagibig_employer_variance)}
                                            </td>
                                            <td className="border border-slate-400 p-2 text-right">
                                                {formatAmount(employee.wtax_variance)}
                                            </td>
                                        </>
                                    )}
                                    <td className="border border-slate-400 p-2 text-right">
                                        {formatAmount(employee.sss_employee_variance)}
                                    </td>

                                    <td className="border border-slate-400 p-2 text-right">
                                        {formatAmount(employee.sss_employer_variance)}
                                    </td>

                                    <td className="border border-slate-400 p-2 text-right">
                                        {formatAmount(employee.phil_employee_variance)}
                                    </td>

                                    <td className="border border-slate-400 p-2 text-right">
                                        {formatAmount(employee.phil_employer_variance)}
                                    </td>


                                </tr>
                            ))}

                            <tr className="font-bold bg-gray-50">
                                <td className="border border-slate-400 p-2 text-right">
                                    {formatAmount(varianceTotals.basic)}
                                </td>

                                {showPagibig && (
                                    <>
                                        <td className="border border-slate-400  p-2 text-right">
                                            {formatAmount(varianceTotals.pagibigEmployee)}
                                        </td>

                                        <td className="border border-slate-400 p-2 text-right">
                                            {formatAmount(varianceTotals.pagibigEmployer)}
                                        </td>

                                        <td className="border border-slate-400 p-2 text-right">
                                            {formatAmount(varianceTotals.wtax_fin)}
                                        </td>
                                    </>
                                )}

                                <td className="border border-slate-400  p-2 text-right">
                                    {formatAmount(varianceTotals.sssEmployee)}
                                </td>

                                <td className="border border-slate-400 p-2 text-right">
                                    {formatAmount(varianceTotals.sssEmployer)}
                                </td>

                                <td className="border border-slate-400 p-2 text-right">
                                    {formatAmount(varianceTotals.philhealthEmployee)}
                                </td>

                                <td className="border border-slate-400 p-2 text-right">
                                    {formatAmount(varianceTotals.philhealthEmployer)}
                                </td>


                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}