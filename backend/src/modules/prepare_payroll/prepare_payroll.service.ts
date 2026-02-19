import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { addMonths, toMonth } from "../../helper/prepare_payroll_helper";
import { computeAbsent, computeGrossPay, computeLate, computeOvertime, computePagibig, computePhilRateEmployee, computeSemiMonthlySalary, computeSSSContribution, computeSSSContributionEmployer } from "./prepare_payroll.computation";
import { convertPayrollLabelToPeriod, getCurrentPayrollLabel, PAYROLL_CYCLE_MAP } from "./prepare_payroll.types";
import { getBodPhilhealth, getSSSContributions } from "../general/general.services";

export async function fetchEmployeesByPayrollCycle({cycle, page,limit,search}: {cycle: "10-25-Cycle" | "15-30-Cycle"; page: number; limit: number; search?: string }) {

    const baseFilter = {
        BranchCode: {
          CompanyCode: {
            CompanyCycle: cycle,
          },
        },
      };

  const searchFilter = search
    ? {
        OR: [
          { EmpCode: { contains: search } },
          { Firstname: { contains: search } },
          { Lastname: { contains: search } },
        ],
      }
    : {};


  const statusFilter = {
    OR: [
      {
        EmployeeStatus: {
          notIn: ["Resigned", "Inactive", "Terminate"],
        },
      },
      {
        bod_member: {
          in: ["bod1", "bod2"],
        },
      },
    ],
  };

  const where = {
    AND: [
      baseFilter,
      searchFilter,
      statusFilter,
    ],
  };

  const total = await prisma.employee.count({ where });
  const bodPhil = await getBodPhilhealth();
  const sssTable = await getSSSContributions();
  const phil = await prisma.payroll_Parameters.findFirst({select: { SettingPercentage: true },});

  const zeroSalaryCount = await prisma.employee.count({
    where: {
      ...where,
      employeepayroll: {
        basic_salary: 0,
      },
    },
  });
  

  const data = await prisma.employee.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { EmpCode: "desc" },
    select: {
      EmpCode: true,
      Firstname: true,
      Lastname: true,
      Department: true,
      Position: true,
      EmploymentStatus: true,
      isNewEmployee: true,
      bod_member:true,
      loan_details: {
        select: {
          loan_type: true,
          per_payroll_deduct: true,
          start_date: true,
        },
      },
      pagibig_list: {
        take: 1,
        select: {
          pagibig_id: true,
          pagibig_employee_share: true,
          pagibig_employer_share: true,
        },
      },
      employeepayroll: {
        select: {
          basic_salary: true,
          cash_assistance: true,
          ecola: true,
        },
      },
      BranchCode: {
        select: {
          branchCode: true,
          Location: true,
          CompanyCode: {
            select: {
              CompanyName: true,
              CompanyCycle: true,
            },
          },
        },
      },
    },
    
  });


// Loan code ↓

  const payrolls = await prisma.totalPayroll.findMany({
    orderBy: { createdAt: "desc" },
    take: 1,
    select: {
      payroll_period: true,
      PayCycle: true,
      cycle_category: true,
      createdAt: true,
    },
  });

  let prevPayrollPeriod: string;
  let payCycleLabel: string;

  if (!payrolls.length) {
    prevPayrollPeriod = "25-pay-cycle";
    payCycleLabel = getCurrentPayrollLabel();
  } else {
    const latestPayroll = payrolls[0];

    prevPayrollPeriod = latestPayroll.payroll_period ?? "25-pay-cycle";
    payCycleLabel = latestPayroll.PayCycle ?? getCurrentPayrollLabel();

  }

// Loan Code ↑

