import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { EmployeeSummaryTypes } from "../api/api.types";
import { nowPH } from "../../utils/timezone";
import { parsePayCodeRange } from "../../utils/payrollDate";


export async function getCompanyDetailsServices() {
    return prisma.company_details.findMany({
        orderBy: {
            CompanyCode: "asc"
        }
    })
} 



export async function getSSSContributions() {
    return prisma.sSS_Contributions.findMany({
      select: {
        start_range: true,
        end_range: true,
        employee_share: true,
        employer_share: true,
      },
      orderBy: {
        start_range: "asc",
      },
    });
  }
  

export async function getTaxTable () {
    return prisma.tax_table.findMany({
        select:{
          start_range:true,
          end_range:true,
          annual_base_tax_bracket:true,
          rate_per_bracket:true,
          annual_base_tax_per_year:true,
        }
    });
}


export async function getBodPhilhealth(){
    return prisma.bodPhilhealtContrib.findMany({
        select:{
            EmpCodeId: true,
            employee_share: true,
        }
    })
}



export async function getOfficerAllowance() {
    return prisma.officersAllowance.findMany({
      select: {
        basic_salary: true,
        EmpCode: true,
        EmpCodeId:true,
      },
    });
  }


export async function appendMissingBodEmployees(
  tx: Prisma.TransactionClient,
  employees: EmployeeSummaryTypes[]
) {
  if (!employees.length) return [];

  const template = employees[0];

  const bodEmployees = await tx.employee.findMany({
    where: {
      bod_member: { in: ["bod1", "bod2"] },
      BranchCode: {
        CompanyCode: {
          CompanyCycle: template.CycleCategory,
        },
      },
    },
    select: { EmpCode: true },
  });
  
    const existingIds = new Set(employees.map((e) => e.EmpCode_id.trim()));
  
    const missingBods = bodEmployees.filter(
      (b) => !existingIds.has(b.EmpCode.trim())
    );
  
   
  
    return missingBods.map((b) => ({
      EmpCodeId: b.EmpCode,
      PayCode: template.PayCode,
      CycleCategory: template.CycleCategory,
      PayrollPeriod: template.PayrollPeriod,
      LateCount: 0,
      TotalAbsentHours: 0,
      TotalUndertime: 0,
      TotalOvertime: 0,
      RegularAtt: {},
      OvertimeAtt: {},
      NightShiftAtt: {},
      NightShiftOtAtt: {},
      selected_payroll_date: template.selected_payroll_date,
      createdAt: nowPH(),
    }));
  }


  export async function probitionaryEmployees(
    tx: Prisma.TransactionClient,
    employees: EmployeeSummaryTypes[]
  ) {
    if (!employees.length) return [];
  
    const template = employees[0];
  
    //  1. Get date range
    const { start, end } = parsePayCodeRange(template.PayCode);
    const startISO = start.toISOString(); // full ISO
    const endISO = end.toISOString();
    //  2. Get probationary employees within range
    const probiEmployees = await tx.employee.findMany({
      where: {
        BranchCode: {
          CompanyCode: {
            CompanyCycle: template.CycleCategory,
          },
        },
        EmploymentStatus: "Probationary",
        EmployementDate: {
          gte: startISO,
          lte: endISO,
        },
      },
      select: {
        EmpCode: true,
      },
    });

    if (!probiEmployees.length) return [];
  
    const empCodes = probiEmployees.map(e => e.EmpCode);
  
    // 3. Get already existing archive records
    const existing = await tx.employeePayrollArchive.findMany({
      where: {
        EmpCodeId: { in: empCodes },
        PayCode: template.PayCode,
      },
      select: {
        EmpCodeId: true,
      },
    });

    


  
    const existingSet = new Set(existing.map(e => e.EmpCodeId));
  
    //  4. Filter missing employees
    const missing = probiEmployees.filter(
      e => !existingSet.has(e.EmpCode)
    );

  
    //5. Create payload
    return missing.map((e) => ({
      EmpCodeId: e.EmpCode,
      PayCode: template.PayCode,
      CycleCategory: template.CycleCategory,
      PayrollPeriod: template.PayrollPeriod,
      LateCount: 0,
      TotalAbsentHours: 0,
      TotalUndertime: 0,
      TotalOvertime: 0,
      RegularAtt: {},
      OvertimeAtt: {},
      NightShiftAtt: {},
      NightShiftOtAtt: {},
      selected_payroll_date: template.selected_payroll_date,
      createdAt: nowPH(),
    }));
  }


  export async function specialLeaveEmployeesServices(
    tx: Prisma.TransactionClient,
    employees: EmployeeSummaryTypes[]
  ) {
    if (!employees.length) return [];
  
    const template = employees[0];
  
    //  1. Get date range
    const { start, end } = parsePayCodeRange(template.PayCode);
    const startISO = start.toISOString(); // full ISO
    const endISO = end.toISOString();
    //  2. Get probationary employees within range
    const specialEmployees = await tx.employee.findMany({
      where: {
        BranchCode: {
          CompanyCode: {
            CompanyCycle: template.CycleCategory,
          },
        },
        specialLeaves: {
          some: {
            OR: [
              // Normal leave (Active, etc.)
              {
                status: { not: "Expected" },
                end:   { not: null, gte: startISO, lte: endISO }
              },
    
              // Expected leave
              {
                status: "Expected",
                expectedEnd:    { not: null, gte: startISO, lte: endISO }
              }
            ]
          }
        }
      },
      select: {
        EmpCode: true,
      },
    });
  

    if (!specialEmployees.length) return [];
  
    const empCodes = specialEmployees.map(e => e.EmpCode);
  
    // 3. Get already existing archive records
    const existing = await tx.employeeSummary.findMany({
      where: {
        EmpCodeId: { in: empCodes },
        PayCode: template.PayCode,
      },
      select: {
        EmpCodeId: true,
      },
    });


  
    const existingSet = new Set(existing.map(e => e.EmpCodeId));
  
    //  4. Filter missing employees
    const missing = specialEmployees.filter(
      e => !existingSet.has(e.EmpCode)
    );

  
    
  
    //5. Create payload
    return missing.map((e) => ({
      EmpCodeId: e.EmpCode,
      PayCode: template.PayCode,
      CycleCategory: template.CycleCategory,
      PayrollPeriod: template.PayrollPeriod,
      LateCount: 0,
      TotalAbsentHours: 0,
      TotalUndertime: 0,
      TotalOvertime: 0,
      RegularAtt: {},
      OvertimeAtt: {},
      NightShiftAtt: {},
      NightShiftOtAtt: {},
      selected_payroll_date: template.selected_payroll_date,
      createdAt: nowPH(),
    }));
  }
    
  


