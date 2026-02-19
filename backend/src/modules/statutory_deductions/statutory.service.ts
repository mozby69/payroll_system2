import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import {  StatutoryProps } from "./statutory.types";
import { fi } from "zod/v4/locales";










export async function displaySSSContributions({page,limit,search}: StatutoryProps) {

    try{

        const numericSearch = Number(search);

        const employeeWhere: Prisma.SSS_ContributionsWhereInput = {
        ...(search &&
            !isNaN(numericSearch) && {
            OR: [
                { start_range: numericSearch },
                { end_range: numericSearch },
            ],
            }),
        };

           const employeeList = await prisma.sSS_Contributions.findMany({
            where: employeeWhere,
            skip: (page - 1) * limit,
            take: limit,
            select:{
                sss_contrib_id:true,
                start_range:true,
                end_range:true,
                employee_share:true,
                employer_share:true,
            }
           })

           const normalized = employeeList.map((emp) => {
      
                return {
                    sss_contrib_id:emp.sss_contrib_id,
                    start_range: emp.start_range,
                    end_range: emp.end_range,
                    employee_share: emp.employee_share,
                    employer_share: emp.employer_share,      
                };
            });

            const total = await prisma.sSS_Contributions.count({ where: employeeWhere });

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

    catch(error){
        console.error("error occured",error);
    }

}




export async function updateSSSContribution(id:number,
    data:{
        start_range:number;
        end_range:number;
        employee_share:number;
        employer_share:number;
    }){
    return prisma.sSS_Contributions.update({
        where:{ sss_contrib_id: id },
        data:{
            start_range:data.start_range,
            end_range:data.end_range,
            employee_share: data.employee_share,
            employer_share: data.employer_share,
        }
    })
}




export async function updatePagibigContribution(id:number,
    data:{
        pagibig_employee_share:number;
        pagibig_employer_share:number;

    }){
    return prisma.pagIbig_List.update({
        where:{ pagibig_id: id },
        data:{
            pagibig_employee_share:data.pagibig_employee_share,
            pagibig_employer_share:data.pagibig_employer_share,
        }
    })
}









export async function displayPagibigContributions({page,limit,search}: StatutoryProps) {

    try{

        const searchParts = search?.trim().split(" ") || [];

        const employeeWhere: Prisma.PagIbig_ListWhereInput = {
          ...(search && {
            OR: [
              {
                EmpCodeId: {
                  contains: search,
                },
              },
              {
                EmpCode: {
                  Firstname: {
                    contains: search,
                  },
                },
              },
              {
                EmpCode: {
                  Lastname: {
                    contains: search,
                  },
                },
              },
              ...(searchParts.length >= 2
                ? [
                    {
                      AND: [
                        {
                          EmpCode: {
                            Firstname: {
                              contains: searchParts[0],
                            },
                          },
                        },
                        {
                          EmpCode: {
                            Lastname: {
                              contains: searchParts[1],
                            },
                          },
                        },
                      ],
                    },
                  ]
                : []),
            ],
          }),
        };
        
          

           const employeeList = await prisma.pagIbig_List.findMany({
            where: employeeWhere,
            skip: (page - 1) * limit,
            take: limit,
            select:{
                pagibig_id:true,
                pagibig_employee_share:true,
                pagibig_employer_share:true,
                EmpCodeId:true,
                EmpCode:{
                    select:{
                        Firstname:true,
                        Lastname:true,

                    }
                }
            }
           })

           const normalized = employeeList.map((emp) => {
            const firstname = emp.EmpCode.Firstname ?? '';
            const lastname = emp.EmpCode.Lastname ?? '';
            const name = firstname + ' ' + lastname;
      
                return {
                    pagibig_id:emp.pagibig_id,
                    pagibig_employee_share:emp.pagibig_employee_share,
                    pagibig_employer_share: emp.pagibig_employer_share,
                    EmpCodeId: emp.EmpCodeId,   
                    Name: name,   
                };
            });

            const total = await prisma.pagIbig_List.count({ where: employeeWhere });

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

    catch(error){
        console.error("error occured",error);
    }

}

