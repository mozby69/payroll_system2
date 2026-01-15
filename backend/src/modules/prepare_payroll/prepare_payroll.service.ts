import { prisma } from "../../config/prismaClient";
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
      


      employeepayroll: {
        orderBy: {
          payroll_id: "desc",
        },
        take: 1,
        select: {
          basic_salary: true,
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
  const semi_pay = computeSemiMonthlySalary(basicSalary);

  return {
    ...emp,
    basic_salary: basicSalary,

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
