import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { addMonths, toMonth } from "../../helper/prepare_payroll_helper";
import { computeAbsent, computeGrossPay, computeLate, computeOvertime, computePagibig, computePhilRateEmployee, computeSemiMonthlySalary, computeSSSContribution, computeSSSContributionEmployer } from "./prepare_payroll.computation";
import { convertPayrollLabelToPeriod, getCurrentPayrollLabel, PAYROLL_CYCLE_MAP, PayrollDeductions, UpdateDeductionPayload } from "./prepare_payroll.types";
import { getBodPhilhealth, getSSSContributions } from "../general/general.services";
import { nowPH } from "../../utils/timezone";
import { displayCompletePayroll } from "../payroll_archive/payroll_archive.service";

export async function fetchEmployeesByPayrollCycle({company_id, page,limit,search,onlyNew,onlyMissingSetup}: 
  { company_id:string; page: number; limit: number; search?: string;  onlyNew?: boolean;  onlyMissingSetup?: boolean;}) {


    // Special Leave Condition 
    const summary = await prisma.employeeSummary.findFirst({
      where: {
        EmpCode:{
          BranchCode:{
             company_id
          }
        }
      },
      select: { selected_payroll_date: true },
      orderBy:{
        PayCode: "desc"
      }
    });

    const payrollDate = summary?.selected_payroll_date as PayrollDate | null;

    const cutoffStart = new Date(payrollDate?.start_date as string);
    const cutoffEnd = new Date(payrollDate?.end_date as string);
    
 // END Special Leave Condition 



    const baseFilter = {
      BranchCode: {
        company_id: company_id
      },
       isAlien: false ,
        ...(onlyNew && { isNewEmployee: true }), 
        ...(onlyMissingSetup && {
          Disbursing: true,
          isNewEmployee:false
        }),
      
      };

  const searchFilter = search
    ? {
        OR: [
          { EmpCode: { contains: search } },
          { Firstname: { contains: search } },
          { Lastname: { contains: search } },
        ],
      }
    : {};


  const statusFilter = {
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

  const where = {
    OR: [
      {
        AND: [
          baseFilter,
          searchFilter,
          statusFilter,
        ],
      },

      {
        AND: [
          { 
            isAlien: true 
          },
            {
            secondaryBranch:{
             company_id: company_id,
            }
          },
          searchFilter,
          statusFilter,
        ],
      },

          // Special Leave Condition 
      {
        AND: [
          {
              EmployeeStatus: "Inactive",
          },
          {
              specialLeaves: {
                some: {
                  OR: [
                    // 🔹 Case 1: use start/end
                    {
                      AND: [
                        { start: { not: null } },
                        { end: { not: null } },
                        { start: { lte: cutoffEnd } },
                        { end: { gte: cutoffStart } },
                      ],
                    },
      
                    // 🔹 Case 2: fallback to expectedStart/expectedEnd
                    {
                      AND: [
                        { expectedStart: { not: null } },
                        { expectedEnd: { not: null } },
                        { expectedStart: { lte: cutoffEnd } },
                        { expectedEnd: { gte: cutoffStart } },
                      ],
                    },
                  ],
                },
              },
          },
        ],
      }

          //END Special Leave Condition 

    ]
  
  };



  const total = await prisma.employee.count({ where });
  const bodPhil = await getBodPhilhealth();
  const sssTable = await getSSSContributions();
  const phil = await prisma.payroll_Parameters.findFirst({select: { SettingPercentage: true },});

  const zeroSalaryCount = await prisma.employee.count({
    where: {
      ...where,
      employeepayroll: {
        basic_salary: 0,
      },
    },
  });
  

  const data = await prisma.employee.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { EmpCode: "desc" },
    select: {
      EmpCode: true,
      Firstname: true,
      Lastname: true,
      Department: true,
      Position: true,
      EmploymentStatus: true,
      isNewEmployee: true,
      bod_member:true,
      Taxable:true,
      Disbursing:true,
      WithAtm:true,
      isSixDaysWork:true,
      loan_details: {
        select: {
          loan_type: true,
          per_payroll_deduct: true,
          start_date: true,
        },
      },
      pagibig_list: {
        take: 1,
        select: {
          pagibig_id: true,
          pagibig_employee_share: true,
          pagibig_employer_share: true,
        },
      },
      employeepayroll: {
        select: {
          basic_salary: true,
          cash_assistance: true,
          ecola: true,
          include_payroll:true,
        },
      },
      BranchCode: {
        select: {
          branchCode: true,
          Location: true,
          CompanyCode: {
            select: {
              CompanyName: true,
              CompanyCycle: true,
            },
          },
        },
      },
    },
    
  });


