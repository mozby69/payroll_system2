import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { ConversionProps, conversionReport, displayConversionProps } from "./conversion.types";
import { computeDailyRate } from "../prepare_payroll/prepare_payroll.computation";
import { computeCustomTenure, computeTenure, getJune30 } from "./conversion.helper";






export default async function getAttendanceCount({ page, limit, search, company_id }: ConversionProps) {
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
              isAlien: false,
            },
          },
        },
        {
          EmpCode: {
            isAlien: true,
            secondaryBranch: {
              company_id: company_id,
            }
          },
        },
        (company_id === "EMB") ?
          {
            EmpCode: {
              bod_member: {
                in: ["bod1", "bod2"],
              },

              BranchCode: {
                company_id: "EMB",
              },
            },
          } : {}
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
            EmployeeStatus: true,
            BranchCode: true,
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

      if (leave_convert != 0) {
        const sick_amount = dailyRate * (item.Sick?.toNumber() ?? 0);
        const leave_for_convert = dailyRate * (item.leave_convert ?? 0);
        total_amount = sick_amount + leave_for_convert;
      }
      else {
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



export async function conversionReport({ company_id }: conversionReport) {
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
              isAlien: false,
            },
          },
        },
        (company_id === "EMB") ?
          {
            EmpCode: {
              bod_member: {
                in: ["bod1", "bod2"],
              },
              BranchCode: {
                company_id: "EMB",
              },
            },
          } : {},

        {
          EmpCode: {
            isAlien: true,
            secondaryBranch: {
              company_id: company_id,
            }
          },
        }
      ],
    };


    const finalWhere: Prisma.AttendanceCountWhereInput = {
      AND: [statusOverride]
    };

    const as_of_date = await prisma.conversionAsOfDate.findFirst({
      select: {
        as_of_date: true,
      },
      orderBy: {
        created_at: 'asc'
      }
    });


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
            isSixDaysWork:true,
            BranchCode: {
              select: {
                company_id: true,
              }
            },
            employeepayroll: {
              select: {
                basic_salary: true,
              }
            },
            attendance_count: {
              select: {
                leave_convert: true,
              }
            }
          },

        }
      },
      orderBy: {
        EmpCode: {
          Lastname: 'asc'
        }
      }
    })


    const referenceDate = as_of_date?.as_of_date ? new Date(as_of_date.as_of_date) : new Date();
    //const referenceDate = new Date("2026-04-14");
    const june30 = getJune30(referenceDate);

    const normalized = data.map((emp) => {
      const fullName = `${emp.EmpCode.Lastname} ${emp.EmpCode.Firstname}`;
      const basic = emp.EmpCode.employeepayroll?.basic_salary?.toNumber() ?? 0;
      const isSixDaysWork = emp.EmpCode.isSixDaysWork;
      const dailyRate = computeDailyRate(basic,isSixDaysWork);
      const employmentDate = emp.EmpCode.EmployementDate;
      const tenure = employmentDate ? computeTenure(new Date(employmentDate), referenceDate) : 0;
      const leaveForConvert = emp.EmpCode?.attendance_count?.leave_convert ?? 0;
      let sickLeave = emp.Sick?.toNumber?.() ?? Number(emp.Sick) ?? 0;
      let vacationLeave = emp.Vacation?.toNumber?.() ?? Number(emp.Vacation) ?? 0;

      const baseTenure = employmentDate ? computeCustomTenure(new Date(employmentDate), referenceDate) : 0;


      const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

      const shouldAddLeave = (() => {
        if (!employmentDate) return false;

        const anniversaryThisYear = new Date(
          referenceDate.getFullYear(),
          employmentDate.getMonth(),
          employmentDate.getDate()
        );

        const ref = normalizeDate(referenceDate);
        const anniv = normalizeDate(anniversaryThisYear);
        const june = normalizeDate(june30);

        return (
          anniv >= ref &&
          anniv <= june &&
          baseTenure < 3
        );
      })();

      if (shouldAddLeave) {
        sickLeave += 5;
        vacationLeave += 5;
      }



      const totalLeavForConversion = (leaveForConvert + sickLeave);
      const leaveAmountForConversion = (totalLeavForConversion * dailyRate);


      return {
        Sick: emp.Sick,
        Vacation: emp.Vacation,
        EmployementDate: emp.EmpCode.EmployementDate,
        basic_salary: emp.EmpCode.employeepayroll?.basic_salary,
        fullname: fullName,
        daily_rate: dailyRate,
        tenure: tenure,
        leave_convert: emp.EmpCode?.attendance_count?.leave_convert,
        total_leave_for_conversion: totalLeavForConversion,
        leave_amount_for_conversion: leaveAmountForConversion,
        as_of_date: as_of_date,
        EmpCode: emp.EmpCodeId,
        company_id: company_id,
      }
    });

    return normalized;
  }


  catch (error) {
    console.error("server error occured", error);
  }
}










