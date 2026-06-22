// modules/import/import.service.ts
import axios from "axios";
import { prisma } from "../../config/prismaClient";
import { attendance_countDTO, BranchDTO, CompanyDTO, DjangoExportResponse, DjangoExportResponse2, EmployeeDetailsDTO, EmployeeDTO, SpecialleavesDTO } from "./import.types";
import { Prisma } from "@prisma/client";
import { mapLeaveName, mapLeaveStatus } from "./import.helper";
import { nowPH } from "../../utils/timezone";


const DJANGO_BASE_URL_LOCAL = process.env.HR_API_BASE_URL_LOCAL;
const DJANGO_BASE_URL = process.env.DJANGO_BASE_URL;
const DJANGO_EXPORT_API_KEY = process.env.DJANGO_EXPORT_API_KEY;



export const fetchFromDjango = async (): Promise<DjangoExportResponse> => {
    const localMode = await prisma.localMode.findFirst({
        orderBy: {
          created_at: "desc",
        },
      });

    const baseUrl = localMode?.local_mode ? DJANGO_BASE_URL_LOCAL: DJANGO_BASE_URL;

    const { data } = await axios.get<DjangoExportResponse>(
      `${baseUrl}/api/export/emp/`,
      {
        headers: {
          "X-PAYROLL-TOKEN": DJANGO_EXPORT_API_KEY,
        },
      }
    );

  return data;
};

export const saveCompany = async (company: CompanyDTO[]): Promise<number> => {
  if (!Array.isArray(company)) {
    throw new Error("saveBranches received invalid data");
  }

  await prisma.$transaction(
    company.map((b) =>
      prisma.company_details.upsert({
        where: { CompanyCode: b.CompanyCode },
        create: {
          CompanyCode: b.CompanyCode,
          CompanyCycle: b.CompanyCycle,
          CompanyName: b.CompanyName,
        },
        update: {
          CompanyCycle: b.CompanyCycle,
          CompanyName: b.CompanyName,
        },
      })
    )
  );

  return company.length;
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
          company_id: b.company__CompanyCode ?? null,
          
        },
        update: {
          Company: b.Company,
          Location: b.Location,
          Employees: b.Employees,
          company_id: b.company__CompanyCode ?? null,
        },
      })
    )
  );

   // assign positions for new branches
   await assignBranchPositions();

  return branches.length;
};

export const assignBranchPositions = async () => {

  const branches = await prisma.branch.findMany({
    orderBy: [
      { company_id: "asc" },
      { position: "asc" }
    ]
  });

  const grouped: Record<string, typeof branches> = {};

  for (const branch of branches) {
    const key = branch.company_id ?? "UNKNOWN";

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(branch);
  }

  const updates: Prisma.PrismaPromise<any>[] = [];

  for (const companyId in grouped) {

    const companyBranches = grouped[companyId];

    const maxPosition = Math.max(
      ...companyBranches.map(b => b.position || 0)
    );

    let nextPosition = maxPosition + 1;

    companyBranches
      .filter(b => b.position === 0)
      .forEach(branch => {

        updates.push(
          prisma.branch.update({
            where: { branchCode: branch.branchCode },
            data: { position: nextPosition++ }
          })
        );

      });
  }

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }
};


const toDateOrNull = (value?: string | null): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};




