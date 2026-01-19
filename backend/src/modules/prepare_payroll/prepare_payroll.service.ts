import { prisma } from "../../config/prismaClient";
import { generateNextPagibigId } from "../../helper/prepare_payroll_helper";
import { computeAbsent, computeGrossPay, computeLate, computeOvertime, computePagibig, computePhilRate, computeSemiMonthlySalary, computeSSSContribution } from "./prepare_payroll.computation";
import { FetchEmployeesByCycleParams, PaginationParams } from "./prepare_payroll.types";

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

  const total = await prisma.employee.count({ where });

  const sssTable = await prisma.sSS_Contributions.findMany({
    select: {
      start_range: true,
      end_range: true,
      employee_share: true,
    },
    orderBy: {
      start_range: "asc",
    },
  });

  const phil = await prisma.payroll_Parameters.findFirst({ select: { SettingPercentage: true } });
  

  const data = await prisma.employee.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    select: {
      EmpCode: true,
      Firstname: true,
      Lastname: true,
      Department: true,
      Position: true,
      EmploymentStatus: true,
      
      pagibig_list:{
        take:1,
        select:{
          pagibig_id:true,
          pagibig_employee_share:true,
        }
      },
      employeepayroll: {
        orderBy: {
          payroll_id: "desc",
        },
        take: 1,
        select: {
          basic_salary: true,
          cash_assistance:true,
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
    orderBy: {
      EmpCode: "asc",
    },
  });



const normalized = data.map(emp => {

  const basicSalary = emp.employeepayroll[0]?.basic_salary?.toNumber() ?? 0;
  const cashAssitance = emp.employeepayroll[0]?.cash_assistance?.toNumber() ?? 0;
  const phil_percentage = phil?.SettingPercentage?.toNumber() ?? 0;
  const rawPagibigShare = emp.pagibig_list[0]?.pagibig_employee_share?.toNumber() ?? 0;
  const rawPagibigShareEmployer = emp.pagibig_list[0]?.pagibig_employee_share?.toNumber() ?? 0;
  const pagibigId = emp.pagibig_list[0]?.pagibig_id ?? 'N/A';

  const semiPay = computeSemiMonthlySalary(basicSalary);
  const sssContrib = computeSSSContribution(basicSalary, sssTable);
  const philhealthRate = computePhilRate(semiPay, phil_percentage);
  const pagibigShare = computePagibig(rawPagibigShare).toFixed(2);

  return {
    ...emp,
    basic_salary: basicSalary,
    sss_contrib:sssContrib,
    phil_rate:philhealthRate,
    pagibig_share:pagibigShare,
    pagibig_employee_share: rawPagibigShare,
    pagibig_employer_share:rawPagibigShareEmployer,
    pagibig_id:pagibigId,
    cash_assistance:cashAssitance,
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








export async function saveEmployeePayroll({
  empCode,
  basic_salary,
  cash_assistance,
  pagibig_employee_share,
  pagibig_employer_share,
}: {
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
