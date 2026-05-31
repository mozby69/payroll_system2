import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { generatePayCode } from "./manual_payroll.helper";
import { CreateManualPayrollPayload, ManualPayrollProps } from "./manual_payroll.types";




export async function DisplayManualPayroll({ page, limit, search }: ManualPayrollProps) {
  try {


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

    const finalWhere: Prisma.ManualEmployeeSummaryWhereInput = {
      AND: [
        searchFilter,
        statusOverride,
      ],
    };



    const data = await prisma.manualEmployeeSummary.findMany({
      where: finalWhere,
      skip: (page - 1) * limit,
      take: limit,
      select:{
        PayCode:true,
        CycleCategory:true,
        PayrollPeriod:true,
        EmpCodeId:true,
        selected_payroll_date:true,
        EmpCode:{
          select:{
            Firstname:true,
            Lastname:true,
            BranchCodeId:true,
          }
        }
      },
      orderBy:{
        EmpCode:{
          Lastname:"desc",
        }
      }
    },
  )

    const normalized = data.map((emp) => {
      return {
          paycode: emp.PayCode,
          cycle: emp.CycleCategory, 
          payroll_period: emp.PayrollPeriod, 
          selected_payroll_date: emp.selected_payroll_date,
          EmpCodeId: emp.EmpCodeId,
          Name: `${emp.EmpCode.Lastname}, ${emp.EmpCode.Firstname}`,
          branch: emp.EmpCode.BranchCodeId,
      }
     });

    const total = await prisma.manualEmployeeSummary.count({ where: finalWhere });

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
  catch (error) {
    console.error(`Server error occured ${error}`)
  }
}


export async function ExistingPaycode() {
  try {

    const data = await prisma.employeeSummary.findMany({
      distinct: ["PayCode"],
      select: {
        PayCode: true,
        createdAt: true,
        selected_payroll_date: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    return data;

  } catch (error) {
    console.error(`Service Error - ${error}`);
    throw error;
  }
}






export async function createPayrollService({
  selectedMonth,
  selectedRange,
  cycleCategory,
  payrollPeriod,
  fromDate,
  toDate,
  companyCode,
}: CreateManualPayrollPayload) {


  const payCode = generatePayCode(
    selectedMonth,
    selectedRange
  );

  const employees = await prisma.employee.findMany({
    where: {
      BranchCode: {
        company_id: companyCode,
      },

      EmployeeStatus: {
        notIn: [
          "Resigned",
          "Inactive",
          "Terminate",
        ],
      },
    },
    select: {
      EmpCode: true,
    },
  });


  await prisma.$transaction(
    employees.map((employee) =>
      prisma.manualEmployeeSummary.upsert({
        where: {
          PayCode_EmpCodeId_PayrollPeriod: {
            PayCode: payCode,
            EmpCodeId: employee.EmpCode,
            PayrollPeriod: payrollPeriod,
          },
        },

        update: {
          updatedAt: new Date(),
        },

        create: {
          PayCode: payCode,
          CycleCategory: cycleCategory,
          PayrollPeriod: payrollPeriod,

          LateCount: 0,
          TotalAbsentHours: 0,
          TotalUndertime: 0,
          TotalOvertime: 0,

          RegularAtt: {},
          OvertimeAtt: {},
          NightShiftAtt: {},
          NightShiftOtAtt: {},

          createdAt: new Date(),
          updatedAt: new Date(),

          selected_payroll_date: {
            start_date: fromDate,
            end_date: toDate,
          },

          EmpCodeId: employee.EmpCode,
        },
      })
    )
  );

  return {
    success: true,
    payCode,
    totalEmployees: employees.length,
  };
}