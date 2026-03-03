import { prisma } from "../../config/prismaClient";
import { nowPH } from "../../utils/timezone";
export async function getCompanyDetailsServices() {
    return prisma.company_details.findMany({
        orderBy: {
            CompanyCode: "asc"
        }
    });
}
export async function getSSSContributions() {
    return prisma.sSS_Contributions.findMany({
        select: {
            start_range: true,
            end_range: true,
            employee_share: true,
            employer_share: true,
        },
        orderBy: {
            start_range: "asc",
        },
    });
}
export async function getTaxTable() {
    return prisma.tax_table.findMany({
        select: {
            start_range: true,
            end_range: true,
            annual_base_tax_bracket: true,
            rate_per_bracket: true,
            annual_base_tax_per_year: true,
        }
    });
}
export async function getBodPhilhealth() {
    return prisma.bodPhilhealtContrib.findMany({
        select: {
            EmpCodeId: true,
            employee_share: true,
        }
    });
}
export async function appendMissingBodEmployees(tx, employees) {
    if (!employees.length)
        return [];
    const bodEmployees = await tx.employee.findMany({
        where: {
            bod_member: { in: ["bod1", "bod2"] },
        },
        select: { EmpCode: true },
    });
    const existingIds = new Set(employees.map((e) => e.EmpCode_id.trim()));
    const missingBods = bodEmployees.filter((b) => !existingIds.has(b.EmpCode.trim()));
    const template = employees[0];
    return missingBods.map((b) => ({
        EmpCodeId: b.EmpCode,
        PayCode: template.PayCode,
        CycleCategory: template.CycleCategory,
        PayrollPeriod: template.PayrollPeriod,
        LateCount: 0,
        TotalAbsentHours: 0,
        TotalUndertime: 0,
        TotalOvertime: 0,
        RegularAtt: {},
        OvertimeAtt: {},
        NightShiftAtt: {},
        NightShiftOtAtt: {},
        selected_payroll_date: template.selected_payroll_date,
        createdAt: nowPH(),
    }));
}
// FILTER COMPANY FOR SPREADSHEET
export async function getCompaniesByCycle(cycle) {
    const companies = await prisma.company_details.findMany({
        where: {
            CompanyCycle: cycle,
        },
        select: {
            CompanyCode: true,
            CompanyName: true,
            CompanyCycle: true,
        },
        orderBy: { CompanyCode: "asc" },
    });
    return companies;
}
// FILTER COMPANY BY COMPANY CODE
export async function getCompaniesByCode(CompanyCode) {
    const companies = await prisma.company_details.findMany({
        where: {
            CompanyCode: CompanyCode,
        },
        select: {
            CompanyCode: true,
            CompanyName: true,
            CompanyCycle: true,
        },
        orderBy: { CompanyCode: "asc" },
    });
    return companies;
}