const bodMap = new Map(
  bodPhil.map((b) => [
    b.EmpCodeId,
    b.employee_share ? b.employee_share.toNumber() : 0,
  ])
);

  const normalized = data.map(emp => {

  const basicSalary = emp.employeepayroll?.basic_salary?.toNumber() ?? 0;
  const cashAssitance = emp.employeepayroll?.cash_assistance?.toNumber() ?? 0;
  const phil_percentage = phil?.SettingPercentage?.toNumber() ?? 0;
  const rawPagibigShare = emp.pagibig_list[0]?.pagibig_employee_share?.toNumber() ?? 0;
  const rawPagibigShareEmployer = emp.pagibig_list[0]?.pagibig_employer_share?.toNumber() ?? 0;
  const pagibigId = emp.pagibig_list[0]?.pagibig_id ?? 'N/A';
  const isNewProbi = emp.EmploymentStatus === "Probationary" && emp.isNewEmployee;
  const isBod = emp.bod_member === "bod1";


  const bodShare = bodMap.get(emp.EmpCode) ?? 0;

  const semiPay = computeSemiMonthlySalary(basicSalary);
  const sssContrib = computeSSSContribution(basicSalary, sssTable);
  const sssContribEmployer = computeSSSContributionEmployer(basicSalary, sssTable);
  const philhealthRate = computePhilRateEmployee(semiPay, phil_percentage,isBod,bodShare);
  const pagibigShare = computePagibig(rawPagibigShare).toFixed(2);


// Loan Code ↓

  const loanMap = {
    FCH_LOAN: 0,
    SSS_LOAN: 0,
    PAGIBIG_LOAN: 0,
    RFC_LOAN: 0,
  };

  const nextPayrollCycle =
    PAYROLL_CYCLE_MAP[prevPayrollPeriod];

  if (!nextPayrollCycle) {
    throw new Error(`Invalid payroll period: ${prevPayrollPeriod}`);
  }

  // Convert label → YYYY-MM
  const payPeriod =
    convertPayrollLabelToPeriod(payCycleLabel);

  console.log("convertPayrollLabelToPeriod input:", payCycleLabel);

// Loan Code ↑



    
  // const currentMonth = toMonth(new Date());
  
  // emp.loan_details.forEach(loan => {
  //   if (!loan.loan_type || !loan.per_payroll_deduct) return;
  //   if (!loan.start_date || !loan.end_date) return;
  
  //   const startMonth = toMonth(new Date(loan.start_date));
  //   const endMonth = toMonth(new Date(loan.end_date));
  //   const isActive = currentMonth >= startMonth && currentMonth <= endMonth;
  
  //   if (isActive) {
  //     loanMap[loan.loan_type as keyof typeof loanMap] = loan.per_payroll_deduct.toNumber();
  //   }
  // });


  return {
    ...emp,
    basic_salary: basicSalary,
    sss_contrib:sssContrib,
    sss_contrib_empployer:sssContribEmployer,
    phil_rate:philhealthRate,
    pagibig_share:pagibigShare,
    pagibig_employee_share: rawPagibigShare,
    pagibig_employer_share:rawPagibigShareEmployer,
    pagibig_id:pagibigId,
    cash_assistance:cashAssitance,
    fch_loan: loanMap.FCH_LOAN,
    sss_loan: loanMap.SSS_LOAN,
    pagibig_loan: loanMap.PAGIBIG_LOAN,
    rfc_loan: loanMap.RFC_LOAN,

    // loan Code ↓
    next_payroll: nextPayrollCycle ,
    month_pay:payPeriod,
    // loan Code ↑
  };
});

  return {
    data:normalized,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      zeroSalaryCount
    },
  };
}










export async function saveEmployeePayroll({empCode,basic_salary,cash_assistance,pagibig_employee_share,pagibig_employer_share}: {
  empCode: string;
  basic_salary?: number;
  cash_assistance?: number;
  pagibig_employee_share?: number;
  pagibig_employer_share?: number;
}) {
  return await prisma.$transaction(async (tx) => {

    /* ================= BASIC PAYROLL ================= */
    if (basic_salary !== undefined || cash_assistance !== undefined) {
      const payroll = await tx.employee_payroll.findFirst({
        where: { EmpCodeId: empCode },
      });

      const payrollData: any = {};
      if (basic_salary !== undefined) payrollData.basic_salary = basic_salary;
      if (cash_assistance !== undefined) payrollData.cash_assistance = cash_assistance;

      if (payroll) {
        await tx.employee_payroll.update({
          where: { payroll_id: payroll.payroll_id },
          data: payrollData,
        });
      } else {
        await tx.employee_payroll.create({
          data: {
            EmpCodeId: empCode,
            ...payrollData,
          },
        });
      }
    }

    /* ================= PAG-IBIG ================= */
    if (
      pagibig_employee_share !== undefined ||
      pagibig_employer_share !== undefined
    ) {
      const pagibig = await tx.pagIbig_List.findFirst({
        where: { EmpCodeId: empCode },
      });

      const pagibigData: any = {};
      if (pagibig_employee_share !== undefined)
        pagibigData.pagibig_employee_share = pagibig_employee_share;
      if (pagibig_employer_share !== undefined)
        pagibigData.pagibig_employer_share = pagibig_employer_share;

      if (pagibig) {
        await tx.pagIbig_List.update({
          where: { pagibig_id: pagibig.pagibig_id },
          data: pagibigData,
        });
      } else {
       

        await tx.pagIbig_List.create({
          data: {
            EmpCodeId: empCode,
            ...pagibigData,
          },
        });
      }
    }
  });
}








