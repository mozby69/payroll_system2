// modules/import/import.service.ts
import axios from "axios";
import { prisma } from "../../config/prismaClient";
import { BranchDTO, DjangoExportResponse, EmployeeDetailsDTO, EmployeeDTO } from "./import.types";

const DJANGO_BASE_URL = process.env.DJANGO_BASE_URL;
const DJANGO_EXPORT_API_KEY = process.env.DJANGO_EXPORT_API_KEY;



export const fetchFromDjango = async (): Promise<DjangoExportResponse> => {
  const { data } = await axios.get<DjangoExportResponse>(
    `${DJANGO_BASE_URL}/api/export/emp/`,
    {
      headers: {
        "X-PAYROLL-TOKEN": DJANGO_EXPORT_API_KEY,
      },
    }
  );

  return data;
};

  

export const saveBranches = async (branches: BranchDTO[]): Promise<number> => {
  if (!Array.isArray(branches)) {
    throw new Error("saveBranches received invalid data");
  }

  await prisma.$transaction(
    branches.map((b) =>
      prisma.branch.upsert({
        where: { branchCode: b.BranchCode },
        create: {
          branchCode: b.BranchCode,
          Company: b.Company,
          Location: b.Location,
          Employees: b.Employees,
        },
        update: {
          Company: b.Company,
          Location: b.Location,
          Employees: b.Employees,
        },
      })
    )
  );

  return branches.length;
};


const toDateOrNull = (value?: string | null): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};




  export const saveEmployees = async (employees: EmployeeDTO[]): Promise<number> => {

    const validEmployees = employees.filter(
      (e) => e.BranchCode__BranchCode !== null
    );
  
    await prisma.$transaction(
      validEmployees.map((e) =>
        prisma.employee.upsert({
          where: { EmpCode: e.EmpCode },
          create: {
            EmpCode: e.EmpCode,
            Firstname: e.Firstname,
            Middlename: e.Middlename,
            BranchCodeId: e.BranchCode__BranchCode!,
            Lastname:e.Lastname,
            DateofBirth: toDateOrNull(e.DateofBirth),
            EmployementDate: toDateOrNull(e.EmployementDate),
            EmploymentStatus:e.EmploymentStatus,
            EmployeeStatus:e.EmployeeStatus,
          },
          update: {
            Firstname: e.Firstname,
            Middlename: e.Middlename,
            BranchCodeId: e.BranchCode__BranchCode!,
            Lastname:e.Lastname,
            DateofBirth:toDateOrNull(e.DateofBirth),
            EmployementDate:toDateOrNull(e.EmployementDate),
            EmploymentStatus:e.EmploymentStatus,
            EmployeeStatus:e.EmployeeStatus,
          },
        })
      )
    );
  
    return validEmployees.length;
  };
  
  

  export const saveEmployeeDetails = async (details: EmployeeDetailsDTO[]): Promise<number> => {
    if (!Array.isArray(details) || details.length === 0) return 0;
  
    await prisma.$transaction(
      details.map((d) =>
        prisma.empDetails.upsert({
          where: {
            EmpCodeId: d.EmpCode__EmpCode,
          },
          create: {
            EmpCodeId: d.EmpCode__EmpCode,
  
            EmpTin: d.EmpTin,
            EmpSSSNo: d.EmpSSSNo,
            EmpPhilhlthNo: d.EmpPhilhlthNo,
            EmpPagibigNo: d.EmpPagibigNo,
  
            EmpChildrenName:
              d.EmpCode__familybgrnd__empchildren__EmpChildrenName,
            EmpChildrenBirthday:
              d.EmpCode__familybgrnd__empchildren__EmpChildrenBirthday
                ? new Date(
                    d.EmpCode__familybgrnd__empchildren__EmpChildrenBirthday
                  )
                : null,
            EmpChildrenBplace:
              d.EmpCode__familybgrnd__empchildren__EmpChildrenBplace,
          },
          update: {
            EmpTin: d.EmpTin,
            EmpSSSNo: d.EmpSSSNo,
            EmpPhilhlthNo: d.EmpPhilhlthNo,
            EmpPagibigNo: d.EmpPagibigNo,
  
            EmpChildrenName:
              d.EmpCode__familybgrnd__empchildren__EmpChildrenName,
            EmpChildrenBirthday:
              d.EmpCode__familybgrnd__empchildren__EmpChildrenBirthday
                ? new Date(
                    d.EmpCode__familybgrnd__empchildren__EmpChildrenBirthday
                  )
                : null,
            EmpChildrenBplace:
              d.EmpCode__familybgrnd__empchildren__EmpChildrenBplace,
          },
        })
      )
    );
  
    return details.length;
  };

  

  
  export const importBranchesService = async () => {
    const { branches, employees,employees_details  } = await fetchFromDjango();
  
    if (!Array.isArray(branches)) {
      throw new Error("Branches payload is invalid");
    }
  
    await saveBranches(branches);
    const employeeCount = await saveEmployees(employees);
    const detailsCount = await saveEmployeeDetails(employees_details);
  
    return {
      branches: branches.length,
      employees: employeeCount,
      employeeDetails: detailsCount,
    };
  };
  