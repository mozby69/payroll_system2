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
            const data = computeDailyRate(basic);
            const amount = data * item.Sick?.toNumber();

            return {
              id: item.ID,
              vacation: item.Vacation,
              sick: item.Sick,
              firstname:item.EmpCode.Firstname,
              lastname:item.EmpCode.Lastname,
              EmpCode:item.EmpCodeId,
              total:amount.toFixed(2),
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