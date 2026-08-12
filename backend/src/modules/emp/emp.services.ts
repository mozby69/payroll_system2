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
      BranchCode: {
        select: {
          branchCode: true,
        }
      },
      employeepayroll:{
        select:{
          basic_salary:true,
        }
      }
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
      Disbursing:true,
      WithAtm:true,
      isOfficerAllowance:true,
      isSixDaysWork:true,
      Taxable:true,
      isDisabled:true,
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

      officersAllowance:{
        select:{
           basic_salary:true,
           EmpCodeId:true,
        }
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
          bank_account:true,
          with_ecola:true,
          gmail_account:true,
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

  const officersAllowance = employee.officersAllowance ?? null;
  const OaSalary = Number(officersAllowance?.basic_salary ?? 0);


  const basicSalary = Number(payroll?.basic_salary ?? 0);
  const bankAccount = String(payroll?.bank_account ?? 0);
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

  console.log('emp',empCode, semiMonthly);

  const pagibigEmployeeShare = computePagibig(rawPagibigEmployee);

  const totalEdeduction = sssContribEmployee + philhealthRateEmployee + pagibigEmployeeShare

  return {
    ...employee,

    employeepayroll: payroll
      ? {
          BasicSalary: basicSalary,
          CashAssistance: cashAssistance,
          Ecola: ecola,
          isecola: payroll?.with_ecola,
          gmail_account: payroll?.gmail_account,
          TotalSalary: totalSalary,
          bankAccount: bankAccount,
          sssContribEmployee: sssContribEmployee,
          philhealthRateEmployee: philhealthRateEmployee,
          pagibigEmployeeShare: pagibigEmployeeShare,
          totalEdeduction:totalEdeduction,
        }
      : null,

    officersAllowance: officersAllowance

        ?{
          OaBasicSalary : OaSalary
        }
        :null,
  };
};


export const updateEmployeePayroll = async (
  empCode: string,
  payLoad: UpdateTypesByEmpCode,
  changedBy: string
) => {
  try {
    return await prisma.$transaction(async (tx) => {
      console.log("ser ", payLoad.isDisabled)
    
      const existing = await tx.employee_payroll.findUnique({
        where: { EmpCodeId: empCode },
      });

      const historyRecords: any[] = [];

      if (existing && payLoad.remarks) {

  
        if (Number(existing.basic_salary) !== Number(payLoad.basicSalary)) {
          historyRecords.push({
            EmpCodeId: empCode,
            old_salary: existing.basic_salary,
            new_salary: payLoad.basicSalary,
            remarks: payLoad.remarks,
            salary_type: "Basic",
            changed_by: changedBy,
            createdAt: new Date(),
          });
        }


        if (Number(existing.cash_assistance) !== Number(payLoad.cashAssistance)) {
          historyRecords.push({
            EmpCodeId: empCode,
            old_salary: existing.cash_assistance,
            new_salary: payLoad.cashAssistance,
            remarks: payLoad.remarks,
            salary_type: "Allowance",
            changed_by: changedBy,
            createdAt: new Date(),
          });
        }

      
        if (Number(existing.ecola) !== Number(payLoad.ecola)) {
          historyRecords.push({
            EmpCodeId: empCode,
            old_salary: existing.ecola,
            new_salary: payLoad.ecola,
            remarks: payLoad.remarks,
            salary_type: "Ecola",
            changed_by: changedBy,
            createdAt: new Date(),
          });
        }

        if (historyRecords.length > 0) {
          await tx.employeeSalaryHistory.createMany({
            data: historyRecords,
          });
        }
      }

      const result = await tx.employee.update({
        where: { EmpCode: empCode },
        data: {
          WithAtm: payLoad.WithAtm,
          Disbursing: payLoad.Disbursing,
          Taxable: payLoad.Taxable,
          isOfficerAllowance: payLoad.isOfficerAllowance,
          isSixDaysWork: payLoad.isSixDaysWork,
          isDisabled: payLoad.isDisabled,
          employeepayroll: {
            upsert: {
              update: {
                basic_salary: payLoad.basicSalary,
                cash_assistance: payLoad.cashAssistance,
                ecola: payLoad.ecola,
                bank_account: payLoad.bankAccount,
                with_ecola: payLoad.isecola,
                gmail_account: payLoad.gmail_account,
              },
              create: {
                basic_salary: payLoad.basicSalary,
                cash_assistance: payLoad.cashAssistance,
                ecola: payLoad.ecola,
                bank_account: payLoad.bankAccount,
                with_ecola: payLoad.isecola,
                gmail_account: payLoad.gmail_account,
              },
            },
          },
          officersAllowance:{
            upsert:{
                update: {
                  basic_salary: payLoad.OaBasicSalary,
                },
                create: {
                  basic_salary: payLoad.OaBasicSalary,
                }
              }
          },

          pagibig_list: {
            updateMany: {
              where: { EmpCodeId: empCode },
              data: {
                pagibig_employee_share: payLoad.pagibigEmployeeShare,
              },
            },
          },
        },
        include: {
          employeepayroll: true,
          pagibig_list: true,
        },
      });

      return result;
    });

  } catch (error) {
    console.error("Failed to update employee payroll:", error);
    throw error;
  }
};



