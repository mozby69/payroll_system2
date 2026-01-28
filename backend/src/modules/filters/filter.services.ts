import { map } from "zod";
import {prisma} from "../../config/prismaClient";



export const getFilterOptions = async () =>{
    const companies = await prisma.company_details.findMany({
        select:{
            CompanyCode: true,
            CompanyName: true,
        },
        orderBy:{
            CompanyName:"asc",
        }
    });

    const departments = await prisma.employee.findMany({
        select:{
            Department:true,
        },   
        distinct:["Department"],
        where:{
            Department:{not:null}
        },

    });

    const statuses = await prisma.employee.findMany({
        select:{
            EmploymentStatus:true
        },
        distinct:["EmploymentStatus"],
        where:{
            EmploymentStatus:{not:null},
        },
    });

    return{
        company: companies.map((c)=>({
            value: c.CompanyCode,
            label: c.CompanyName
        })),
        department: departments.map((d)=>({
            value: d.Department!,
            label: d.Department!
        })),
        status: statuses.map((e)=>({
            value: e.EmploymentStatus!,
            label: e.EmploymentStatus!
        })),
    }

};