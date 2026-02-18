import { prisma } from "../../config/prismaClient";
import { displayCompletePayroll } from "../payroll_archive/payroll_archive.service";
import { parsePayCycleToDate } from "./variance.helper";

export async function fetchEmployeeVariance() {
  const computed = await displayCompletePayroll(["FOR_APPROVAL"]);
  if (!computed || computed.length === 0) return [];

  const currentPayCode = computed[0].PayCode;
  const cycleCategory = computed[0].CycleCategory;
  const currentPayrollPeriod = computed[0].PayrollPeriod;
  const currentDate = parsePayCycleToDate(currentPayCode);

  /* ---------------------------------------------------------
     1️⃣ Get All Previous Payrolls (Same Cycle Category)
  ---------------------------------------------------------- */

  const payrollTotals = await prisma.totalPayroll.findMany({
    where: {
      cycle_category: cycleCategory,
    },
    select: {
      PayCycle: true,
      payroll_period: true,
    },
  });

  const previousPayrolls = payrollTotals
    .map(p => ({
      paycode: p.PayCycle,
      payroll_period: p.payroll_period,
      parsedDate: parsePayCycleToDate(p.PayCycle),
    }))
    .filter(p => p.parsedDate.getTime() < currentDate.getTime())
    .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());

  if (previousPayrolls.length === 0) return [];

  /* ---------------------------------------------------------
     2️⃣ Determine Two References
  ---------------------------------------------------------- */

  // Immediate previous (for Basic comparison)
  const immediatePrevious = previousPayrolls[0];

  // Same payroll_period previous (for SSS / Phil comparison)
  const samePeriodPrevious = previousPayrolls.find(
    p => p.payroll_period === currentPayrollPeriod
  );

  /* ---------------------------------------------------------
     3️⃣ Fetch Archive Records for Both References
  ---------------------------------------------------------- */

  const [immediateEmployees, samePeriodEmployees] = await Promise.all([
    immediatePrevious
      ? prisma.employeePayrollArchive.findMany({
          where: { PayCode: immediatePrevious.paycode },
        })
      : Promise.resolve([]),

    samePeriodPrevious
      ? prisma.employeePayrollArchive.findMany({
          where: { PayCode: samePeriodPrevious.paycode },
        })
      : Promise.resolve([]),
  ]);

  /* ---------------------------------------------------------
     4️⃣ Build Lookup Maps
  ---------------------------------------------------------- */

  const immediateMap = new Map(
    immediateEmployees.map(emp => [emp.EmpCodeId, emp])
  );

  const samePeriodMap = new Map(
    samePeriodEmployees.map(emp => [emp.EmpCodeId, emp])
  );

  /* ---------------------------------------------------------
     5️⃣ Compare Per Employee
  ---------------------------------------------------------- */

  const employeeVariance = computed.map(emp => {
      const prevImmediate = immediateMap.get(emp.EmpCodeId);
      const prevSamePeriod = samePeriodMap.get(emp.EmpCodeId);

      // 🔹 Basic → compare to immediate previous
      const prevBasic = Number(prevImmediate?.Basic_salary ?? 0);
      const currBasic = Number(emp.semi_monthly ?? 0);
      const basicDiff = currBasic - prevBasic;

      // 🔹 SSS / Phil → compare to same payroll_period
      const prevSSSEmp = Number(prevSamePeriod?.SSS_employee_share ?? 0);
      const currSSSEmp = Number(emp.sss_contrib_employee ?? 0);
      const sssEmpDiff = currSSSEmp - prevSSSEmp;

      const prevSSSEr = Number(prevSamePeriod?.SSS_employer_share ?? 0);
      const currSSSEr = Number(emp.sss_contrib_employer ?? 0);
      const sssErDiff = currSSSEr - prevSSSEr;

      const prevPhilEmp = Number(prevSamePeriod?.philhealth_employee_share ?? 0);
      const currPhilEmp = Number(emp.philhealth_contrib_employee ?? 0);
      const philEmpDiff = currPhilEmp - prevPhilEmp;

      const prevPhilEr = Number(prevSamePeriod?.philhealth_employer_share ?? 0);
      const currPhilEr = Number(emp.philhealth_contrib_employer ?? 0);
      const philErDiff = currPhilEr - prevPhilEr;

      const hasVariance =
        basicDiff !== 0 ||
        sssEmpDiff !== 0 ||
        sssErDiff !== 0 ||
        philEmpDiff !== 0 ||
        philErDiff !== 0;

      if (!hasVariance) return null;

      return {
        EmpCodeId: emp.EmpCodeId,
        isnew:emp.EmpCode.isNewEmployee,
        PayCode: currentPayCode,
        name: `${emp.EmpCode.Firstname} ${emp.EmpCode.Lastname}`,
        variance: {
          basic: basicDiff,
          sssEmployee: sssEmpDiff,
          sssEmployer: sssErDiff,
          philEmployee: philEmpDiff,
          philEmployer: philErDiff,
        },
      };
    }).filter(Boolean);

  return employeeVariance;
}

























export async function fetchVariance() {
  const computed = await displayCompletePayroll(["FOR_APPROVAL"]);

  if (!computed || computed.length === 0) {
    return { rows: [] };
  }

  const { PayCode, CycleCategory, TotalUndertime,EmpCodeId } = computed[0];
  const currentDate = parsePayCycleToDate(PayCode);

  // ================= CURRENT TOTALS =================
  const totalSemiMonthly = computed.reduce((sum, emp) => sum + Number(emp.semi_monthly ?? 0), 0);

  const totalSSSEmployee = computed.reduce((sum, emp) => sum + Number(emp.sss_contrib_employee ?? 0),0);

  const totalSSSEmployer = computed.reduce((sum, emp) => sum + Number(emp.sss_contrib_employer ?? 0),0);

  const totalPhilhealth = computed.reduce((sum, emp) => sum + Number(emp.philhealth_contrib_employee ?? 0),0);

  const totalPagibigEmployee = computed.reduce((sum, emp) => sum + Number(emp.pagibig_contrib_employee ?? 0),0);

  const totalPagibigEmployer = computed.reduce((sum, emp) => sum + Number(emp.pagibig_contrib_employer ?? 0),0);

  // ================= FETCH total payroll =================
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
    // sssEmployee:totalSSSEmployee - Number(olderPrevious?.Total_SSSContributionEmployee ?? 0),
    // sssEmployer:totalSSSEmployer - Number(olderPrevious?.Total_SSSContributionEmployer ?? 0),
    // phil:totalPhilhealth - Number(olderPrevious?.Total_PhilhealthContributionEmployee ?? 0),
    sssEmployee: olderPrevious ? totalSSSEmployee - Number(olderPrevious.Total_SSSContributionEmployee ?? 0): 0,
    sssEmployer: olderPrevious ? totalSSSEmployer - Number(olderPrevious.Total_SSSContributionEmployer ?? 0): 0,
    phil: olderPrevious ? totalPhilhealth - Number(olderPrevious.Total_PhilhealthContributionEmployee ?? 0): 0,
    pagibigEmployee:totalPagibigEmployee - Number(immediatePrevious?.Total_PagibigContributionEmployee ?? 0),
    pagibigEmployer:totalPagibigEmployer - Number(immediatePrevious?.Total_PagibigContributionEmployer ?? 0),
  };

  // ================= STRUCTURED RESPONSE =================
  return {
    rows: [
      // OLDER PREVIOUS 
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