export const saveEmployees = async (employees: EmployeeDTO[]): Promise<number> => {
  const validEmployees = employees.filter(e => e.BranchCode__BranchCode !== null);

  const chunkSize = 50; // process 50 employees at a time
  for (let i = 0; i < validEmployees.length; i += chunkSize) {
    const chunk = validEmployees.slice(i, i + chunkSize);

    await Promise.all(
      chunk.map(async (e) => {
        const empCode = e.EmpCode.trim();
 
        await prisma.employee.upsert({
          where: { EmpCode: empCode },
          create: {
            EmpCode: empCode,
            Firstname: e.Firstname,
            Middlename: e.Middlename,
            BranchCodeId: e.BranchCode__BranchCode!,
            Lastname: e.Lastname,
            DateofBirth: toDateOrNull(e.DateofBirth),
            EmployementDate: toDateOrNull(e.EmployementDate),
            EmploymentStatus: e.EmploymentStatus,
            EmployeeStatus: e.EmployeeStatus,
            isNewEmployee: true,
            Position:e.Position,
            Department: e.Department,
            secondaryBranchId: e.SecondaryBranch && e.SecondaryBranch !== "N/A"? e.SecondaryBranch : null,
            isAlien:e.isAlien,
            EndDate:toDateOrNull(e.EndDate),
            CivilStatus: e.CivilStatus,
          },
          update: {
            Firstname: e.Firstname,
            Middlename: e.Middlename,
            BranchCodeId: e.BranchCode__BranchCode!,
            Lastname: e.Lastname,
            DateofBirth: toDateOrNull(e.DateofBirth),
            EmployementDate: toDateOrNull(e.EmployementDate),
            EmploymentStatus: e.EmploymentStatus,
            EmployeeStatus: e.EmployeeStatus,
            Position: e.Position,
            Department: e.Department,
            secondaryBranchId: e.SecondaryBranch && e.SecondaryBranch !== "N/A"? e.SecondaryBranch : null,
            isAlien:e.isAlien,
            EndDate:toDateOrNull(e.EndDate),
            CivilStatus: e.CivilStatus,
          },
        });

      
        await prisma.employee_payroll.upsert({
          where: { EmpCodeId: empCode },
          create: {
            EmpCodeId: empCode,
            basic_salary: new Prisma.Decimal(0),
            cash_assistance: new Prisma.Decimal(0),
          },
          update: {},
        });


        await prisma.pagIbig_List.upsert({
          where: { EmpCodeId: empCode },
          create: {
            EmpCodeId: empCode,
            pagibig_employee_share: new Prisma.Decimal(0),
            pagibig_employer_share: 200,
          },
          update: {},
        });
      })
    );
  }

  return validEmployees.length;
};
  






  // export const saveEmployeeDetails = async (details: EmployeeDetailsDTO[]): Promise<number> => {
  //   if (!Array.isArray(details) || details.length === 0) return 0;
  
  //   await prisma.$transaction(
  //     details.map((d) =>
  //       prisma.empDetails.upsert({
  //         where: {
  //           EmpCodeId: d.EmpCode__EmpCode,
  //         },
  //         create: {
  //           EmpCodeId: d.EmpCode__EmpCode,
  
  //           EmpTin: d.EmpTin,
  //           EmpSSSNo: d.EmpSSSNo,
  //           EmpPhilhlthNo: d.EmpPhilhlthNo,
  //           EmpPagibigNo: d.EmpPagibigNo,
  
  //           EmpChildrenName:
  //             d.EmpCode__familybgrnd__empchildren__EmpChildrenName,
  //           EmpChildrenBirthday:
  //             d.EmpCode__familybgrnd__empchildren__EmpChildrenBirthday
  //               ? new Date(
  //                   d.EmpCode__familybgrnd__empchildren__EmpChildrenBirthday
  //                 )
  //               : null,
  //           EmpChildrenBplace:
  //             d.EmpCode__familybgrnd__empchildren__EmpChildrenBplace,
  //         },
  //         update: {
  //           EmpTin: d.EmpTin,
  //           EmpSSSNo: d.EmpSSSNo,
  //           EmpPhilhlthNo: d.EmpPhilhlthNo,
  //           EmpPagibigNo: d.EmpPagibigNo,
  
  //           EmpChildrenName:
  //             d.EmpCode__familybgrnd__empchildren__EmpChildrenName,
  //           EmpChildrenBirthday:
  //             d.EmpCode__familybgrnd__empchildren__EmpChildrenBirthday
  //               ? new Date(
  //                   d.EmpCode__familybgrnd__empchildren__EmpChildrenBirthday
  //                 )
  //               : null,
  //           EmpChildrenBplace:
  //             d.EmpCode__familybgrnd__empchildren__EmpChildrenBplace,
  //         },
  //       })
  //     )
  //   );
  
  //   return details.length;
  // };

  