//filter branch

export async function getBranch() {
  const branches = await prisma.branch.findMany({
    select: {
      branchCode: true,
      Location: true,
    },
    orderBy: {
      branchCode: "asc",
    },
  });

  return branches;
}



// FILTER COMPANY FOR SPREADSHEET

export async function getCompaniesByCycle(cycle: string) {
  const companies = await prisma.company_details.findMany({
    where: {
      CompanyCycle: cycle, 
    },
    select: {
      CompanyCode: true,
      CompanyName: true,
      CompanyCycle: true,
    },
    orderBy: { CompanyCode: "asc" },
  });

  return companies;
}


export async function fetchCompanyCycles() {
  const cycles = await prisma.company_details.findMany({
    select: { CompanyCycle: true },
    distinct: ["CompanyCycle"],
    orderBy: { CompanyCycle: "asc" }
  });

  return cycles;
}


// FILTER COMPANY BY COMPANY CODE

export async function getCompaniesByCode(CompanyCode: string) {
  const companies = await prisma.company_details.findMany({
    where: {
      CompanyCode: CompanyCode, 
    },
    select: {
      CompanyCode: true,
      CompanyName: true,
      CompanyCycle: true,
    },
    orderBy: { CompanyCode: "asc" },
  });

  return companies;
}

export const getAllCompanies = async () => {
  return prisma.company_details.findMany({
    select: {
      CompanyCode: true,
      CompanyName: true,
    },
    orderBy: { CompanyName: "asc" },
  });
};


export const getUniqueLoan = async () => {
  const loans = await prisma.loan_details.findMany({
    select: {
      loan_type: true
    },
    distinct: ["loan_type"],
    orderBy: {
      loan_type: "asc"
    }
  });

  return loans.map(l => l.loan_type);
};



export const getBranchesDetailsService = async () => {
  return prisma.branch.findMany({
    include:{
      group: true
    },
    orderBy: [
      { company_id: "asc" },
      { position: "asc" }
    ]
  });
};


export const reorderBranchesService = async (
  companyId: string,
  branchCodes: string[]
) => {

  if (!companyId) {
    throw new Error("company_id is required")
  }

  if (!Array.isArray(branchCodes)) {
    throw new Error("branchCodes must be an array")
  }

  const updates: Prisma.PrismaPromise<any>[] = []

  branchCodes.forEach((code, index) => {

    updates.push(
      prisma.branch.update({
        where: { branchCode: code },
        data: {
          position: index + 1
        }
      })
    )

  })

  if (updates.length > 0) {
    await prisma.$transaction(updates)
  }

  return true
}


// CREATE GROUP
export const createGroupService = async (name: string) => {
  // prevent duplicate
  const existing = await prisma.branchGroup.findUnique({
    where: { name },
  });

  if (existing) {
    throw new Error("Group already exists");
  }

  return await prisma.branchGroup.create({
    data: { name },
  });
};

// GET ALL GROUPS + BRANCHES
export const getGroupsService = async () => {
  const groups = await prisma.branchGroup.findMany({
    include: {
      branches: {
        orderBy: { position: "asc" },
      },
    },
    orderBy: { name: "desc" },
  });

  const ungrouped = await prisma.branch.findMany({
    where: { groupId: null },
    orderBy: { position: "asc" },
  });

  return { groups, ungrouped };
};

// DELETE GROUP
export const deleteGroupService = async (id: number) => {
  // unassign branches first
  await prisma.branch.updateMany({
    where: { groupId: id },
    data: { groupId: null },
  });

  return await prisma.branchGroup.delete({
    where: { id },
  });
};

// ASSIGN BRANCH TO GROUP
export const assignBranchService = async (
  branchCode: string,
  groupId: number | null
) => {
  return await prisma.branch.update({
    where: { branchCode },
    data: {
      groupId,
    },
  });
};