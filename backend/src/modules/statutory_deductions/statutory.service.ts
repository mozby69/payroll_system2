import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import {  StatutoryProps, WtaxListProps } from "./statutory.types";
import { fi } from "zod/v4/locales";
import { computePagibig, computePhilRateEmployee, computeSemiMonthlySalary, computeSSSContribution } from "../prepare_payroll/prepare_payroll.computation";
import { getBodPhilhealth, getSSSContributions, getTaxTable } from "../general/general.services";









//SSS
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











// PAGIBIG 
export async function displayPagibigContributions({page,limit,search}: StatutoryProps) {

    try{

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

        const finalWhere: Prisma.PagIbig_ListWhereInput = {
          AND: [
            searchFilter,
            statusOverride,
          ],
        };
        
          

           const employeeList = await prisma.pagIbig_List.findMany({
            where: finalWhere,
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

            const total = await prisma.pagIbig_List.count({ where: finalWhere });

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






// philhealth 

export async function displayPhilhealthContribution(){
  try{
    const data = await prisma.payroll_Parameters.findFirst();
    return data;
  }
  catch(error){
    console.error("error occured",error);
  }
}

export async function updatePhilhealth(id:number, SettingPercentage:string){
  return prisma.payroll_Parameters.update({
    where :{ id },
    data:{ SettingPercentage: new Prisma.Decimal(SettingPercentage)},
  });
}



export async function displayWTax(){
  try{
    const data = await prisma.tax_table.findMany();
    return data;
  }
  catch(error){
    console.error("error occured",error);
  }
}




export async function updateWTax(id:number,
  data:{
    start_range:number;
    end_range:number;
    annual_base_tax_bracket:number;
    rate_per_bracket:number;
    annual_base_tax_per_year:number;

  }){
  return prisma.tax_table.update({
      where:{ id: id },
      data:{
        start_range:data.start_range,
        end_range:data.end_range,
        annual_base_tax_bracket:data.annual_base_tax_bracket,
        rate_per_bracket:data.rate_per_bracket,
        annual_base_tax_per_year:data.annual_base_tax_per_year,
      }
  })
}






//wtax conmputation


export async function wtaxComputationList({page,limit,search}:WtaxListProps){
 try{
      const phil = await prisma.payroll_Parameters.findFirst({ select: { SettingPercentage: true } });
      const bodPhil = await getBodPhilhealth();
      const sssTable = await getSSSContributions();
      const tax_list = await getTaxTable();

      const searchFilter = search
      ? {
          OR: [
          { EmpCode: { contains: search } },
          { Firstname: { contains: search } },
          { Lastname: { contains: search } },
          ],
        }
      : {};
        
        const statusOverride = {
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

        const finalWhere: Prisma.EmployeeWhereInput = {
          AND: [
            {
              Taxable:true,
            },
            searchFilter,
            statusOverride,
          ],
        };
        
          

           const employeeList = await prisma.employee.findMany({
            where: finalWhere,
            skip: (page - 1) * limit,
            take: limit,
            select:{
              Firstname:true,
              Lastname:true,
              EmpCode:true,
              bod_member:true,
              employeepayroll:{
                select:{
                  basic_salary:true,
                }
              },
              pagibig_list:{
                select:{
                  pagibig_employee_share:true,
                }
              }
            }
           })

           const normalized = employeeList.map((emp) => {
            const firstname = emp.Firstname ?? '';
            const lastname = emp.Lastname ?? '';
            const name = `${lastname}, ${firstname}`;
            const basicSalary = Number(emp.employeepayroll?.basic_salary ?? 0);
            const semiMonthly =  computeSemiMonthlySalary(basicSalary);
            const phil_percentage = phil?.SettingPercentage?.toNumber() ?? 0;
            const rawPagibigEmployee = emp.pagibig_list[0]?.pagibig_employee_share?.toNumber() ?? 0;

            const bodMap = new Map(
              bodPhil.map((b) => [
                b.EmpCodeId.trim().toUpperCase(),
                b.employee_share?.toNumber() ?? 0,
              ])
            );
        
            const normalizedId = emp.EmpCode.trim().toUpperCase();
            const bodShare = bodMap.get(normalizedId) ?? 0;

            const isBod = emp.bod_member?.trim().toLowerCase() === "bod1";
            const philhealth = computePhilRateEmployee(semiMonthly,phil_percentage,isBod,bodShare);
            const sssContribEmployee = Number(computeSSSContribution(basicSalary, sssTable));
            const pagibigEmployeeShare = computePagibig(rawPagibigEmployee);

                return {
                    EmpCode: emp.EmpCode,   
                    Name: name,   
                    basic_salary:emp.employeepayroll?.basic_salary,
                    philhealth_emp:philhealth,
                    sss_emp:sssContribEmployee,
                    pagibig_emp:pagibigEmployeeShare,
                    tax:tax_list,
                };
            });

            const total = await prisma.employee.count({ where: finalWhere });

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