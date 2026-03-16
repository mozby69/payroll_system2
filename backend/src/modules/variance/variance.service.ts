import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { displayCompletePayroll } from "../payroll_archive/payroll_archive.service";
import { parsePayCycleToDate } from "./variance.helper";


export async function fetchVariance(companyId: string) {
  let computed = (await displayCompletePayroll(["PENDING"])) ?? [];

  computed = computed.filter(
    r => r.EmpCode?.BranchCode?.company_id === companyId
  );


  const { CycleCategory } = computed[0];
  const payrollPeriod = computed[0].PayrollPeriod;

  const includePagibigAndTax =
    payrollPeriod === "25-pay-cycle" || payrollPeriod === "30-pay-cycle";

  // -----------------------------
  // PREVIOUS TOTAL PAYROLL
  // -----------------------------
  const payrollTotals = await prisma.totalPayroll.findMany({
    where: { cycle_category: CycleCategory },
    orderBy: { id: "desc" },
    take: 2
  });

  const previousPayrolls = payrollTotals.reverse();

  const olderPrevious = previousPayrolls.length > 1 ? previousPayrolls[0] : null;

  const recentPrevious = previousPayrolls.length > 0 ? previousPayrolls[previousPayrolls.length - 1]: null;

  const olderPreviousAdjusted = olderPrevious
    ? {
        ...olderPrevious,
        total_basic_salary: 0
      }
    : null;

  const recentPreviousAdjusted = recentPrevious
    ? {
        ...recentPrevious,
        Total_SSSContributionEmployee: 0,
        Total_SSSContributionEmployer: 0,
        Total_PhilhealthContributionEmployee: 0,
        Total_PhilhealthContributionEmployer: 0,
        Total_PagibigContributionEmployee: 0,
        Total_PagibigContributionEmployer: 0,
        total_wtax: 0
      }
    : null;



  // -----------------------------
  // CURRENT TOTALS FROM COMPUTED
  // -----------------------------
  const currentTotals = computed.reduce(
    (acc, row) => {
      acc.total_basic_salary += Number(row.semi_monthly ?? 0);
      acc.Total_SSSContributionEmployee += Number(row.sss_contrib_employee ?? 0);
      acc.Total_SSSContributionEmployer += Number(row.sss_contrib_employer ?? 0);
      acc.Total_PhilhealthContributionEmployee += Number(row.philhealth_contrib_employee ?? 0);
      acc.Total_PhilhealthContributionEmployer += Number(row.philhealth_contrib_employer ?? 0);

      if (includePagibigAndTax) {
        acc.Total_PagibigContributionEmployee += Number(row.pagibig_contrib_employee ?? 0);
        acc.Total_PagibigContributionEmployer += Number(row.pagibig_contrib_employer ?? 0);
        acc.total_wtax += Number(row.wtax ?? 0);
      }

      return acc;
    },
    {
      total_basic_salary: 0,
      Total_SSSContributionEmployee: 0,
      Total_SSSContributionEmployer: 0,
      Total_PhilhealthContributionEmployee: 0,
      Total_PhilhealthContributionEmployer: 0,
      Total_PagibigContributionEmployee: 0,
      Total_PagibigContributionEmployer: 0,
      total_wtax: 0
    }
  );

  // -----------------------------
  // TOTAL VARIANCE
  // -----------------------------
  const varianceRow = {
    PayCycle: "VARIANCE",
    total_basic_salary:
      currentTotals.total_basic_salary -
      Number(recentPreviousAdjusted?.total_basic_salary ?? 0),

    Total_SSSContributionEmployee:
      currentTotals.Total_SSSContributionEmployee -
      Number(olderPreviousAdjusted?.Total_SSSContributionEmployee ?? 0),

    Total_SSSContributionEmployer:
      currentTotals.Total_SSSContributionEmployer -
      Number(olderPreviousAdjusted?.Total_SSSContributionEmployer ?? 0),

    Total_PhilhealthContributionEmployee:
      currentTotals.Total_PhilhealthContributionEmployee -
      Number(olderPreviousAdjusted?.Total_PhilhealthContributionEmployee ?? 0),

    Total_PhilhealthContributionEmployer:
      currentTotals.Total_PhilhealthContributionEmployer -
      Number(olderPreviousAdjusted?.Total_PhilhealthContributionEmployer ?? 0),

    Total_PagibigContributionEmployee: includePagibigAndTax
      ? currentTotals.Total_PagibigContributionEmployee -
        Number(olderPreviousAdjusted?.Total_PagibigContributionEmployee ?? 0)
      : 0,

    Total_PagibigContributionEmployer: includePagibigAndTax
      ? currentTotals.Total_PagibigContributionEmployer -
        Number(olderPreviousAdjusted?.Total_PagibigContributionEmployer ?? 0)
      : 0,

    total_wtax: includePagibigAndTax
      ? currentTotals.total_wtax - Number(olderPreviousAdjusted?.total_wtax ?? 0)
      : 0
  };

  // -----------------------------
  // GROUP CURRENT BY COMPANY
  // -----------------------------
  const companyGroups = {
    [companyId ?? "UNKNOWN"]: computed
  };
  
  // -----------------------------
  // PREVIOUS COMPANY TOTALS
  // -----------------------------
  const previousCompanyTotals = await prisma.totalPayrollByCompany.findMany({
    where: {
      ...(companyId && { company_id: companyId }),
      total_payroll_id: {
        in: [olderPrevious?.id, recentPrevious?.id].filter(Boolean) as number[]
      }
    }
  });
  // -----------------------------
  // COMPANY VARIANCE
  // -----------------------------
  const companyVariance = Object.entries(companyGroups).map(
    ([companyCode, rows]) => {

      const current = rows.reduce(
        (acc, row) => {
          acc.total_basic_salary += Number(row.semi_monthly ?? 0);
          acc.Total_SSSContributionEmployee += Number(row.sss_contrib_employee ?? 0);
          acc.Total_SSSContributionEmployer += Number(row.sss_contrib_employer ?? 0);
          acc.Total_PhilhealthContributionEmployee += Number(row.philhealth_contrib_employee ?? 0);
          acc.Total_PhilhealthContributionEmployer += Number(row.philhealth_contrib_employer ?? 0);

          if (includePagibigAndTax) {
            acc.Total_PagibigContributionEmployee += Number(row.pagibig_contrib_employee ?? 0);
            acc.Total_PagibigContributionEmployer += Number(row.pagibig_contrib_employer ?? 0);
            acc.total_wtax += Number(row.wtax ?? 0);
          }

          return acc;
        },
        {
          total_basic_salary: 0,
          Total_SSSContributionEmployee: 0,
          Total_SSSContributionEmployer: 0,
          Total_PhilhealthContributionEmployee: 0,
          Total_PhilhealthContributionEmployer: 0,
          Total_PagibigContributionEmployee: 0,
          Total_PagibigContributionEmployer: 0,
          total_wtax: 0
        }
      );

      const olderCompany = previousCompanyTotals.find(
        c =>
          c.company_id === companyCode &&
          c.total_payroll_id === olderPrevious?.id
      );

      const recentCompany = previousCompanyTotals.find(
        c =>
          c.company_id === companyCode &&
          c.total_payroll_id === recentPrevious?.id
      );


      const olderCompanyAdjusted = olderCompany
        ? {
            ...olderCompany,
            total_basic_salary: 0
          }
        : null;

      const recentCompanyAdjusted = recentCompany
        ? {
            ...recentCompany,
            Total_SSSContributionEmployee: 0,
            Total_SSSContributionEmployer: 0,
            Total_PhilhealthContributionEmployee: 0,
            Total_PhilhealthContributionEmployer: 0,
            Total_PagibigContributionEmployee: 0,
            Total_PagibigContributionEmployer: 0,
            total_wtax: 0
          }
        : null;

      const variance = {
        total_basic_salary:
          current.total_basic_salary -
          Number(recentCompanyAdjusted?.total_basic_salary ?? 0),

        Total_SSSContributionEmployee:
          current.Total_SSSContributionEmployee -
          Number(olderCompanyAdjusted?.Total_SSSContributionEmployee ?? 0),

        Total_SSSContributionEmployer:
          current.Total_SSSContributionEmployer -
          Number(olderCompanyAdjusted?.Total_SSSContributionEmployer ?? 0),

        Total_PhilhealthContributionEmployee:
          current.Total_PhilhealthContributionEmployee -
          Number(olderCompanyAdjusted?.Total_PhilhealthContributionEmployee ?? 0),

        Total_PhilhealthContributionEmployer:
          current.Total_PhilhealthContributionEmployer -
          Number(olderCompanyAdjusted?.Total_PhilhealthContributionEmployer ?? 0),

        Total_PagibigContributionEmployee: includePagibigAndTax
          ? current.Total_PagibigContributionEmployee -
            Number(olderCompanyAdjusted?.Total_PagibigContributionEmployee ?? 0)
          : 0,

        Total_PagibigContributionEmployer: includePagibigAndTax
          ? current.Total_PagibigContributionEmployer -
            Number(olderCompanyAdjusted?.Total_PagibigContributionEmployer ?? 0)
          : 0,

        total_wtax: includePagibigAndTax
          ? current.total_wtax - Number(olderCompanyAdjusted?.total_wtax ?? 0)
          : 0
      };

      return {
        company: companyCode,
        rows: [
          {
            PayCycle: olderPrevious?.PayCycle ?? "",
            ...(olderCompanyAdjusted ?? {})
          },
          {
            PayCycle: recentPrevious?.PayCycle ?? "",
            ...(recentCompanyAdjusted ?? {})
          },
          {
            PayCycle: computed[0].PayCode,
            ...current
          },
          {
            PayCycle: "VARIANCE",
            ...variance
          }
        ]
      };
    }
  );

  const totalRows: any[] = [];

  if (olderPreviousAdjusted) {
    totalRows.push(olderPreviousAdjusted);
  }
  
  if (recentPreviousAdjusted) {
    totalRows.push(recentPreviousAdjusted);
  }
  
  totalRows.push({
    PayCycle: computed[0].PayCode,
    ...currentTotals
  });
  
  if (varianceRow) {
    totalRows.push(varianceRow);
  }
  
  return {
    includePagibigAndTax,
    total_variance: totalRows,
    company_variance: companyVariance
  };
}