export async function searchEmployees(keyword: string) {
  return prisma.employee.findMany({
    where: {
      OR: [
        { Firstname: { contains: keyword } },
        { Lastname: { contains: keyword } },
        { EmpCode: { contains: keyword } },
      ],
    },
    take: 10,
    select: {
      EmpCode: true,
      Firstname: true,
      Lastname: true,
    },
  });
}















export async function ComputePayroll({cycle,page,limit,search}: {  cycle: "10-25-Cycle" | "15-30-Cycle"; page: number; limit: number; search?: string}) {

  const searchFilter = search
  ? {
      OR: [
        { EmpCodeId: { contains: search } },
        { EmpCode: { Firstname: { contains: search } } },
        { EmpCode: { Lastname: { contains: search } } },
      ],
    }
  : {};

  const statusOverride = {
    OR: [
      {
        EmpCode: {
          EmployeeStatus: {
            notIn: ["Resigned", "Inactive", "Terminate"],
          },
        },
      },
      {
        EmpCode: {
          bod_member: {
            in: ["bod1", "bod2"],
          },
        },
      },
    ],
  };

  const finalWhere: Prisma.EmployeeSummaryWhereInput = {
    AND: [
      { CycleCategory: cycle },
      { status: { in: ["PENDING"] } },
      searchFilter,
      statusOverride,
    ],
  };
  

  const [total, data] = await Promise.all([
    prisma.employeeSummary.count({ where: finalWhere }),
  
    prisma.employeeSummary.findMany({
      where: finalWhere,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { EmpCodeId: "asc" },
      select: {
        PayCode: true,
        EmpCodeId: true,
        LateCount: true,
        TotalAbsentHours: true,
        RegularAtt: true,
        OvertimeAtt: true,
        NightShiftAtt: true,
        NightShiftOtAtt: true,
        EmpCode: {
          select: {
            Firstname: true,
            Lastname: true,
            employeepayroll: {
              select: {
                basic_salary: true,
                cash_assistance: true,
                ecola: true,
              },
            },
          },
        },
      },
    }),
  ]);
  

  const normalized = data.map((emp) => {
    const salaryDecimal = emp.EmpCode.employeepayroll?.basic_salary;
    const basicSalary = salaryDecimal ? salaryDecimal.toNumber() : 0;
    const totalLateCount = emp.LateCount ? Number(emp.LateCount): 0;
    const totalAbsent = emp.TotalAbsentHours ? Number(emp.TotalAbsentHours) : 0;

    const lateCount = computeLate(totalLateCount,basicSalary);
    const absent = computeAbsent(totalAbsent,basicSalary);
    const semiMonthlyRate = computeSemiMonthlySalary(basicSalary);

    const overTime = computeOvertime(basicSalary, {
      regular: emp.RegularAtt,
      overtime: emp.OvertimeAtt,
      nightShift: emp.NightShiftAtt,
      nightShiftOt: emp.NightShiftOtAtt,
    });

    return {
      ...emp,
      late_count:lateCount,
      absence_count:absent,
      overtime:overTime,
      gross_pay:computeGrossPay(overTime,semiMonthlyRate,lateCount,absent),
    };
  });

  return {
    data: normalized,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
  