// Loan code ↓

  const payrolls = await prisma.totalPayroll.findMany({
    orderBy: { createdAt: "desc" },
    take: 1,
    select: {
      payroll_period: true,
      PayCycle: true,
      cycle_category: true,
      createdAt: true,
    },
  });

  let prevPayrollPeriod: string;
  let payCycleLabel: string;

  if (!payrolls.length) {
    prevPayrollPeriod = "25-pay-cycle";
    payCycleLabel = getCurrentPayrollLabel();
  } else {
    const latestPayroll = payrolls[0];

    prevPayrollPeriod = latestPayroll.payroll_period ?? "25-pay-cycle";
    payCycleLabel = latestPayroll.PayCycle ?? getCurrentPayrollLabel();

  }

// Loan Code ↑

const bodMap = new Map(
  bodPhil.map((b) => [
    b.EmpCodeId,
    b.employee_share ? b.employee_share.toNumber() : 0,
  ])
);

  const normalized = data.map(emp => {

  const basicSalary = emp.employeepayroll?.basic_salary?.toNumber() ?? 0;
  const cashAssitance = emp.employeepayroll?.cash_assistance?.toNumber() ?? 0;
  const phil_percentage = phil?.SettingPercentage?.toNumber() ?? 0;
  const rawPagibigShare = emp.pagibig_list[0]?.pagibig_employee_share?.toNumber() ?? 0;
  const rawPagibigShareEmployer = emp.pagibig_list[0]?.pagibig_employer_share?.toNumber() ?? 0;
  const pagibigId = emp.pagibig_list[0]?.pagibig_id ?? 'N/A';
  const isNewProbi = emp.EmploymentStatus === "Probationary" && emp.isNewEmployee;
  const isBod = emp.bod_member === "bod1";
  const includePayroll = emp.employeepayroll?.include_payroll ?? false;


  const bodShare = bodMap.get(emp.EmpCode) ?? 0;

  const semiPay = computeSemiMonthlySalary(basicSalary);
  const sssContrib = computeSSSContribution(basicSalary, sssTable);
  const sssContribEmployer = computeSSSContributionEmployer(basicSalary, sssTable);
  const philhealthRate = computePhilRateEmployee(semiPay, phil_percentage,isBod,bodShare);
  const pagibigShare = computePagibig(rawPagibigShare).toFixed(2);


// Loan Code ↓

  const loanMap = {
    FCH_LOAN: 0,
    SSS_LOAN: 0,
    PAGIBIG_LOAN: 0,
    RFC_LOAN: 0,
    ARE_LOAN: 0,
  };

  const nextPayrollCycle =
    PAYROLL_CYCLE_MAP[prevPayrollPeriod];

  if (!nextPayrollCycle) {
    throw new Error(`Invalid payroll period: ${prevPayrollPeriod}`);
  }

  // Convert label → YYYY-MM
  const payPeriod =
    convertPayrollLabelToPeriod(payCycleLabel);

  //console.log("convertPayrollLabelToPeriod input:", payCycleLabel);

// Loan Code ↑



  return {
    ...emp,
    basic_salary: basicSalary,
    sss_contrib:sssContrib,
    sss_contrib_empployer:sssContribEmployer,
    phil_rate:philhealthRate,
    pagibig_share:pagibigShare,
    pagibig_employee_share: rawPagibigShare,
    pagibig_employer_share:rawPagibigShareEmployer,
    pagibig_id:pagibigId,
    cash_assistance:cashAssitance,
    fch_loan: loanMap.FCH_LOAN,
    sss_loan: loanMap.SSS_LOAN,
    pagibig_loan: loanMap.PAGIBIG_LOAN,
    rfc_loan: loanMap.RFC_LOAN,
    are_loan: loanMap.ARE_LOAN,
    // loan Code ↓
    next_payroll: nextPayrollCycle ,
    month_pay:payPeriod,
     include_payroll: includePayroll, 
    // loan Code ↑
  };
});

  return {
    data:normalized,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      zeroSalaryCount
    },
  };
}










