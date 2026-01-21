import { prisma } from "../../config/prismaClient";

export const getAllEmployees = async ({
  skip,
  take,
}: {
  skip: number;
  take: number;
}) => {
  const employees = await prisma.employee.findMany({
    skip,
    take,
    select: {
      EmpCode: true,
      Firstname: true,
      Middlename: true,
      Lastname: true,
      Department: true,
      EmploymentStatus: true,
      BranchCodeId: true,
    },
    orderBy: { EmpCode: "asc" },
  });

  return employees.map((emp) => ({
    EmpCode: emp.EmpCode,
    Firstname: emp.Firstname,
    Middlename: emp.Middlename,
    Lastname: emp.Lastname,
    Department: emp.Department,
    EmploymentStatus: emp.EmploymentStatus,
    BranchCode: emp.BranchCodeId, 
  }));
};

export const countEmployees = async () => {
  return prisma.employee.count();
};
