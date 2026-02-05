import { prisma } from "../../config/prismaClient";

type EmployeeFilterParams = {
  search?: string;
  department?: string[];
  company?: string[];
  status?: string[];
};

const buildWhere = (filters: EmployeeFilterParams) => {
  const where: any = {};

  if (filters.search) {
    where.OR = [
      { EmpCode: { contains: filters.search } },
      { Firstname: { contains: filters.search } },
      { Lastname: { contains: filters.search } },
      { Department: { contains: filters.search } },
    ];
  }

  if (filters.department?.length) {
    where.Department = { in: filters.department };
  }

  if (filters.status?.length) {
    where.EmploymentStatus = { in: filters.status };
  }

  if (filters.company?.length) {
    where.BranchCode = {
      company_id: {
        in: filters.company,
      },
    };
  }


  return where;
};

export const getAllEmployees = async ({
  skip,
  take,
  search,
  department,
  company,
  status,
}: {
  skip: number;
  take: number;
  search?: string;
  department?: string[];
  company?: string[];
  status?: string[];
}) => {
  return prisma.employee.findMany({
    skip,
    take,
    where: buildWhere({ search, department, company, status }),
    orderBy: { EmpCode: "asc" },
    select: {
      EmpCode: true,
      Firstname: true,
      Middlename: true,
      Lastname: true,
      Department: true,
      EmploymentStatus: true,
      BranchCodeId: true,
    },
  });
};

export const countEmployees = async (filters: EmployeeFilterParams) => {
  return prisma.employee.count({
    where: buildWhere(filters),
  });
};

export const getEmployeeByEmpCode = async (empCode: string) => {
  const employee = await prisma.employee.findUnique({
    where: { EmpCode: empCode },
    select: {
      EmpCode: true,
      Firstname: true,
      Middlename: true,
      Lastname: true,
      Department: true,
      EmploymentStatus: true,
      Position: true,
      BranchCodeId: true,

      employeepr: {
        select: {
          EmpTin: true,
          EmpSSSNo: true,
          EmpPhilhlthNo: true,
          EmpPagibigNo: true,
          EmpChildrenName: true,
          EmpChildrenBirthday: true,
          EmpChildrenBplace: true,
        },
      },

      loan_details:{
        select:{
          loan_id:true,
          principal: true,
          loan_type: true,
          term_value: true,
          term_unit: true,
          start_date: true,
          deduct_allowance: true,
          per_payroll_deduct: true,

        }
      },

      employeepayroll: {
        select: {
          basic_salary: true,
          cash_assistance: true,
          ecola: true,
        },
      },

      BranchCode: {
        select: {
          branchCode: true,
          Company: true,
          Location: true,
          CompanyCode: {
            select: {
              CompanyCode: true,
              CompanyName: true,
            },
          },
        },
      },
    },
  });

  if (!employee) return null;

  const payroll = employee.employeepayroll ?? null;

  const basicSalary = Number(payroll?.basic_salary ?? 0);
  const cashAssistance = Number(payroll?.cash_assistance ?? 0);
  const ecola = Number(payroll?.ecola ?? 0);

  const totalSalary = basicSalary + cashAssistance + ecola;

  return {
    ...employee,

    employeepayroll: payroll
      ? {
          BasicSalary: basicSalary,
          CashAssistance: cashAssistance,
          Ecola: ecola,
          TotalSalary: totalSalary,
        }
      : null,
  };
};