export async function updateEmployeeSalary({
  empCode,
  old_salary,
  new_salary,
  remarks,
  changed_by,
  cash_assistance,

}: {
  empCode: string;
  old_salary: number;
  new_salary: number;
  remarks: string;
  changed_by: string;
  cash_assistance: number;

}) {
  return await prisma.$transaction(async (tx) => {

    await tx.employeeSalaryHistory.create({
      data: {
        EmpCodeId: empCode,
        old_salary,
        new_salary,
        remarks,
        salary_type: "Basic",
        changed_by,
        createdAt: nowPH(),
      },
    });


    await tx.employee_payroll.update({
      where: { EmpCodeId: empCode },
      data: {
        basic_salary: new_salary,
        cash_assistance:cash_assistance,
      },
    });
  });
}


export async function updateEmployeePayrollFields({empCode,basic_salary,pagibig_employee_share,include_payroll}: {
      empCode: string;
      basic_salary?: number;
      pagibig_employee_share?: number;
      include_payroll?: boolean;
    }) {

      return await prisma.$transaction(async (tx) => {

      await tx.employee_payroll.upsert({
        where: { EmpCodeId: empCode },
        update: {
          ...(basic_salary !== undefined && { basic_salary }),
          include_payroll, 
          excluded_date: include_payroll === false ? new Date() : null,
        },
        create: {
          EmpCodeId: empCode,
          basic_salary: basic_salary ?? 0,
          include_payroll: include_payroll ?? true,
          excluded_date: include_payroll === false ? new Date() : null,
        },
      });


       if (include_payroll === false) {   

        const pendingRecord = await tx.employeeSummary.findFirst({
          where: {
            EmpCodeId: empCode,
            status: "PENDING",
          },
          select: {
            PayCode: true,
            CycleCategory: true,
          },
        });

  
        if (pendingRecord) {
          await tx.includePayrollLogs.create({
            data: {
              EmpCodeId: empCode,
              PayCode: pendingRecord.PayCode,
              CycleCategory: pendingRecord.CycleCategory,
            },
          });
        }
      }

      if(include_payroll === false){
          await tx.employeeSummary.updateMany({
          where: {
            EmpCodeId: empCode,
            status: "PENDING",
          },
          data: {
            status: "EXCLUDED",
          },
        });
      }
    


    if (pagibig_employee_share !== undefined) {
      await tx.pagIbig_List.upsert({
        where: { EmpCodeId: empCode },
        update: {
          pagibig_employee_share,
        },
        create: {
          EmpCodeId: empCode,
          pagibig_employee_share,
        },
      });
    }

  });
}








export async function searchEmployees(keyword: string) {
  return prisma.employee.findMany({
    where: {
      OR: [
        { Firstname: { contains: keyword } },
        { Lastname: { contains: keyword } },
        { EmpCode: { contains: keyword } },
      ],
    },
    take: 10,
    select: {
      EmpCode: true,
      Firstname: true,
      Lastname: true,
      employeepayroll:{
        select:{
        basic_salary:true,
        }
      }
    },
  });
}















