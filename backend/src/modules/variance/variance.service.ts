import { prisma } from "../../config/prismaClient";
import { displayCompletePayroll } from "../payroll_archive/payroll_archive.service";
import { parsePayCycleToDate } from "./variance.helper";




export async function fetchVariance() {
  const computed = await displayCompletePayroll(["FOR_APPROVAL"]);

  if (!computed || computed.length === 0) {
    return [];
  }

  const { PayCode, CycleCategory } = computed[0];
  const currentDate = parsePayCycleToDate(PayCode);

  const totalSemiMonthly = computed.reduce((sum, emp) => { return sum + Number(emp.semi_monthly ?? 0) }, 0);
  const totalSSSEmployee = computed.reduce((sum, emp) => {return sum + Number(emp.sss_contrib_employee ?? 0)}, 0);
  const totalSSSEmployer = computed.reduce((sum, emp) => {return sum + Number(emp.sss_contrib_employer ?? 0) }, 0);
  const totalPhilhealth = computed.reduce((sum, emp) => {return sum + Number(emp.philhealth_contrib ?? 0) }, 0);
  const totalPagigbigEmployee = computed.reduce((sum, emp) => {return sum + Number(emp.pagibig_contrib_employee ?? 0) }, 0);
  const totalPagigbigEmployer = computed.reduce((sum, emp) => {return sum + Number(emp.pagibig_contrib_employer ?? 0) }, 0);

 

  const payrollTotals = await prisma.totalPayroll.findMany({
    where: {
      cycle_category: CycleCategory,
    },
    select:{
      cycle_category:true,
      PayCycle:true,
      total_basic_salary:true,
      payroll_period:true,
      Total_SSSContributionEmployee:true,
      Total_SSSContributionEmployer:true,
      Total_PhilhealthContributionEmployee:true,
      Total_PhilhealthContributionEmployer:true,
      Total_PagibigContributionEmployee:true,
      Total_PagibigContributionEmployer:true,
      total_wtax:true,
    }
  });

  const previousTwo = payrollTotals.map((p) => ({
      ...p,
      parsedDate: parsePayCycleToDate(p.PayCycle),
    }))
    .filter((p) => p.parsedDate.getTime() < currentDate.getTime())
    .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime())
    .slice(0, 2);

  return {
    paycode: PayCode,
    total_semi_monthly: totalSemiMonthly,
    total_sss_employee:totalSSSEmployee,
    total_sss_employer:totalSSSEmployer,
    total_phil:totalPhilhealth,
    total_pagibig_employee:totalPagigbigEmployee,
    total_pagibig_employer:totalPagigbigEmployer,
    previous: previousTwo,

  };
}