export const getEmployeesByCompanyGrouped = async (companyCode: string) => {
  const employees = await prisma.employee.findMany({
    where: {
      BranchCode: {
        company_id: companyCode,
      },
    },
    select: {
      EmpCode: true,
      Firstname: true,
      Middlename: true,
      Lastname: true,
      BranchCode: {
        select: {
          branchCode: true,
        },
      },
      employeepayroll: {
        select: {
          basic_salary: true,
        },
      },
    },
    orderBy: [
      { BranchCode: { branchCode: "asc" } },
      { Lastname: "asc" },
    ],
  });

  return employees;
};


export const bulkIncreaseSalary = async (
  empCodes: string[],
  amount: number,
  reason: string,
  changedBy: string
) => {
  return prisma.$transaction(async (tx) => {
    const payrolls = await tx.employee_payroll.findMany({
      where: {
        EmpCodeId: { in: empCodes },
      },
    });

    if (!payrolls.length) {
      throw new Error("No payroll records found.");
    }

    const historyRecords: any[] = [];

    for (const payroll of payrolls) {
      const oldSalary = Number(payroll.basic_salary);
      const newSalary = oldSalary + amount;

      if (oldSalary !== newSalary) {
        historyRecords.push({
          EmpCodeId: payroll.EmpCodeId,
          old_salary: oldSalary,
          new_salary: newSalary,
          remarks: reason,
          salary_type: "Basic",
          changed_by: changedBy,
          createdAt: new Date(),
        });
      }

      await tx.employee_payroll.update({
        where: { EmpCodeId: payroll.EmpCodeId },
        data: { basic_salary: newSalary },
      });
    }

    if (historyRecords.length > 0) {
      await tx.employeeSalaryHistory.createMany({
        data: historyRecords,
      });
    }

    return { success: true };
  });
};






//xyryl

export async function DisplayGmailAccountList() {
  try {
    const validEmployees = await prisma.employee.findMany({
      select: {
        EmpCode: true,
      },
    });

    const validEmpCodes = validEmployees.map(
      (employee) => employee.EmpCode
    );

    const data = await prisma.employee_payroll.findMany({
      where: {
        EmpCodeId: {
          in: validEmpCodes,
        },
      },

      select: {
        EmpCodeId: true,
        gmail_account: true,

        EmpCode: {
          select: {
            Firstname: true,
            Lastname: true,
          },
        },
      },

      orderBy: {
        EmpCode:{
          Lastname: 'asc',
        }
      },
    });

    return data.map((employee) => {
      const firstname = employee.EmpCode.Firstname?.trim() ?? "";

      const lastname =
        employee.EmpCode.Lastname?.trim() ?? "";

      return {
        emp_code: employee.EmpCodeId,
        name: `${lastname}, ${firstname}`,
        gmail_account:
          employee.gmail_account?.trim() ?? null,
      };
    });
  } catch (error) {
    console.error(
      "Error occurred in DisplayGmailAccountList:",
      error
    );

    throw error;
  }
}