interface VarianceEmployee {
  empId: string
  name: string

  previousBasic?: number
  currentBasic?: number

  previousSSS?: number
  currentSSS?: number

  previousSSSEmployer?: number
  currentSSSEmployer?: number

  previousPhil?: number
  currentPhil?: number

  previousPhilEmployer?: number
  currentPhilEmployer?: number

  previousPag?: number
  currentPag?: number

  previousPagEmployer?: number
  currentPagEmployer?: number

  previousTaxEmploye?: number
  currentTaxEmploye?: number

  difference?: number
}

interface VarianceAnalysis {
  newEmployees: VarianceEmployee[]
  salaryIncrease: VarianceEmployee[]
  resignedEmployees: VarianceEmployee[]

  sssVariance: VarianceEmployee[]
  sssEmployerVariance: VarianceEmployee[]
  philEmployerVariance: VarianceEmployee[]
  philVariance: VarianceEmployee[]
  pagEmployerVariance: VarianceEmployee[]
  pagVariance: VarianceEmployee[]
  taxVariance: VarianceEmployee[]
}

export async function fetchVarianceEmp(companyId: string) {

  let computed = (await displayCompletePayroll(["PENDING"])) ?? []

  //--------------------------------
  // FILTER BY COMPANY
  //--------------------------------

  computed = computed.filter(
    r => r.EmpCode?.BranchCode?.company_id === companyId
  )

  if (computed.length === 0) {
    return {
      includePagibigAndTax: false,
      total_variance: [],
      company_variance: [],
      variance_analysis: {
        newEmployees: [],
        salaryIncrease: [],
        resignedEmployees: [],
        sssVariance: [],
        sssEmployerVariance: [],
        philEmployerVariance: [],
        philVariance:[],
        pagEmployerVariance:[],
        pagVariance:[],
        taxVariance:[],
      }
    }
  }

  const { CycleCategory, PayrollPeriod, PayCode } = computed[0]

  const includePagibigAndTax =
    PayrollPeriod === "25-pay-cycle" || PayrollPeriod === "30-pay-cycle"

  //--------------------------------
  // CURRENT TOTAL BASIC
  //--------------------------------

  const currentTotals = computed.reduce(
    (acc, row) => {
      acc.total_basic_salary += Number(row.semi_monthly ?? 0)
      return acc
    },
    { total_basic_salary: 0 }
  )

  //--------------------------------
  // GET CURRENT PAYROLL RECORD
  //--------------------------------

  const currentPayroll = await prisma.totalPayroll.findFirst({
    where: {
      cycle_category: CycleCategory,
      PayCycle: PayCode
    },
    orderBy: { id: "desc" }
  })

  //--------------------------------
  // PREVIOUS PAYROLL (FOR BASIC)
  //--------------------------------

  const previousPayrollBasic = await prisma.totalPayroll.findFirst({
    where: {
      cycle_category: CycleCategory,
      id: { lt: currentPayroll?.id }
    },
    orderBy: { id: "desc" }
  })

  //--------------------------------
  // PREVIOUS PAYROLL SAME PERIOD (FOR SSS)
  //--------------------------------

  const previousPayrollSSS = await prisma.totalPayroll.findFirst({
    where: {
      cycle_category: CycleCategory,
      payroll_period: PayrollPeriod,
      id: { lt: currentPayroll?.id }
    },
    orderBy: { id: "desc" }
  })

  //--------------------------------
  // PREVIOUS EMPLOYEES BASIC
  //--------------------------------

  const previousEmployeesBasic = await prisma.employeePayrollArchive.findMany({
    where: {
      totalPayrollId: previousPayrollBasic?.id,
      EmpCode: {
        BranchCode: {
          company_id: companyId
        }
      }
    },
    include: { EmpCode: true }
  })

  //--------------------------------
  // PREVIOUS EMPLOYEES SSS
  //--------------------------------

  const previousEmployeesSSS = await prisma.employeePayrollArchive.findMany({
    where: {
      totalPayrollId: previousPayrollSSS?.id,
      EmpCode: {
        BranchCode: {
          company_id: companyId
        }
      }
    },
    include: { EmpCode: true }
  })

  //--------------------------------
  // CREATE MAPS
  //--------------------------------

  const currentMap = new Map<string, typeof computed[0]>()

  for (const row of computed) {
    if (!row.EmpCodeId) continue
    currentMap.set(row.EmpCodeId, row)
  }

  const previousMapBasic = new Map<string, typeof previousEmployeesBasic[0]>()

  for (const row of previousEmployeesBasic) {
    previousMapBasic.set(row.EmpCodeId, row)
  }

  const previousMapSSS = new Map<string, typeof previousEmployeesSSS[0]>()

  for (const row of previousEmployeesSSS) {
    previousMapSSS.set(row.EmpCodeId, row)
  }

  //--------------------------------
  // VARIANCE ANALYSIS
  //--------------------------------

  const varianceAnalysis: VarianceAnalysis = {
    newEmployees: [],
    salaryIncrease: [],
    resignedEmployees: [],
    sssVariance: [],
    sssEmployerVariance: [],
    philEmployerVariance: [],
    philVariance:[],
    pagEmployerVariance:[],
    pagVariance:[],
    taxVariance:[],
  }

  //--------------------------------
  // NEW EMPLOYEES
  //--------------------------------

  for (const [empId, row] of currentMap) {

    if (!previousMapBasic.has(empId)) {

      varianceAnalysis.newEmployees.push({
        empId,
        name: `${row.EmpCode?.Firstname ?? ""} ${row.EmpCode?.Lastname ?? ""}`,
        currentBasic: Number(row.semi_monthly ?? 0)
      })

    }

  }

  //--------------------------------
  // SSS VARIANCE (FIXED)
  //--------------------------------

  for (const [empId, row] of currentMap) {

    const prev = previousMapSSS.get(empId)

    const currentSSS = Number(row.sss_contrib_employee ?? 0)
    const previousSSS = Number(prev?.SSS_employee_share ?? 0)

    if (currentSSS !== previousSSS) {

      varianceAnalysis.sssVariance.push({
        empId,
        name: `${row.EmpCode?.Firstname ?? ""} ${row.EmpCode?.Lastname ?? ""}`,
        previousSSS,
        currentSSS,
        difference: currentSSS - previousSSS
      })
    }

  }

  //--------------------------------
  // SSS EMPLOYEER VARIANCE
  //--------------------------------

  for (const [empId, row] of currentMap) {

    const prev = previousMapSSS.get(empId)

    const currentEmployer = Number(row.sss_contrib_employer ?? 0)
    const previousEmployer = Number(prev?.SSS_employer_share ?? 0)

    if (currentEmployer !== previousEmployer) {

      varianceAnalysis.sssEmployerVariance.push({
        empId,
        name: `${row.EmpCode?.Firstname ?? ""} ${row.EmpCode?.Lastname ?? ""}`,
        previousSSSEmployer: previousEmployer,
        currentSSSEmployer: currentEmployer,
        difference: currentEmployer - previousEmployer
      })

    }

  }
  //--------------------------------
  // PHIL EMPLOYEE VARIANCE
  //--------------------------------

  for (const [empId, row] of currentMap) {

    const prev = previousMapSSS.get(empId)

    const currentEmployee = Number(row.philhealth_contrib_employee ?? 0)
    const previousEmployee = Number(prev?.philhealth_employee_share ?? 0)

    if (currentEmployee !== previousEmployee) {

      varianceAnalysis.philVariance.push({
        empId,
        name: `${row.EmpCode?.Firstname ?? ""} ${row.EmpCode?.Lastname ?? ""}`,
        previousPhil: previousEmployee,
        currentPhil: currentEmployee,
        difference: currentEmployee - previousEmployee
      })

    }

  }
  //--------------------------------
  // PHIL EMPLOYER VARIANCE
  //--------------------------------

  for (const [empId, row] of currentMap) {

    const prev = previousMapSSS.get(empId)

    const currentEmployer = Number(row.philhealth_contrib_employer ?? 0)
    const previousEmployer = Number(prev?.philhealth_employer_share ?? 0)

    if (currentEmployer !== previousEmployer) {

      varianceAnalysis.philEmployerVariance.push({
        empId,
        name: `${row.EmpCode?.Firstname ?? ""} ${row.EmpCode?.Lastname ?? ""}`,
        previousPhilEmployer: previousEmployer,
        currentPhilEmployer: currentEmployer,
        difference: currentEmployer - previousEmployer
      })

    }

  }


   //--------------------------------
  // PAGIBIG EMPLOYEE VARIANCE
  //--------------------------------

  for (const [empId, row] of currentMap) {

    const prev = previousMapSSS.get(empId)

    const currentEmployee = Number(row.pagibig_contrib_employee ?? 0)
    const previousEmployee = Number(prev?.Pagibig_employee_share ?? 0)

    if (currentEmployee !== previousEmployee) {

      varianceAnalysis.pagVariance.push({
        empId,
        name: `${row.EmpCode?.Firstname ?? ""} ${row.EmpCode?.Lastname ?? ""}`,
        previousPag: previousEmployee,
        currentPag: currentEmployee,
        difference: currentEmployee - previousEmployee
      })

    }

  }


    //--------------------------------
  // PAGIBIG EMPLOYER VARIANCE
  //--------------------------------

  for (const [empId, row] of currentMap) {

    const prev = previousMapSSS.get(empId)

    const currentEmployer = Number(row.pagibig_contrib_employer ?? 0)
    const previousEmployer = Number(prev?.Pagibig_employer_share ?? 0)

    if (currentEmployer !== previousEmployer) {

      varianceAnalysis.pagEmployerVariance.push({
        empId,
        name: `${row.EmpCode?.Firstname ?? ""} ${row.EmpCode?.Lastname ?? ""}`,
        previousPagEmployer: previousEmployer,
        currentPagEmployer: currentEmployer,
        difference: currentEmployer - previousEmployer
      })

    }

  }


     //--------------------------------
  // TAX EMPLOYEE VARIANCE
  //--------------------------------

  for (const [empId, row] of currentMap) {

    const prev = previousMapSSS.get(empId)

    const currentEmployee = Number(row.wtax ?? 0)
    const previousEmployee = Number(prev?.w_tax ?? 0)

    if (currentEmployee !== previousEmployee) {

      varianceAnalysis.taxVariance.push({
        empId,
        name: `${row.EmpCode?.Firstname ?? ""} ${row.EmpCode?.Lastname ?? ""}`,
        previousTaxEmploye: previousEmployee,
        currentTaxEmploye: currentEmployee,
        difference: currentEmployee - previousEmployee
      })

    }

  }

  //--------------------------------
  // SALARY VARIANCE
  //--------------------------------

  for (const [empId, row] of currentMap) {

    const prev = previousMapBasic.get(empId)
    if (!prev) continue

    const currentBasic = Number(row.semi_monthly ?? 0)
    const previousBasic = Number(prev.Basic_salary ?? 0)

    if (currentBasic !== previousBasic) {

      varianceAnalysis.salaryIncrease.push({
        empId,
        name: `${row.EmpCode?.Firstname ?? ""} ${row.EmpCode?.Lastname ?? ""}`,
        previousBasic,
        currentBasic,
        difference: currentBasic - previousBasic
      })

    }

  }

  //--------------------------------
  // RESIGNED EMPLOYEES
  //--------------------------------

  for (const [empId, row] of previousMapBasic) {

    if (!currentMap.has(empId)) {

      const employee = row.EmpCode

      if (employee?.EmployeeStatus === "RESIGNED") {

        varianceAnalysis.resignedEmployees.push({
          empId,
          name: `${employee.Firstname ?? ""} ${employee.Lastname ?? ""}`,
          previousBasic: Number(row.Basic_salary ?? 0)
        })

      }

    }

  }

  //--------------------------------
  // PREVIOUS BASIC TOTAL
  //--------------------------------

  const previousBasicTotal = previousEmployeesBasic.reduce(
    (acc, row) => acc + Number(row.Basic_salary ?? 0),
    0
  )

  //--------------------------------
  // BASIC VARIANCE
  //--------------------------------

  const varianceRow = {
    PayCycle: "VARIANCE",
    total_basic_salary:
      currentTotals.total_basic_salary - previousBasicTotal
  }

  //--------------------------------
  // COMPANY VARIANCE TABLE
  //--------------------------------

  const companyVariance = [
    {
      company: companyId,
      rows: [
        {
          PayCycle: previousPayrollBasic?.PayCycle ?? "",
          total_basic_salary: previousBasicTotal
        },
        {
          PayCycle: PayCode,
          total_basic_salary: currentTotals.total_basic_salary
        },
        varianceRow
      ]
    }
  ]

  //--------------------------------
  // FINAL RETURN
  //--------------------------------

  return {

    includePagibigAndTax,

    total_variance: [
      {
        PayCycle: previousPayrollBasic?.PayCycle ?? "",
        total_basic_salary: previousBasicTotal
      },
      {
        PayCycle: PayCode,
        total_basic_salary: currentTotals.total_basic_salary
      },
      varianceRow
    ],

    company_variance: companyVariance,

    variance_analysis: varianceAnalysis
  }

}












