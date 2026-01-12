import { prisma } from "../../config/prismaClient";
import { computeAbsent, computeGrossPay, computeLate, computeOvertime, computePagibig, computePhilRate, computeSemiMonthlySalary, computeSSSContribution } from "./prepare_payroll.computation";
import { PaginationParams } from "./prepare_payroll.types";

export const savePayrollToArchive = async ({page,limit,search,payCode}: PaginationParams) => {
  try {
    const skip = (page - 1) * limit;

    const normalizedSearch =
      search && search.trim().length >= 2
        ? search.trim()
        : undefined;

        const where = {
          ...(normalizedSearch && {
            OR: [
              { PayCode: { contains: normalizedSearch } },
              { EmpCodeId: { contains: normalizedSearch } },
            ],
          }),
          ...(payCode && {
            PayCode: payCode,
          }),
        };

    const [rows, total,philRate,sSS_Contributions] = await prisma.$transaction([
      prisma.employeeSummary.findMany({
        skip,
        take: limit,
        where,
        orderBy: [
          { PayCode: "asc" },
          { EmpCodeId: "asc" },
        ],
        select: {
          PayCode: true,
          TotalHoursWorked: true,
          LateCount: true,
          TotalAbsentHours: true,
          EmpCodeId:true,
          RegularAtt:true,
          OvertimeAtt: true,
          NightShiftAtt: true,
          NightShiftOtAtt: true,
          EmpCode:{
            select:{
              employeepayroll:{
                orderBy:{payroll_id:"desc"},
                take:1,
                select:{
                  basic_salary:true,
                }
              },
              pagibig_list:{
                  select:{
                      pagibig_employee_share:true,
                  },
              },
            },
          },
        },
      }),
      prisma.employeeSummary.count({ where }),

      prisma.payroll_Parameters.findFirst({
        select:{
            SettingPercentage:true,
        },
      }),

      prisma.sSS_Contributions.findMany({
        select: {
          start_range: true,
          end_range: true,
          employee_share: true,
        },
        orderBy: { start_range: "asc" },
      }),
      
    ]);


    const data = rows.map(row => {
      const salaryDecimal = row.EmpCode.employeepayroll[0]?.basic_salary;
      const empPagibigContrib = row.EmpCode.pagibig_list[0]?.pagibig_employee_share;
      const settingPercentage = philRate?.SettingPercentage ? Number(philRate.SettingPercentage) : 0;

      const basicSalary = salaryDecimal ? salaryDecimal.toNumber() : 0;
      const final_empPagibigContrib = empPagibigContrib ? empPagibigContrib.toNumber() : 0;
      
      const totalAbsent = row.TotalAbsentHours ? Number(row.TotalAbsentHours) : 0;
      const totalLateCount = row.LateCount ? Number(row.LateCount): 0;
      const semiMonthlyRate = computeSemiMonthlySalary(basicSalary);
      const overTime = computeOvertime(basicSalary, {
        regular: row.RegularAtt,
        overtime: row.OvertimeAtt,
        nightShift: row.NightShiftAtt,
        nightShiftOt: row.NightShiftOtAtt,
      });
      const lateCount = computeLate(totalLateCount,basicSalary);
      const absent = computeAbsent(totalAbsent,basicSalary);
      
      return {
        ...row,
        semi_monthly_rate:semiMonthlyRate ,
        absence:absent,
        late_count:lateCount,
        overtime: overTime,
        gross_pay:computeGrossPay(overTime,semiMonthlyRate,lateCount,absent),
        emp_pagibig_contrib:computePagibig(row.PayCode,final_empPagibigContrib),
        philhealth_rate:computePhilRate(semiMonthlyRate,settingPercentage,row.PayCode),
        sss_contribution:computeSSSContribution(basicSalary,sSS_Contributions,row.PayCode),
      };
    });
    
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("error archiving", error);
    throw error;
  }
};