export async function ComputePayroll({company_id,page,limit,search}: {  company_id: string; page: number; limit: number; search?: string}) {


  
    // Special Leave Condition 
    const summary = await prisma.employeeSummary.findFirst({
      where: {
        EmpCode:{
          BranchCode:{
             company_id
          }
        }
      },
      select: { selected_payroll_date: true },
      orderBy:{
        PayCode: "desc"
      }
    });

    const payrollDate = summary?.selected_payroll_date as PayrollDate | null;

    const cutoffStart = new Date(payrollDate?.start_date as string);
    const cutoffEnd = new Date(payrollDate?.end_date as string);
    
 // END Special Leave Condition 


  const baseFilter = {
    EmpCode: {
      employeepayroll:{
      include_payroll: true,
      },
      BranchCode: {
        company_id: company_id,
      },
       isAlien: false ,
    },
  };

//   const includePayrollFilter = {
//   EmpCode: {
//     employeepayroll: {
//       include_payroll: true,
//     },
//   },
// };

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



  const finalWhere: Prisma.EmployeeSummaryWhereInput = {
    OR: [
      {
        AND: [
          baseFilter,
          
          { status: { in: ["PENDING"] } },
          searchFilter,
          statusOverride,
    
        ],
      },

      {
        AND: [
          { 
            EmpCode:{
            isAlien: true
            }
          },

          {
              EmpCode:{
                secondaryBranch:{
                company_id: company_id,
              }
            }
          },
        searchFilter,
        statusOverride,
        { status: { in: ["PENDING"] } },
      ],
      },
      // Special Leave Condition
      {
        AND: [
          {
            EmpCode: {
              EmployeeStatus: "Inactive",
            },
          },
          {
            EmpCode: {
              specialLeaves: {
                some: {
                  OR: [
                    // 🔹 Case 1: use start/end
                    {
                      AND: [
                        { start: { not: null } },
                        { end: { not: null } },
                        { start: { lte: cutoffEnd } },
                        { end: { gte: cutoffStart } },
                      ],
                    },
      
                    // 🔹 Case 2: fallback to expectedStart/expectedEnd
                    {
                      AND: [
                        { expectedStart: { not: null } },
                        { expectedEnd: { not: null } },
                        { expectedStart: { lte: cutoffEnd } },
                        { expectedEnd: { gte: cutoffStart } },
                      ],
                    },
                  ],
                },
              },
            },
          },
        ],
      }

      // END Special Leave Condition
    ]
    
  };
  

  const [total, data] = await Promise.all([
    prisma.employeeSummary.count({ where: finalWhere }),
  
    prisma.employeeSummary.findMany({
      where: finalWhere,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { EmpCodeId: "asc" },
      select: {
        PayCode: true,
        PayrollPeriod:true,
        EmpCodeId: true,
        LateCount: true,
        TotalAbsentHours: true,
        RegularAtt: true,
        OvertimeAtt: true,
        NightShiftAtt: true,
        TotalUndertime:true,
        NightShiftOtAtt: true,
        SummaryTableOverride: true,
        EmpCode: {
          
          select: {
            Firstname: true,
            Lastname: true,
            BranchCode:true,
            isSixDaysWork:true,
            employeepayroll: {
              select: {
                basic_salary: true,
                cash_assistance: true,
                ecola: true,
              },
            },
          },
        },
      },
    }),
  ]);
  

  const normalized = data.map((emp) => {
    const override = emp.SummaryTableOverride?.[0]; 

    const salaryDecimal = emp.EmpCode.employeepayroll?.basic_salary;
    const basicSalary = salaryDecimal ? salaryDecimal.toNumber() : 0;
    //const totalLateCount = emp.LateCount ? Number(emp.LateCount): 0;
    const totalLateCount = override?.LateCount ?? (emp.LateCount ? Number(emp.LateCount) : 0);

    //const totalUndertimeCount = emp.TotalUndertime? Number(emp.TotalUndertime): 0;
    const totalUndertimeCount = override?.TotalUndertime ?? (emp.TotalUndertime ? Number(emp.TotalUndertime) : 0);
    //const totalAbsent = emp.TotalAbsentHours ? Number(emp.TotalAbsentHours) : 0;
    const totalAbsent = override?.TotalAbsentHours !== null && override?.TotalAbsentHours !== undefined
      ? Number(override.TotalAbsentHours)
      : emp.TotalAbsentHours
      ? Number(emp.TotalAbsentHours)
      : 0;
    const isSixDaysWork  = emp.EmpCode.isSixDaysWork;

    const undertimeCount = computeLate(totalUndertimeCount,basicSalary,isSixDaysWork);
    const lateCount = computeLate(totalLateCount,basicSalary,isSixDaysWork);
    const absent = computeAbsent(totalAbsent,basicSalary,isSixDaysWork);
    const semiMonthlyRate = computeSemiMonthlySalary(basicSalary);

    const overTime = computeOvertime(basicSalary, {
      regular: emp.RegularAtt,
      overtime: emp.OvertimeAtt,
      nightShift: emp.NightShiftAtt,
      nightShiftOt: emp.NightShiftOtAtt,
    });

    const computedOvertime = overTime;
    const finalOvertime = override?.TotalOvertime !== undefined && override?.TotalOvertime !== null
        ? Number(override.TotalOvertime)
        : computedOvertime
        ? Number(computedOvertime)
        : 0;
        
    const grossPay = computeGrossPay(finalOvertime,semiMonthlyRate,lateCount,undertimeCount,absent);
    return {
      ...emp,
      late_count:lateCount,
      absence_count:absent,
      overtime:finalOvertime,
      undertime:undertimeCount,
      gross_pay:grossPay,

      LateCount: override?.LateCount ?? emp.LateCount ?? 0,
      TotalAbsentHours: override?.TotalAbsentHours ?? emp.TotalAbsentHours ?? 0,
      TotalUndertime: override?.TotalUndertime ?? emp.TotalUndertime ?? 0,
      TotalOvertime: override?.TotalOvertime ?? computedOvertime,
    };
  });

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
  



















//payroll initialize ***********************************************************

export async function InitializeEmployeesbyCycle({cycle, page,limit,search,onlyNew,onlyMissingSetup}: 
  {cycle: "10-25-Cycle" | "15-30-Cycle"; page: number; limit: number; search?: string;  onlyNew?: boolean;  onlyMissingSetup?: boolean }) {

    const baseFilter = {
        BranchCode: {
          CompanyCode: {
            CompanyCycle: cycle,
          },
        },
        isAlien: false,

        ...(onlyNew && { isNewEmployee: true }), 
        ...(onlyMissingSetup && {
          Disbursing: true,
          isNewEmployee:false
        }),
      };

      const searchFilter = search
        ? {
            OR: [
              { EmpCode: { contains: search } },
              { Firstname: { contains: search } },
              { Lastname: { contains: search } },
            ],
          }
        : {};


      const statusFilter = {
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

      const where = {
        OR: [
          {
            AND: [
              baseFilter,
              searchFilter,
              statusFilter,
            ],
          },

          {
            AND: [
              { isAlien: true },
                {secondaryBranch:{
                  CompanyCode: {
                    CompanyCycle: cycle,
                  },
                }
              },
              searchFilter,
              statusFilter,
            ],
          },

        ]
      
      };

  const total = await prisma.employee.count({ where });

  

  const data = await prisma.employee.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { EmpCode: "desc" },
    select: {
      EmpCode: true,
      Firstname: true,
      Lastname: true,
      Department: true,
      Position: true,
      EmploymentStatus: true,
      isNewEmployee: true,
      bod_member:true,
      Taxable:true,
      Disbursing:true,
      WithAtm:true,
 
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
          Location: true,
          CompanyCode: {
            select: {
              CompanyName: true,
              CompanyCycle: true,
            },
          },
        },
      },
    },
    
  });




      const normalized = data.map(emp => {
        const basicSalary = emp.employeepayroll?.basic_salary?.toNumber() ?? 0;  
     

        return {
          ...emp,
          basic_salary: basicSalary,
        };
      });

  return {
    data:normalized,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}