export const saveSpecialLeaves = async (
    details: SpecialleavesDTO[]
  ): Promise<number> => {
    if (!Array.isArray(details) || details.length === 0) return 0;
  
    await prisma.$transaction(
      details.map((d) =>
        prisma.specialLeaves.upsert({
          where: {
            id: d.id
          },
          create: {
            id: d.id,
            empCodeId: d.EmpCode__EmpCode,
            leaveName: mapLeaveName(d.leaveName),
            start: d.start ? new Date(d.start) : null,
            end: d.end ? new Date(d.end) : null,
            expectedStart: d.expectedStart ? new Date(d.expectedStart) : null,
            expectedEnd: d.expectedEnd ? new Date(d.expectedEnd) : null,
            status: mapLeaveStatus(d.status),
            created_at: new Date()
          },
          update: {
            leaveName: mapLeaveName(d.leaveName),
            start: d.start ? new Date(d.start) : null,
            end: d.end ? new Date(d.end) : null,
            expectedStart: d.expectedStart ? new Date(d.expectedStart) : null,
            expectedEnd: d.expectedEnd ? new Date(d.expectedEnd) : null,
            status: mapLeaveStatus(d.status)
          }
        })
      )
    );
  
    return details.length;
  };


  
  export const importBranchesService = async () => {
    const { branches, employees,employees_details,company_details,special_leaves } = await fetchFromDjango();
  
    if (!Array.isArray(branches)) {
      throw new Error("Branches payload is invalid");
    }
  
    await saveCompany(company_details);
    await saveBranches(branches);
    const employeeCount = await saveEmployees(employees);
   // const detailsCount = await saveEmployeeDetails(employees_details);
    const specialleaves = await saveSpecialLeaves(special_leaves);
  
    return {
      branches: branches.length,
      employees: employeeCount,
     // employeeDetails: detailsCount,
      companyDetails: company_details.length,
      special_leaves:specialleaves,
    };
  };
  
















 //insert attendance count



  export const fetchAttendanceCountFromDjango = async (): Promise<DjangoExportResponse2> => {
    const { data } = await axios.get<DjangoExportResponse2>(
      `${DJANGO_BASE_URL}/api/export/attendance-count/`,
      {
        headers: {
          "X-PAYROLL-TOKEN": DJANGO_EXPORT_API_KEY,
        },
      }
    );
  
    return data;
  };


  export const saveAttendanceCount = async (records: attendance_countDTO[],company_id:string): Promise<number> => {
    if (!Array.isArray(records)) {
      throw new Error("Invalid new table payload");
    }

     const employees = await prisma.employee.findMany({
        where: {
          BranchCode: {
            company_id,
          },
        },
        select: {
          EmpCode: true,
        },
      });

  const employeeCodes = new Set(
    employees.map((e) => e.EmpCode)
  );

  const filteredRecords = records.filter((record) =>
    employeeCodes.has(record.EmpCode__EmpCode)
  );

  
    await prisma.$transaction(
      filteredRecords.map((r) =>
        prisma.attendanceCount.upsert({
          where: { ID: r.ID },
          create: {
            ID: r.ID,
            Vacation: new Prisma.Decimal(r.Vacation),
            Sick: new Prisma.Decimal(r.Sick),
            EmpCodeId: r.EmpCode__EmpCode, 
          },
          update: {
            Vacation: new Prisma.Decimal(r.Vacation),
            Sick: new Prisma.Decimal(r.Sick),
          },
        })
      )
    );
  
    return filteredRecords.length;
  };


  // export const importAttendanceCountService = async () => {
  //   const { attendance_count } = await fetchAttendanceCountFromDjango();
  
  //   if (!Array.isArray(attendance_count)) {
  //     throw new Error("attendance_count payload is invalid");
  //   }
  
  //   const count = await saveAttendanceCount(attendance_count);
  
  //   return {
  //     attendanceCount: count,
  //   };
  // };


export const importAttendanceCountService = async (company_id:string) => {

  const { attendance_count } = await fetchAttendanceCountFromDjango();

  if (!Array.isArray(attendance_count)) {
    throw new Error("attendance_count payload is invalid");
  }


  const count = await saveAttendanceCount(attendance_count,company_id);




  await prisma.conversionAsOfDate.create({
    data: {
      as_of_date: nowPH(),
      company_id:company_id,
    },
  });

  return {
    attendanceCount: count,
  };
};