export async function fetchEmployeeVariance() {
  try {

    const computed = await displayCompletePayroll(["PENDING"]);

    if (!computed || computed.length === 0) {
      return { employees_with_variance: [] };
    }

    const { CycleCategory } = computed[0];
    const payrollPeriod = computed[0].PayrollPeriod;

    const includePagibigAndTax = payrollPeriod === "25-pay-cycle" || payrollPeriod === "30-pay-cycle";


    // Get last two payroll summaries
    const payrollTotals = await prisma.totalPayroll.findMany({
      where: { cycle_category: CycleCategory },
      orderBy: { id: "desc" },
      take: 2,
      select: {
        id: true,
        PayCycle: true
      }
    });

    if (payrollTotals.length < 2) {
      return { employees_with_variance: [] };
    }

    const recentPrevious = payrollTotals[0];
    const olderPrevious = payrollTotals[1];


    // Fetch archived employee payrolls
    const archivedEmployees = await prisma.employeePayrollArchive.findMany({
      where: {
        totalPayrollId: {
          in: [recentPrevious.id, olderPrevious.id]
        }
      },
      select: {
        totalPayrollId: true,
        PayCode: true,
        EmpCodeId: true,
        Basic_salary: true,
        SSS_employee_share: true,
        SSS_employer_share: true,
        philhealth_employee_share: true,
        philhealth_employer_share: true,
        Pagibig_employee_share: true,
        Pagibig_employer_share: true,
        w_tax: true,
        EmpCode: {
          select: {
            Firstname: true,
            Lastname: true
          }
        }
      }
    });


    // Separate maps for recent and older payroll
    const recentMap = new Map<string, typeof archivedEmployees[number]>();
    const olderMap = new Map<string, typeof archivedEmployees[number]>();

    for (const emp of archivedEmployees) {
      if (emp.totalPayrollId === recentPrevious.id) {
        recentMap.set(emp.EmpCodeId, emp);
      } else if (emp.totalPayrollId === olderPrevious.id) {
        olderMap.set(emp.EmpCodeId, emp);
      }
    }

    //find new probationary


    //find new probationary

    const salaryHistory = await prisma.employeeSalaryHistory.findMany({
      where: {
        salary_type: "Basic"
      },
      select: {
        EmpCodeId: true,
        remarks: true
      }
    });

    const salaryHistoryMap = new Map(
      salaryHistory.map(h => [h.EmpCodeId, h])
    );


    // Compute employee variance
    const employeeVariance = computed
    .map((row) => {
  
      const history = salaryHistoryMap.get(row.EmpCodeId);
      const reason = history?.remarks;
  
      const recent = recentMap.get(row.EmpCodeId);
      const older = olderMap.get(row.EmpCodeId);
  
      if (!recent || !older) return null;
  
      const variance: Record<string, number | string> = {
        compared_paycode: older.PayCode,
        current_paycode: row.PayCode,
        EmpCodeId: row.EmpCodeId,
        name: `${row.EmpCode.Firstname} ${row.EmpCode.Lastname}`,
  
        basic_diff:
          Number(row.semi_monthly ?? 0) -
          Number(recent.Basic_salary ?? 0),
  
        sss_employee_diff:
          Number(row.sss_contrib_employee ?? 0) -
          Number(older.SSS_employee_share ?? 0),
  
        sss_employer_diff:
          Number(row.sss_contrib_employer ?? 0) -
          Number(older.SSS_employer_share ?? 0),
  
        phil_employee_diff:
          Number(row.philhealth_contrib_employee ?? 0) -
          Number(older.philhealth_employee_share ?? 0),
  
        phil_employer_diff:
          Number(row.philhealth_contrib_employer ?? 0) -
          Number(older.philhealth_employer_share ?? 0),
      };
  
      if (includePagibigAndTax) {
        variance.pagibig_employee_diff =
          Number(row.pagibig_contrib_employee ?? 0) -
          Number(older.Pagibig_employee_share ?? 0);
  
        variance.pagibig_employer_diff =
          Number(row.pagibig_contrib_employer ?? 0) -
          Number(older.Pagibig_employer_share ?? 0);
  
        variance.tax_diff =
          Number(row.wtax ?? 0) -
          Number(older.w_tax ?? 0);
      }
  
      const hasVariance = Object.values(variance).some(
        v => typeof v === "number" && v !== 0
      );
  
      if (!hasVariance) return null;
  
      if (reason) {
        return {
          [reason]: variance
        };
      }
  
      return variance;
    })
    .filter(Boolean);


    return {
      employees_with_variance: employeeVariance
    };

  } catch (error) {
    console.error("fetchEmployeeVariance error:", error);
    return { employees_with_variance: [] };
  }
}




