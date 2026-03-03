import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { ConversionProps } from "./conversion.types";
import { computeDailyRate } from "../prepare_payroll/prepare_payroll.computation";






export default async function getAttendanceCount({page,limit,search}: ConversionProps) {
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
    
            const finalWhere: Prisma.AttendanceCountWhereInput = {
              AND: [
                searchFilter,
                statusOverride,
              ],
            };


          const data = await prisma.attendanceCount.findMany({
            where:finalWhere,
            skip: (page - 1) * limit,
            take: limit,
            select: {
              ID: true,
              Vacation: true,
              Sick: true,
              EmpCodeId:true,
              leave_convert:true,
              EmpCode:{
                select:{
                  Lastname:true,
                  Firstname:true,
                  employeepayroll:{
                    select:{
                      basic_salary:true,
                    }
                  }
                }
                
              }
            
              
            },
            orderBy:{
              EmpCodeId:"asc",
            },
          });


          
          const formattedData = data.map(item => {
          
            const basic = item.EmpCode.employeepayroll?.basic_salary?.toNumber() ?? 0;
            const leave_convert = item.leave_convert;
            const dailyRate = computeDailyRate(basic);
            var total_amount = 0;

        
          if (leave_convert === true) {
            const sick_amount = dailyRate * (item.Sick?.toNumber() ?? 0);
            const leave_amount = dailyRate * (item.Vacation?.toNumber() ?? 0);
            total_amount = sick_amount + leave_amount;
          } else {
            total_amount = dailyRate * (item.Sick?.toNumber() ?? 0);
          }



            return {
              id: item.ID,
              vacation: item.Vacation,
              sick: item.Sick,
              firstname:item.EmpCode.Firstname,
              lastname:item.EmpCode.Lastname,
              EmpCode:item.EmpCodeId,
              total:total_amount.toFixed(2),
              leave_convert:item.leave_convert,
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




export async function updateVacationLeave(
  ID: number,
  data: { leave_convert: boolean; Vacation: number }
) {
  return prisma.attendanceCount.update({
    where: { ID },
    data: {
      leave_convert: data.leave_convert,
      Vacation: data.Vacation, 
    },
  });
}