import { prisma } from "../../config/prismaClient";
import { displayCompletePayroll } from "../payroll_archive/payroll_archive.service";
import { parsePayCycleToDate } from "./variance.helper";




export async function fetchVariance() {
  const computed = await displayCompletePayroll(["FOR_APPROVAL"]);

  if (!computed || computed.length === 0) {
    return { rows: [] };
  }

  const { PayCode, CycleCategory } = computed[0];
  const currentDate = parsePayCycleToDate(PayCode);

  // ================= CURRENT TOTALS =================
  const totalSemiMonthly = computed.reduce(
    (sum, emp) => sum + Number(emp.semi_monthly ?? 0),
    0
  );

  const totalSSSEmployee = computed.reduce(
    (sum, emp) => sum + Number(emp.sss_contrib_employee ?? 0),
    0
  );

  const totalSSSEmployer = computed.reduce(
    (sum, emp) => sum + Number(emp.sss_contrib_employer ?? 0),
    0
  );

  const totalPhilhealth = computed.reduce(
    (sum, emp) => sum + Number(emp.philhealth_contrib ?? 0),
    0
  );

  const totalPagibigEmployee = computed.reduce(
    (sum, emp) => sum + Number(emp.pagibig_contrib_employee ?? 0),
    0
  );

  const totalPagibigEmployer = computed.reduce(
    (sum, emp) => sum + Number(emp.pagibig_contrib_employer ?? 0),
    0
  );

  // ================= FETCH HISTORY =================
  const payrollTotals = await prisma.totalPayroll.findMany({
    where: { cycle_category: CycleCategory },
    select: {
      PayCycle: true,
      total_basic_salary: true,
      Total_SSSContributionEmployee: true,
      Total_SSSContributionEmployer: true,
      Total_PhilhealthContributionEmployee: true,
      Total_PagibigContributionEmployee: true,
      Total_PagibigContributionEmployer: true,
    },
  });

  const previousTwo = payrollTotals
    .map((p) => ({
      ...p,
      parsedDate: parsePayCycleToDate(p.PayCycle),
    }))
    .filter((p) => p.parsedDate.getTime() < currentDate.getTime())
    .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime())
    .slice(0, 2);

  const immediatePrevious = previousTwo[0] ?? null;
  const olderPrevious = previousTwo[1] ?? null;

  // ================= VARIANCE =================
  const variance = {
    basic:totalSemiMonthly - Number(immediatePrevious?.total_basic_salary ?? 0),
    sssEmployee:totalSSSEmployee - Number(olderPrevious?.Total_SSSContributionEmployee ?? 0),
    sssEmployer:totalSSSEmployer - Number(olderPrevious?.Total_SSSContributionEmployer ?? 0),
    phil:totalPhilhealth - Number(olderPrevious?.Total_PhilhealthContributionEmployee ?? 0),
    pagibigEmployee:totalPagibigEmployee - Number(immediatePrevious?.Total_PagibigContributionEmployee ?? 0),
    pagibigEmployer:totalPagibigEmployer - Number(immediatePrevious?.Total_PagibigContributionEmployer ?? 0),
  };

  // ================= STRUCTURED RESPONSE =================
  return {
    rows: [
      // OLDER PREVIOUS (Basic forced 0)
      olderPrevious && {
        PayCycle: olderPrevious.PayCycle,
        basic: 0,
        sssEmployee: Number(olderPrevious.Total_SSSContributionEmployee ?? 0),
        sssEmployer: Number(olderPrevious.Total_SSSContributionEmployer ?? 0),
        phil: Number(olderPrevious.Total_PhilhealthContributionEmployee ?? 0),
      },

      // IMMEDIATE PREVIOUS
      immediatePrevious && {
        PayCycle: immediatePrevious.PayCycle,
        basic: Number(immediatePrevious.total_basic_salary ?? 0),
        sssEmployee: Number(immediatePrevious.Total_SSSContributionEmployee ?? 0),
        sssEmployer: Number(immediatePrevious.Total_SSSContributionEmployer ?? 0),
        phil: Number(immediatePrevious.Total_PhilhealthContributionEmployee ?? 0),
      },

      {
        PayCycle: PayCode,
        basic: totalSemiMonthly,
        sssEmployee: totalSSSEmployee,
        sssEmployer: totalSSSEmployer,
        phil: totalPhilhealth,
      },

      {
        PayCycle: "VARIANCE",
        basic: variance.basic,
        sssEmployee: variance.sssEmployee,
        sssEmployer: variance.sssEmployer,
        phil: variance.phil,
      },
    ].filter(Boolean),
  };
}
