import { prisma } from "../../config/prismaClient";
import { getBodPhilhealth, getSSSContributions } from "../general/general.services";
import { computePagibig, computePhilRateEmployee, computeSemiMonthlySalary, computeSSSContribution } from "../prepare_payroll/prepare_payroll.computation";
import { UpdateTypesByEmpCode } from "./emp.types";

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
  
  const sssTable = await getSSSContributions();

  // Phil health code ↓
  const bodPhil = await getBodPhilhealth();
  const phil = await prisma.payroll_Parameters.findFirst({ select: { SettingPercentage: true } });
  // Phil health code ↑

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
      isNewEmployee: true,
      bod_member:true,
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
          status:true,
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
      pagibig_list :{
        select:{
              pagibig_id:true,
              pagibig_employee_share:true,
              pagibig_employer_share:true,
            }
      }
    },
  });

  if (!employee) return null;

  const payroll = employee.employeepayroll ?? null;

  const basicSalary = Number(payroll?.basic_salary ?? 0);
  const cashAssistance = Number(payroll?.cash_assistance ?? 0);
  const ecola = Number(payroll?.ecola ?? 0);

  const totalSalary = basicSalary + cashAssistance + ecola;

  const isNewProbi = employee.EmploymentStatus === "Probationary" && employee?.isNewEmployee;

  // Phil health code ↓
  const semiMonthly =  computeSemiMonthlySalary(basicSalary);
  const phil_percentage = phil?.SettingPercentage?.toNumber() ?? 0;
  const isBod = employee.bod_member?.trim().toLowerCase() === "bod1";
  const bodMap = new Map(
      bodPhil.map((b) => [
        b.EmpCodeId.trim().toUpperCase(),
        b.employee_share?.toNumber() ?? 0,
      ])
    );
       
  const normalizedId = empCode.trim().toUpperCase();
  const bodShare = bodMap.get(normalizedId) ?? 0;
  // Phil health code ↑
  
  // Pag ibig code ↓
  const rawPagibigEmployee = employee.pagibig_list[0]?.pagibig_employee_share?.toNumber() ?? 0;
  // Pag ibig code ↑

  const sssContribEmployee = Number(computeSSSContribution(basicSalary, sssTable,isNewProbi));

  const philhealthRateEmployee = computePhilRateEmployee(semiMonthly, phil_percentage,isBod,bodShare,isNewProbi);

  const pagibigEmployeeShare = computePagibig(rawPagibigEmployee);

  console.log("this is the sss result", sssContribEmployee)

  return {
    ...employee,

    employeepayroll: payroll
      ? {
          BasicSalary: basicSalary,
          CashAssistance: cashAssistance,
          Ecola: ecola,
          TotalSalary: totalSalary,
          sssContribEmployee: sssContribEmployee,
          philhealthRateEmployee: philhealthRateEmployee,
          pagibigEmployeeShare: pagibigEmployeeShare,

          
        }
      : null,
  };
};


export const updateEmployeePayroll = async (empCode: string, payLoad:UpdateTypesByEmpCode) =>{
    return prisma.employee.update({
      where:{
        EmpCode:empCode
      },
      data:{
        employeepayroll:{
            update:{
              basic_salary:payLoad.basicSalary,
              cash_assistance:payLoad.cashAssistance,
              ecola:payLoad.ecola
          }
        
        },
      pagibig_list: {
        update: {
          where: {
            EmpCodeId: empCode
          },
          data: {
            pagibig_employee_share: payLoad.pagibigEmployeeShare
          }
        }
      }
      }

    });
};