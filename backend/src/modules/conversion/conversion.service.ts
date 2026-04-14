import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { ConversionProps, conversionReport } from "./conversion.types";
import { computeDailyRate } from "../prepare_payroll/prepare_payroll.computation";
import { employeeProbationary } from "../payroll_archive/payroll_archive.service";
import { computeTenure } from "./conversion.helper";






export default async function getAttendanceCount({ page, limit, search,company_id }: ConversionProps) {
  try {

    const searchFilter = search
      ? {
        OR: [
          { EmpCodeId: { contains: search } },
          { EmpCode: { Firstname: { contains: search } } },
          { EmpCode: { Lastname: { contains: search } } },
        ],
      }
      : {};

   const statusOverride: Prisma.AttendanceCountWhereInput = {
  OR: [
    {
      EmpCode: {
        is: {
          EmployeeStatus: {
            notIn: ["Resigned", "Inactive", "Terminate"],
          },
          BranchCode: {
            company_id: company_id,
          },
        },
      },
    },
    {
      EmpCode: {
        is: {
          bod_member: {
            in: ["bod1", "bod2"],
          },
        },
      },
    },
  ],
};

    const finalWhere: Prisma.AttendanceCountWhereInput = {
      AND: [
        searchFilter,
        statusOverride,
      ],
    };


    const data = await prisma.attendanceCount.findMany({
      where: finalWhere,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        ID: true,
        Vacation: true,
        Sick: true,
        EmpCodeId: true,
        leave_convert: true,
        EmpCode: {
          select: {
            Lastname: true,
            Firstname: true,
            EmployeeStatus:true,
            BranchCode:true,
            employeepayroll: {
              select: {
                basic_salary: true,
              }
            }
          }

        }


      },
      orderBy: {
        EmpCodeId: "asc",
      },
    });



    const formattedData = data.map(item => {

      const basic = item.EmpCode.employeepayroll?.basic_salary?.toNumber() ?? 0;
      const leave_convert = item.leave_convert;
      const dailyRate = computeDailyRate(basic);
      var total_amount = 0;


      // if (leave_convert === true) {
      //   const sick_amount = dailyRate * (item.Sick?.toNumber() ?? 0);
      //   const leave_amount = dailyRate * (item.Vacation?.toNumber() ?? 0);
      //   total_amount = sick_amount + leave_amount;
      // } else {
      //   total_amount = dailyRate * (item.Sick?.toNumber() ?? 0);
      // }

      if(leave_convert != 0){
        const sick_amount = dailyRate * (item.Sick?.toNumber() ?? 0);
         const leave_for_convert = dailyRate * (item.leave_convert ?? 0);
         total_amount = sick_amount + leave_for_convert;
      }
      else{
        total_amount = dailyRate * (item.Sick?.toNumber() ?? 0);
      }



      return {
        id: item.ID,
        vacation: item.Vacation,
        sick: item.Sick,
        firstname: item.EmpCode.Firstname,
        lastname: item.EmpCode.Lastname,
        EmpCode: item.EmpCodeId,
        total: total_amount.toFixed(2),
        leave_convert: item.leave_convert,
      };

    });

    const total = await prisma.attendanceCount.count({ where: finalWhere });

    return {
      data: formattedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

  } catch (error) {
    console.error("Error occurred", error);
    throw error;
  }
}




export async function updateVacationLeave(ID: number, data: { leave_convert: number; Vacation: number }) {
  return prisma.attendanceCount.update({
    where: { ID },
    data: {
     leave_convert: data.leave_convert,
      Vacation: data.Vacation,
    },
  });
}



export async function conversionReport({ company_id }:conversionReport) {
  try {

      const statusOverride = {
        OR: [
          {
              EmpCode: {
          is: {
            EmployeeStatus: {
              notIn: ["Resigned", "Inactive", "Terminate"],
            },
            BranchCode: {
              company_id: company_id,
            },
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


    const finalWhere: Prisma.AttendanceCountWhereInput = {
      AND: [statusOverride]
    };


    const data = await prisma.attendanceCount.findMany({
      where: finalWhere,
      select: {
        EmpCodeId: true,
        Sick: true,
        Vacation: true,
        EmpCode: {
          select: {
            EmployementDate: true,
            Firstname: true,
            Lastname: true,
            employeepayroll: {
              select: {
                basic_salary: true,
              }
            },
            attendance_count:{
              select:{
                leave_convert:true,
              }
            }
          }
        }
      }
    })


    const normalized = data.map((emp) => {
      const referenceDate = new Date("2026-04-14");
      const fullName = `${emp.EmpCode.Lastname} ${emp.EmpCode.Firstname}`;
      const basic = emp.EmpCode.employeepayroll?.basic_salary?.toNumber() ?? 0;
      const dailyRate = computeDailyRate(basic);
      const employmentDate = emp.EmpCode.EmployementDate;
      const tenure = employmentDate ? computeTenure(new Date(employmentDate), referenceDate): 0;
      const leaveForConvert = emp.EmpCode?.attendance_count?.leave_convert ?? 0;
      const sickLeave = emp.Sick?.toNumber?.() ?? Number(emp.Sick) ?? 0;
      const totalLeavForConversion = (leaveForConvert + sickLeave);
      const leaveAmountForConversion = (totalLeavForConversion * dailyRate).toFixed(2);

      return {
        Sick: emp.Sick,
        Vacation: emp.Sick,
        EmployementDate: emp.EmpCode.EmployementDate,
        basic_salary: emp.EmpCode.employeepayroll?.basic_salary,
        fullname: fullName,
        daily_rate: dailyRate,
        tenure: tenure,
        leave_convert: emp.EmpCode?.attendance_count?.leave_convert,
        total_leave_for_conversion:totalLeavForConversion,
        leave_amount_for_conversion:leaveAmountForConversion,
      }
    });

    return normalized;
  }


  catch (error) {
    console.error("server error occured", error);
  }
}