export async function saveConversionArchive({ company_id }: conversionReport) {
  const currentYear = new Date().getFullYear();

  const existing = await prisma.conversionArchive.findFirst({
    where: {
      company_id: company_id,
      as_of_date: {
        gte: new Date(currentYear, 0, 1),
        lte: new Date(currentYear, 11, 31),
      },
    },
  });

  if (existing) {
    throw new Error("Conversion_Exists");
  }

  const reportData = await conversionReport({ company_id });

  if (!reportData || reportData.length === 0) {
    throw new Error("No data to archive");
  }

  return await prisma.$transaction(async (tx) => {

    const total_amount = reportData.reduce((sum, item) => {
      return sum + Number(item.leave_amount_for_conversion ?? 0);
    }, 0);

    const header = await tx.totalConversionArchive.create({
      data: {
        company_id: company_id,
        total_amount: new Prisma.Decimal(total_amount),
      },
    });


    const archiveData = reportData.map((item) => ({
      Sick: Number(item.Sick ?? 0),
      Vacation: Number(item.Vacation ?? 0),
      EmployementDate: item.EmployementDate ? new Date(item.EmployementDate) : new Date(),
      basic_salary: item.basic_salary ?? new Prisma.Decimal(0),
      daily_rate: new Prisma.Decimal(item.daily_rate ?? 0),
      tenure: item.tenure,
      leave_convert: Number(item.leave_convert ?? 0),
      company_id: item.company_id,
      total_leave_for_conversion: item.total_leave_for_conversion,
      leave_amount_for_conversion: new Prisma.Decimal(item.leave_amount_for_conversion ?? 0),
      as_of_date: item.as_of_date?.as_of_date ? new Date(item.as_of_date.as_of_date): new Date(),
      EmpCodeId: item.EmpCode,
      totalConversionArchiveId: header.id,
    }));


    await tx.conversionArchive.createMany({
      data: archiveData,
      skipDuplicates: true,
    });

    return {
      count: archiveData.length,
      headerId: header.id,
    };
  });
}



export async function DisplayConversionArchive({ page, limit, search, company_id }: displayConversionProps) {
  try {

    const searchFilter: Prisma.totalConversionArchiveWhereInput = search
      ? {
        OR: [
          {
            company_id: {
              contains: search,
            },
          },
          ...(isNaN(Number(search))
            ? []
            : [
              {
                created_at: {
                  gte: new Date(Number(search), 0, 1),
                  lte: new Date(Number(search), 11, 31),
                },
              },
            ]),
        ],
      }
      : {};



    const baseFilter = {
      company_id: company_id,

    }

    const finalWhere: Prisma.totalConversionArchiveWhereInput = {
      AND: [
        searchFilter,
        baseFilter,
      ],
    };

    const data = await prisma.totalConversionArchive.findMany({
      where: finalWhere,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        created_at: true,
        total_amount: true,
      },
    });

    const formatted = data.map((item) => ({
      id: item.id,
      created_at: item.created_at
        ? new Date(item.created_at).getFullYear()
        : null,
      total_amount: item.total_amount,
    }));

    const total = await prisma.totalConversionArchive.count({ where: finalWhere });

    return {
      data: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }

  }
  catch (error) {
    console.error(`error occured ${error}`)
  }
}




export async function getConversionArchive(id: number) {
  try {
    return prisma.conversionArchive.findMany({
      where: {
        totalConversionArchiveId: id,
        
      },
      select: {
        EmpCodeId: true,
        Sick: true,
        Vacation: true,
        basic_salary: true,
        daily_rate: true,
        tenure: true,
        leave_amount_for_conversion: true,
        EmployementDate:true,
        leave_convert:true,
        total_leave_for_conversion:true,
        as_of_date:true,
        totalConversionArchive:{
          select:{
            created_at:true,
          }
        },
        EmpCode: {
          select: {
            Firstname: true,
            Lastname: true,
          }
        }
      },
      orderBy: {
        EmpCode: {
          Lastname: 'asc',
        }
      }
    }

    );
  }
  catch (error) {
    console.error(`Server Error occured ${error}`)
  }
}

