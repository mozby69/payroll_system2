import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { addMonths, generateNextPagibigId, toMonth } from "../../helper/prepare_payroll_helper";
import { computeAbsent, computeGrossPay, computeLate, computeOvertime, computePagibig, computePhilRate, computeSemiMonthlySalary, computeSSSContribution, computeSSSContributionEmployer } from "./prepare_payroll.computation";
import { FetchEmployeesByCycleParams, loanProps, PaginationParams } from "./prepare_payroll.types";

export async function fetchEmployeesByPayrollCycle({cycle, page,limit,search}: {
cycle: "10-25-Cycle" | "15-30-Cycle";
  page: number;
  limit: number;
  search?: string;
}) {
  const where = {
    BranchCode: {
      CompanyCode: {
        CompanyCycle: cycle,
      },
    },
    ...(search && {
      OR: [
        { EmpCode: { contains: search } },
        { Firstname: { contains: search } },
        { Lastname: { contains: search } },
      ],
    }),
  };

 // const total = await prisma.employee.count({ where });
 const total = await prisma.employee.count({
  where: {
    ...where,
    EmployeeStatus: {
      notIn: ["Resigned","Inactive","Terminate"],
    },
  },
});


  const sssTable = await prisma.sSS_Contributions.findMany({
    select: {
      start_range: true,
      end_range: true,
      employee_share: true,
      employer_share:true,
    },
    orderBy: {
      start_range: "asc",
    },
  });

  const phil = await prisma.payroll_Parameters.findFirst({ select: { SettingPercentage: true } });
  

  const data = await prisma.employee.findMany({
    where:{
      ...where, 
      EmployeeStatus:{
        notIn: ["Resigned","Inactive","Terminate"],
      },
    },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      EmpCode: true,
      Firstname: true,
      Lastname: true,
      Department: true,
      Position: true,
      EmploymentStatus: true,

      loan_details:{
         select:{
          loan_type:true,
          per_payroll_deduct:true,
          start_date:true,
          end_date:true,
         }
      },
      
      pagibig_list:{
        take:1,
        select:{
          pagibig_id:true,
          pagibig_employee_share:true,
          pagibig_employer_share:true,
        }
      },
      employeepayroll: {
          select: {
            basic_salary: true,
            cash_assistance: true,
            ecola: true
          }
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
    
    orderBy: {
      EmpCode: "asc",
    },
  });



  const normalized = data.map(emp => {

  const basicSalary = emp.employeepayroll?.basic_salary?.toNumber() ?? 0;
  const cashAssitance = emp.employeepayroll?.cash_assistance?.toNumber() ?? 0;
  const phil_percentage = phil?.SettingPercentage?.toNumber() ?? 0;
  const rawPagibigShare = emp.pagibig_list[0]?.pagibig_employee_share?.toNumber() ?? 0;
  const rawPagibigShareEmployer = emp.pagibig_list[0]?.pagibig_employer_share?.toNumber() ?? 0;
  const pagibigId = emp.pagibig_list[0]?.pagibig_id ?? 'N/A';

  const semiPay = computeSemiMonthlySalary(basicSalary);
  const sssContrib = computeSSSContribution(basicSalary, sssTable);
  const sssContribEmployer = computeSSSContributionEmployer(basicSalary, sssTable);
  const philhealthRate = computePhilRate(semiPay, phil_percentage);
  const pagibigShare = computePagibig(rawPagibigShare).toFixed(2);

  const loanMap = {
    FCH_LOAN: 0,
    SSS_LOAN: 0,
    PAGIBIG_LOAN: 0,
  };
  
  const currentMonth = toMonth(new Date());
  
  emp.loan_details.forEach(loan => {
    if (!loan.loan_type || !loan.per_payroll_deduct) return;
    if (!loan.start_date || !loan.end_date) return;
  
    const startMonth = toMonth(new Date(loan.start_date));
    const endMonth = toMonth(new Date(loan.end_date));
    const isActive = currentMonth >= startMonth && currentMonth <= endMonth;
  
    if (isActive) {
      loanMap[loan.loan_type as keyof typeof loanMap] = loan.per_payroll_deduct.toNumber();
    }
  });


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
  };
});

  return {
    data:normalized,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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
        const pagibig_id = await generateNextPagibigId(tx);

        await tx.pagIbig_List.create({
          data: {
            pagibig_id,
            EmpCodeId: empCode,
            ...pagibigData,
          },
        });
      }
    }
  });
}






export async function saveEmployeeLoan(data: loanProps) {
  const totalTerms = data.term_unit === "YEARS" ? data.term_value * 12 : data.term_value;

  if (totalTerms <= 0) {
    throw new Error("Invalid loan terms");
  }

  const perPayroll = Math.floor((data.principal / totalTerms / 2) * 100) / 100;
  const startDate = new Date(data.start_date);
  const endDate = addMonths(startDate, totalTerms - 1);

  const loan = await prisma.loan_details.create({
    data: {
      EmpCodeId: data.empCode,
      loan_type: data.loan_type,
      principal: data.principal,
      term_value: data.term_value,
      term_unit: data.term_unit,
      start_date: startDate,
      end_date: endDate,
      deduct_allowance: false,
      per_payroll_deduct: perPayroll,
      status: "Active",
    },
  });

  if (!loan?.loan_id) {
    throw new Error("Loan not persisted");
  }

  return loan;
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















export async function ComputePayroll({page,limit,search}: {page: number; limit: number; search?: string}) {
  const where: Prisma.EmployeeSummaryWhereInput = {
    ...(search && {
      OR: [
        { EmpCodeId: { contains: search } },
        { EmpCode: { Firstname: { contains: search },
        },
        },
        { EmpCode: { Lastname: { contains: search },
          },
        },
      ],
    }),
  };

  const [total, data] = await Promise.all([
    //prisma.employeeSummary.count({ where }),
  prisma.employeeSummary.count({
      where: {
        ...where,
        EmpCode:{
          EmployeeStatus: {
            notIn: ["Resigned","Inactive","Terminate"],
          },
        }
      },
    }),
    
    prisma.employeeSummary.findMany({
      where:{
        ...where, 
        EmpCode:{
          EmployeeStatus:{
            notIn: ["Resigned","Inactive","Terminate"],
          },
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      select:{
        PayCode:true,
        EmpCodeId:true,
        LateCount:true,
        TotalAbsentHours:true,
        RegularAtt:true,
        OvertimeAtt: true,
        NightShiftAtt: true,
        NightShiftOtAtt: true,
        EmpCode:{
          select:{
            Firstname:true,
            Lastname:true,
             employeepayroll: {
          select: {
              basic_salary: true,
              cash_assistance: true,
              ecola: true
          }
        }
          },
       
        }
      },
      orderBy: {
        EmpCodeId: "asc",
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
  