type PayrollDate = {
  start_date: string;
  end_date: string;
};



export async function InitializeComputePayroll({cycle,page,limit,search}: {cycle: "10-25-Cycle" | "15-30-Cycle"; page: number; limit: number; search?: string}) {

  const summary = await prisma.employeeSummary.findFirst({
    where: { CycleCategory: cycle },
    select: { selected_payroll_date: true },
    orderBy:{
      PayCode: "desc"
    }
  });

  const payrollDate = summary?.selected_payroll_date as PayrollDate | null;

  if (
    !payrollDate ||
    !payrollDate.start_date ||
    !payrollDate.end_date
  ) {
    throw new Error("Invalid payroll date");
  }
  
  if (!payrollDate?.start_date || !payrollDate?.end_date) {
    throw new Error("Payroll date is missing");
  }
  
  const cutoffStart = new Date(`${payrollDate.start_date}T00:00:00.000Z`);
  const cutoffEnd = new Date(`${payrollDate.end_date}T23:59:59.999Z`);
  
  if (isNaN(cutoffStart.getTime()) || isNaN(cutoffEnd.getTime())) {
    throw new Error("Invalid payroll date format");
  }
  


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

  
  const finalWhere: Prisma.EmployeeSummaryWhereInput = {
    OR: [
      {
        AND: [
          {
             CycleCategory: cycle
           },
          {
            EmpCode: {
              BranchCode: {
                CompanyCode: {
                  CompanyCycle: cycle,
                },
              },
            },
          },
          { status: { in: ["PENDING"] } },
          searchFilter,
          statusOverride,
    
        ],
      },

      {
    AND: [
          { 
            EmpCode:{
            isAlien: true
            },
            status:{ in: ["PENDING"] } 
          },

          {
              EmpCode:{
              secondaryBranch:{
                CompanyCode: {
                  CompanyCycle: cycle,
                },
              }
            },
            status:{ in: ["PENDING"] } 
          },
        searchFilter,
        statusOverride,
      ],
      },
      {
        AND: [
          {
            EmpCode: {
              EmployeeStatus: "Inactive",
            },
          },
          {
            EmpCode: {
              specialLeaves: {
                some: {
                  OR: [
                    // 🔹 Case 1: use start/end
                    {
                      AND: [
                        { start: { not: null } },
                        { end: { not: null } },
                        { start: { lte: cutoffEnd } },
                        { end: { gte: cutoffStart } },
                      ],
                    },
      
                    // 🔹 Case 2: fallback to expectedStart/expectedEnd
                    {
                      AND: [
                        { expectedStart: { not: null } },
                        { expectedEnd: { not: null } },
                        { expectedStart: { lte: cutoffEnd } },
                        { expectedEnd: { gte: cutoffStart } },
                      ],
                    },
                  ],
                },
              },
            },
          },
        ],
      }
    ]
  
  };


  

  const [total, data] = await Promise.all([
    prisma.employeeSummary.count({ where: finalWhere }),
  
    prisma.employeeSummary.findMany({
      where: finalWhere,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { EmpCodeId: "asc" },
      select: {
        PayCode: true,
        EmpCodeId: true,
        LateCount: true,
        TotalAbsentHours: true,
        RegularAtt: true,
        OvertimeAtt: true,
        NightShiftAtt: true,
        TotalUndertime:true,
        NightShiftOtAtt: true,
        EmpCode: {
          select: {
            Firstname: true,
            Lastname: true,
            BranchCode:true,
            isSixDaysWork:true,
            employeepayroll: {
              select: {
                basic_salary: true,
                cash_assistance: true,
                ecola: true,
              },
            },
          },
        },
      },
    }),
  ]);
  

  const normalized = data.map((emp) => {
    const salaryDecimal = emp.EmpCode.employeepayroll?.basic_salary;
    const basicSalary = salaryDecimal ? salaryDecimal.toNumber() : 0;
    const totalLateCount = emp.LateCount ? Number(emp.LateCount): 0;
    const totalUndertimeCount = emp.TotalUndertime? Number(emp.TotalUndertime): 0;
    const totalAbsent = emp.TotalAbsentHours ? Number(emp.TotalAbsentHours) : 0;
    const isSixDaysWork  = emp.EmpCode.isSixDaysWork;

    const undertimeCount = computeLate(totalUndertimeCount,basicSalary,isSixDaysWork);
    const lateCount = computeLate(totalLateCount,basicSalary,isSixDaysWork);
    const absent = computeAbsent(totalAbsent,basicSalary,isSixDaysWork);
    const semiMonthlyRate = computeSemiMonthlySalary(basicSalary);

    const overTime = computeOvertime(basicSalary, {
      regular: emp.RegularAtt,
      overtime: emp.OvertimeAtt,
      nightShift: emp.NightShiftAtt,
      nightShiftOt: emp.NightShiftOtAtt,
    });

    return {
      ...emp,
      late_count:lateCount,
      absence_count:absent,
      overtime:overTime,
      undertime:undertimeCount,
      gross_pay:computeGrossPay(overTime,semiMonthlyRate,lateCount,totalUndertimeCount,absent),
    };
  });

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
  



export async function ViewDeduction(company_id:string){
  try{
    const computed = await displayCompletePayroll(["PENDING"]);
    if (!computed || computed.length === 0) return 0;

      const filtered = computed.filter((row) => {
      const emp = row.EmpCode;
      const normalMatch = emp?.BranchCode?.company_id === company_id;
      const alienMatch = emp?.isAlien && emp?.secondaryBranch?.company_id === company_id;
      return normalMatch || alienMatch;
    });

      const normalized: PayrollDeductions[] = filtered.map((row) => {
        
        const total_deductions =
          (row.sss_contrib_employee ?? 0) +
          (row.philhealth_contrib_employee ?? 0) +
          (row.pagibig_contrib_employee ?? 0) +
          (row.wtax ?? 0) +
          (row.fch_loan ?? 0) +
          (row.sss_loan ?? 0) +
          (row.pagibig_loan ?? 0) +
          (row.rfc_loan ?? 0) +
          (row.are_loan ?? 0);

        return {

          EmpCodeId: row.EmpCodeId,
          EmpCode: {
            Firstname: row.EmpCode.Firstname,
            Lastname: row.EmpCode.Lastname,
          },
          sss_contrib_employee: row.sss_contrib_employee,
          philhealth_contrib_employee: row.philhealth_contrib_employee,
          pagibig_contrib_employee: row.pagibig_contrib_employee,
          wtax: row.wtax,
          fch_loan: row.fch_loan,
          sss_loan: row.sss_loan,
          pagibig_loan: row.pagibig_loan,
          rfc_loan: row.rfc_loan,
          are_loan: row.are_loan,
          total_deductions, 
          
        };
      });

    return normalized;
  }

  catch(error){
    console.error("error occured",error);
  }
}












// FOR EDITING SUMARY TABLE 

// services/payroll.service.ts




export async function updateDeductionService({PayCode,EmpCodeId,PayrollPeriod,LateCount,TotalAbsentHours,TotalUndertime,TotalOvertime}: UpdateDeductionPayload) {
  try{
    return await prisma.summaryTableOverride.upsert({
        where: {
          PayCode_EmpCodeId_PayrollPeriod: {
            PayCode,
            EmpCodeId,
            PayrollPeriod,
          },
        },
        update: {
          LateCount,
          TotalAbsentHours,
          TotalUndertime,
          TotalOvertime,
        },
        create: {
          PayCode,
          EmpCodeId,
          PayrollPeriod,
          LateCount,
          TotalAbsentHours,
          TotalUndertime,
          TotalOvertime,
        },
      });
  }
  catch(error){
    console.error(`Server error occured ${error}`);
  }
 
}