import { prisma } from "../../config/prismaClient";
import { displayCompletePayroll } from "../payroll_archive/payroll_archive.service";
import { parsePayCycleToDate } from "./variance.helper";


export async function fetchVariance() {
  const computed = await displayCompletePayroll(["PENDING"]);

  if (!computed || computed.length === 0) {
    return { total_variance: [] };
  }

  const { CycleCategory } = computed[0];

  const payrollTotals = await prisma.totalPayroll.findMany({
    where: {
      cycle_category: CycleCategory,
    },
    orderBy: {
      id: "desc",
    },
    take: 2,
    select: {
      id: true,
      cycle_category: true,
      PayCycle: true,
      payroll_period: true,
      total_basic_salary: true,
      Total_SSSContributionEmployee: true,
      Total_SSSContributionEmployer: true,
      Total_PhilhealthContributionEmployee: true,
      Total_PhilhealthContributionEmployer: true,
      Total_PagibigContributionEmployee: true,
      Total_PagibigContributionEmployer: true,
      total_wtax: true,
    },
  });

  const previousPayrolls = payrollTotals.reverse();

  const currentTotals = computed.reduce(
    (acc, row) => {
      acc.total_basic_salary += Number(row.semi_monthly ?? 0);
      acc.Total_SSSContributionEmployee += Number(row.sss_contrib_employee ?? 0);
      acc.Total_SSSContributionEmployer += Number(row.sss_contrib_employer ?? 0);
      acc.Total_PhilhealthContributionEmployee += Number(row.philhealth_contrib_employee ?? 0);
      acc.Total_PhilhealthContributionEmployer += Number(row.philhealth_contrib_employer ?? 0);
      return acc;
    },
    {
      total_basic_salary: 0,
      Total_SSSContributionEmployee: 0,
      Total_SSSContributionEmployer: 0,
      Total_PhilhealthContributionEmployee: 0,
      Total_PhilhealthContributionEmployer: 0,
    }
  );

  const currentPayrollRow = {
    id: 0,
    cycle_category: CycleCategory,
    PayCycle: computed[0].PayCode,
    payroll_period: computed[0].PayrollPeriod,
    total_basic_salary: currentTotals.total_basic_salary,
    Total_SSSContributionEmployee: currentTotals.Total_SSSContributionEmployee,
    Total_SSSContributionEmployer: currentTotals.Total_SSSContributionEmployer,
    Total_PhilhealthContributionEmployee: currentTotals.Total_PhilhealthContributionEmployee,
    Total_PhilhealthContributionEmployer: currentTotals.Total_PhilhealthContributionEmployer,
    Total_PagibigContributionEmployee: 0,
    Total_PagibigContributionEmployer: 0,
    total_wtax: 0,
  };

  return {
    total_variance: [
      ...previousPayrolls,
      currentPayrollRow,
    ],
  };
}