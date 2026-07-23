import { Prisma, SalaryType } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { AllowanceLoan, allowanceprops, AllowanceRow, AllowanceTotals, ArchiveAllowanceDTO, ArchiveAllowanceFullResponse, BranchAllowanceSummary, BranchMeta, CompanyAllowanceSummary, EmployeeVariance, ExcelEmployee, ExcelTotals, SummaryAllowanceProps } from "./allowance.types";
import { formatAllowanceMonth, getDaysInMonth, getPreviousMonth, round2, to2 } from "./allowance.helper";
import { nowPH } from "../../utils/timezone";
import { generateAllowancePDF } from "../print/print.service";
import nodemailer from "nodemailer";
import { getAllowanceEmergency } from "../general/general.services";
import { MathRound } from "../../utils/toFixed";
import ExcelJS from "exceljs"




export async function fetchAllowanceWithAbsent({ page, limit, search, selectedMonth }: allowanceprops) {
  const [year, month] = selectedMonth.split("-").map(Number);
  const prev = getPreviousMonth(year, month);


  const monthName = new Date(prev.year, prev.month - 1).toLocaleString(
    "en-US",
    { month: "long" },
  );

  const employeeWhere: Prisma.EmployeeWhereInput = {
    AND: [
      {
        OR: [
          {
            EmployeeStatus: {
              notIn: ["Resigned", "Inactive", "Terminate"],
            },
          },
          {
            bod_member: {
              in: ["bod1", "bod2", "bod3"],
            },
          },
        ],
      },
      {
        EmployeeAbsentOverride: {
          none: {
            selectedMonth,
            exclude: true,
          }
        }
      },

      ...(search
        ? [
          {
            OR: [
              { EmpCode: { contains: search } },
              { Firstname: { contains: search } },
              { Lastname: { contains: search } },
              { BranchCodeId: { contains: search } },
            ],
          },
        ]
        : []),
    ],
  };

  const employees = await prisma.employee.findMany({
    where: employeeWhere,
    skip: (page - 1) * limit,
    take: limit,
    select: {
      EmpCode: true,
      Firstname: true,
      Lastname: true,
      EmployeeStatus: true,
      BranchCode: true,
      BranchCodeId: true,
      employeepayroll: {
        select: {
          cash_assistance: true,
          ecola: true,
          with_ecola: true,
        },
      },
      employeesummary: {
        where: {
          status: "DONE",
          AND: [
            { PayCode: { contains: monthName } },
            { PayCode: { contains: String(prev.year) } },
          ],
        },
        select: {
          TotalAbsentHours: true,
        },
      },
      EmployeeAbsentOverride: {
        where: {
          selectedMonth,
        },
        select: {
          exclude: true,
          absent_hours: true,
        }
      },
    },
    orderBy: {
      Lastname: "asc",
    },
  });

  const empCodes = employees.map((e) => e.EmpCode);

  const overrides = await prisma.allowance_branch_override.findMany({
    where: {
      selectedMonth,
      EmpCode: { in: empCodes },
    },
  });

  const overrideMap = new Map(overrides.map((o) => [o.EmpCode, o.branchCode]));

  const daysInPrevMonth = getDaysInMonth(prev.year, prev.month);



  //OVERRIDE FOR ABSENT
  const absentOverrides = await prisma.employeeAbsentOverride.findMany({
    where: {
      selectedMonth,
      EmpCodeId: { in: empCodes },
    },
  });

  const overrideAbsentMap = new Map(absentOverrides.map(o => [o.EmpCodeId, Number(o.absent_hours ?? 0)]));
  //END OVERRIDE FOR ABSENT



  const normalized = employees.map((emp) => {

    // const totalAbsentHours = emp.employeesummary.reduce(
    //   (sum, row) => sum + Number(row.TotalAbsentHours ?? 0),
    //   0,
    // );

    const computedAbsent = emp.employeesummary.reduce((sum, row) => sum + Number(row.TotalAbsentHours ?? 0), 0);
    const totalAbsentHours = overrideAbsentMap.has(emp.EmpCode) ? overrideAbsentMap.get(emp.EmpCode)! : computedAbsent;

    const cashAssistance = emp.employeepayroll?.cash_assistance?.toNumber() ?? 0;

    const ecola = emp.employeepayroll?.ecola?.toNumber() ?? 0;

    const cashDailyRate = cashAssistance / daysInPrevMonth;

    const ecolaDailyRate = ecola / daysInPrevMonth;

    const hasEcola = emp.employeepayroll?.with_ecola === true;

    const totalCashAllowance = cashAssistance - cashDailyRate * totalAbsentHours;

    const totalEcola = hasEcola ? ecola - ecolaDailyRate * totalAbsentHours : 0;

    const total = (totalCashAllowance + totalEcola).toFixed(2);
    const finalTotal = Number(total);

    const totalDeductions = cashDailyRate * totalAbsentHours + (hasEcola ? ecolaDailyRate * totalAbsentHours : 0);

    // const cashDailyRate = cashAssistance / daysInPrevMonth;
    // const ecolaDailyRate = ecola / daysInPrevMonth;

    // const absentDeduction = (cashDailyRate * totalAbsentHours) + (ecolaDailyRate * totalAbsentHours);

    // const total = cashAssistance + ecola - absentDeduction;
    const exclude_complete = emp.EmployeeAbsentOverride[0]?.exclude;
    const absent_count_complete = emp.EmployeeAbsentOverride[0]?.absent_hours;

    return {
      EmpCode: emp.EmpCode,
      Firstname: emp.Firstname,
      Lastname: emp.Lastname,
      cash_assistance: totalCashAllowance,
      ecola: totalEcola,
      deduct: totalDeductions,
      total: finalTotal,
      loan: 0,
      totalDeduction: totalDeductions,
      absent_hours: totalAbsentHours,
      BranchCode: {
        branchCode: overrideMap.get(emp.EmpCode) ?? emp.BranchCode?.branchCode,
      },
      exclude: exclude_complete,
      absent_count: absent_count_complete,
    };
  });

  // loan code ↓

  if (normalized.length > 0) {
    const empCodes = normalized.map((e) => e.EmpCode);

    const loans = await prisma.loan_details.findMany({
      where: {
        EmpCodeId: { in: empCodes },
        status: "ACTIVE",
        loan_type: {
          in: ["FCH_LOAN", "RFC_LOAN", "ARE_LOAN"],
        },
        deduct_allowance: true,
      },
      select: {
        loan_id: true,
        EmpCodeId: true,
        per_payroll_deduct: true,
        cycle_category: true,
      },
    });

    const loanIds = loans.map((l) => l.loan_id);

    const ledgers = await prisma.loan_ledger.findMany({
      where: { loan_id: { in: loanIds } },
      orderBy: { transaction_date: "desc" },
    });

    const latestLedger = new Map<number, any>();
    for (const l of ledgers) {
      if (!latestLedger.has(l.loan_id)) {
        latestLedger.set(l.loan_id, l);
      }
    }

    for (let i = 0; i < normalized.length; i++) {
      const row = normalized[i];

      const empLoan = loans.find((l) => l.EmpCodeId === row.EmpCode);

      if (!empLoan) continue;

      const ledger = latestLedger.get(empLoan.loan_id);

      let alreadyDeducted = false;
      let expectedPayrollCycle = "30";

      // if (empLoan.cycle_category === "10-25-Cycle") {
      //   expectedPayrollCycle = "30";
      // }

      if (ledger) {
        const d = ledger.transaction_date;

        alreadyDeducted =
          d.getFullYear() === year &&
          d.getMonth() + 1 === month &&
          String(ledger.payroll_cycle) === expectedPayrollCycle;
      }

      if (!alreadyDeducted) {
        const loanAmount = Number(empLoan.per_payroll_deduct);

        normalized[i] = {
          ...row,
          loan: loanAmount,
          total: row.total - loanAmount,
          totalDeduction: row.totalDeduction + loanAmount,
        };
      }
    }
  }

  // loan code ↑

  const total = await prisma.employee.count({ where: employeeWhere });

  return {
    data: normalized.map((row) => ({
      ...row,
      cash_assistance: row.cash_assistance.toFixed(2),
      ecola: row.ecola.toFixed(2),
      total: row.total.toFixed(2),
      loan: row.loan.toFixed(2),
      deduct: row.deduct.toFixed(2),
      totalDeduction: row.totalDeduction.toFixed(2),
    })),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}








export async function computeAllowanceForMonth(selectedMonth: string) {
  const [year, month] = selectedMonth.split("-").map(Number);
  const prev = getPreviousMonth(year, month);
  const emergency_allowance = await getAllowanceEmergency();

  const monthName = new Date(prev.year, prev.month - 1).toLocaleString(
    "en-US",
    {
      month: "long",
    },
  );

  const daysInPrevMonth = getDaysInMonth(prev.year, prev.month);




  const employees = await prisma.employee.findMany({
    where: {
      AND: [
        {
          OR: [
            {
              EmployeeStatus: {
                notIn: ["Resigned", "Inactive", "Terminate"],
              },
            },
            {
              bod_member: {
                in: ["bod1", "bod2", "bod3"],
              },
            },
          ],
        },
        {
          EmployeeAbsentOverride: {
            none: {
              selectedMonth,
              exclude: true,
            }
          }
        },

        {
          OR: [
            // NON-ALIEN → filter using primary main branch
            {
              isAlien: false,
              BranchCode: {
                company_id: {
                  notIn: ["SERV", "HPC", "LIK", "KOHI", "NORNS"],
                },
                branchCode: {
                  notIn: ["SGI", "NAH"],
                }
              },
            },

            // ALIEN → ignore main branch, use secondaryBranch instead
            {
              isAlien: true,
              secondaryBranch: {
                company_id: {
                  notIn: ["SERV", "HPC", "LIK", "KOHI", "NORNS"],
                },
                branchCode: {
                  notIn: ["SGI", "NAH"],
                }
              },
            },
          ],
        },
      ],
    },




    select: {
      EmpCode: true,
      Firstname: true,
      Lastname: true,
      bod_member: true,
      Position: true,
      Department: true,
      isAlien: true,
      secondaryBranch: true,
      secondaryBranchId: true,
      BranchCode: {
        select: {
          branchCode: true,
          company_id: true,
        },
      },
      employeepayroll: {
        select: {
          cash_assistance: true,
          ecola: true,
          with_ecola: true,
        },
      },
      // employeesummary: {
      //   where: {
      //     status: "DONE",
      //     AND: [
      //       { PayCode: { contains: monthName } },
      //       { PayCode: { contains: String(prev.year) } },
      //     ],
      //   },
      //   select: {
      //     TotalAbsentHours: true,
      //   },
      // },
      archive_employee_payroll: {
        where: {
          AND: [
            { PayCode: { contains: monthName } },
            { PayCode: { contains: String(prev.year) } },
          ],
        },
        select: {
          absent_count: true,
        },
      },
      EmployeeAbsentOverride: {
        where: {
          selectedMonth,
        },
        select: {
          exclude: true,
          absent_hours: true,
        }
      },
    },
    orderBy: {
      Lastname: "asc",
    },
  });

  const empCodes = employees.map((e) => e.EmpCode);

  const overrides = await prisma.allowance_branch_override.findMany({
    where: {
      selectedMonth,
      EmpCode: { in: empCodes },
    },
  });


  const overrideMap = new Map(overrides.map((o) => [o.EmpCode, o.branchCode]));



  //override absent
  const absentOverrides = await prisma.employeeAbsentOverride.findMany({
    where: {
      selectedMonth,
      EmpCodeId: { in: empCodes },
    },
  });

  const overrideAbsentMap = new Map(
    absentOverrides.map(o => [o.EmpCodeId, Number(o.absent_hours ?? 0)])
  );

  //return employees.map((emp) => {
  const rows = employees.map((emp) => {
    //const totalAbsentHours = emp.employeesummary.reduce((sum, row) => sum + Number(row.TotalAbsentHours ?? 0), 0,);
    const computedAbsent = emp.archive_employee_payroll.reduce((sum, row) => sum + Number(row.absent_count ?? 0), 0);
    const totalAbsentHours = overrideAbsentMap.has(emp.EmpCode) ? overrideAbsentMap.get(emp.EmpCode)! : computedAbsent;
    const cashAssistance = emp.employeepayroll?.cash_assistance?.toNumber() ?? 0;
    const hasEcola = emp.employeepayroll?.with_ecola === true;
    // const branchCode = overrideMap.get(emp.EmpCode) ?? emp.BranchCode?.branchCode;

    const isEmergency = emergency_allowance?.is_emergency ?? false;

    const emergencyAmount = isEmergency ? Number(emergency_allowance?.emergency_allowance_amount ?? 0) : 0;

    const baseBranch = emp.isAlien ? emp.secondaryBranch : emp.BranchCode;
    const branchCode = overrideMap.get(emp.EmpCode) ?? baseBranch?.branchCode ?? "NO_BRANCH";

    const bodMember = emp.bod_member;
    const manCom = emp.Position;

    const ecola = emp.employeepayroll?.ecola?.toNumber() ?? 0;
    const cashDailyRate = cashAssistance / 31;
    const ecolaDailyRate = ecola / 31;

    const ca_rate_per_absent = cashDailyRate * totalAbsentHours;

    const fch_rfc_deducted = 0;

    const totalCashAllowance = cashAssistance - (ca_rate_per_absent);

    const totalEcola = hasEcola ? ecola - ecolaDailyRate * totalAbsentHours : 0;

    //const total = totalCashAllowance + totalEcola + emergencyAmount;
    const total = to2(totalCashAllowance) + to2(totalEcola) + to2(emergencyAmount);


    const totalDeduction = cashDailyRate * totalAbsentHours + (hasEcola ? ecolaDailyRate * totalAbsentHours : 0);

    // loan code ↓

    // loan code ↑

    //const companyId = emp.BranchCode?.company_id ?? "UNKNOWN";
    const companyId = baseBranch?.company_id ?? "UNKNOWN";

    const positionEmp =
      emp.bod_member === "bod1" || emp.bod_member === "bod3"
        ? "board"
        : emp.Department === "M2"
          ? "M2"
          : emp.bod_member === "Mancom"
            ? "Mancom"
            : null;


    return {
      EmpCode: emp.EmpCode,
      name: `${emp.Lastname ?? ""} ${emp.Firstname ?? ""}`.trim(),
      cash_allowance: MathRound(totalCashAllowance),
      computed_ecola: MathRound(totalEcola),
      absent: totalAbsentHours,
      total: MathRound(total),
      selectedMonth,
      deduct: totalDeduction,
      totalDeduction,
      branch_code: branchCode ?? "NO_BRANCH",
      company_id: companyId,
      bod_member: bodMember,
      position: manCom,
      Department: emp.Department,
      // loan code ↓
      fch_rfc_deducted,
      base_cash_assistance: cashAssistance,
      base_ecola: ecola,
      isAlien: emp.isAlien,
      secondaryBranchId: emp.secondaryBranchId,
      positionEmp,
      is_emergency: isEmergency,
      emergency_allowance_amount: emergencyAmount,
      // loan code ↑
    };
  });

  // loan Code ↓

  if (rows.length > 0) {
    const empCodes = rows.map((e) => e.EmpCode);

    const loans = await prisma.loan_details.findMany({
      where: {
        EmpCodeId: { in: empCodes },
        status: "ACTIVE",
        loan_type: {
          in: ["FCH_LOAN", "RFC_LOAN", "ARE_LOAN"],
        },
        deduct_allowance: true,
      },
      select: {
        loan_id: true,
        EmpCodeId: true,
        loan_type: true,
        per_payroll_deduct: true,
        deduct_first_pay: true,
        deduct_second_pay: true,
        cycle_category: true,
      },
    });

    const loanIds = loans.map((l) => l.loan_id);

    const ledgers = await prisma.loan_ledger.findMany({
      where: { loan_id: { in: loanIds } },
      orderBy: { transaction_date: "desc" },
    });

    const latestLedger = new Map<number, any>();
    for (const l of ledgers) {
      if (!latestLedger.has(l.loan_id)) {
        latestLedger.set(l.loan_id, l);
      }
    }

    const loanByEmp: Record<string, any> = {};

    for (const loan of loans) {
      const ledger = latestLedger.get(loan.loan_id);

      let alreadyDeducted = false;

      if (ledger) {
        const d = ledger.transaction_date;
        let expectedPayrollCycle = "30";

        // if (loan.cycle_category === "10-25-Cycle") {
        //   expectedPayrollCycle = "30";
        // }

        alreadyDeducted =
          d.getFullYear() === year &&
          d.getMonth() + 1 === month &&
          String(ledger.payroll_cycle) === expectedPayrollCycle;
      }

      if (!loanByEmp[loan.EmpCodeId]) {
        loanByEmp[loan.EmpCodeId] = {};
      }

      loanByEmp[loan.EmpCodeId][loan.loan_type] = {
        loan_id: loan.loan_id,
        amount: Number(loan.per_payroll_deduct),
        alreadyDeducted,
      };
    }

    const loanDeduct = (loan?: { amount: number; alreadyDeducted: boolean }) =>
      loan && !loan.alreadyDeducted ? loan.amount : 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const empLoans = loanByEmp[row.EmpCode] ?? {};

      const fch = loanDeduct(empLoans["FCH_LOAN"]);
      const rfc = loanDeduct(empLoans["RFC_LOAN"]);
      const are = loanDeduct(empLoans["ARE_LOAN"]);
      const totalLoanDeduction = fch + rfc + are;

      rows[i] = {
        ...row,

        totalDeduction: totalLoanDeduction + row.totalDeduction,
        total: row.total,
        fch_rfc_deducted: totalLoanDeduction,
        cash_allowance: row.cash_allowance,
        // noloan_cash_allowance: row.cash_allowance,
        //cash_allowance: row.cash_allowance - totalLoanDeduction,
        // total: row.total - totalLoanDeduction,
      };
    }
  }

  // ...row,
  // loan: loanAmount,
  // total: row.total - loanAmount,
  // totalDeduction: row.totalDeduction + loanAmount,

  // loan Code ↑

  const summary = rows.reduce(
    (acc, row) => {
      acc.cash_allowance += row.cash_allowance;
      acc.ecola += row.computed_ecola;
      acc.total += row.total;
      acc.totalDeduction += row.totalDeduction;
      acc.deduct += row.deduct;
      acc.fch_rfc_deducted += row.fch_rfc_deducted;
      acc.emergency_allowance_amount += row.emergency_allowance_amount;
      return acc;
    },
    {
      cash_allowance: 0,
      ecola: 0,
      total: 0,
      totalDeduction: 0,
      deduct: 0,
      fch_rfc_deducted: 0,
      emergency_allowance_amount: 0,
    },
  );

  return {
    rows,
    summary,
  };
}









export async function saveAllowanceArchive(selectedMonth: string) {
  const existingSummary = await prisma.archive_allowance_summary.findUnique({
    where: { selectedMonth },
  });

  if (existingSummary) {
    throw new Error("ALLOWANCE_ALREADY_SAVED");
  }


  const { rows, summary } = await computeAllowanceForMonth(selectedMonth);
  const data_archived = await ViewAllList(selectedMonth);

  const total_ecola_ca = summary.cash_allowance + summary.ecola;

  if (!rows.length) return;


  await prisma.$transaction(async (tx) => {

    await tx.archive_allowance_summary.create({
      data: {
        allowance_name: formatAllowanceMonth(selectedMonth),
        selectedMonth,
        total_cash_allowance: summary.cash_allowance,
        total_ecola: summary.ecola,
        grand_total: total_ecola_ca,
        totalDeduction: summary.totalDeduction,
        totalAbsent: summary.deduct,
        totalLoan: summary.fch_rfc_deducted,
        total_emergency_allowance: summary.emergency_allowance_amount,
        createdAt: nowPH(),
      },
    });

    await tx.archive_allowance.createMany({
      data: rows.map((emp) => ({
        EmpCodeId: emp.EmpCode,
        name: emp.name,
        cash_allowance: emp.cash_allowance,
        ecola: emp.computed_ecola,
        absent_count: emp.absent,
        deduct: emp.deduct,
        total: emp.total,
        totalDeduction: emp.deduct + emp.fch_rfc_deducted,
        // totalAbsentHours: emp.totalDeduction,
        selectedMonth, // FK

        loan: emp.fch_rfc_deducted,
        branchCode: emp.branch_code,
        base_cash_assistance: emp.base_cash_assistance,
        base_ecola: emp.base_ecola,
        position: emp.positionEmp,
        emergency_allowance_amount: emp.emergency_allowance_amount,
        is_emergency: emp.is_emergency,

        createdAt: nowPH(),
      })),
    });

    // await tx.allowanceArchiveDetails.create({
    //   data: {
    //     selectedMonth,
    //     company_list: data_archived.TOTAL_PER_COMPANY as Prisma.InputJsonValue,
    //     loans: data_archived.LOANS as Prisma.InputJsonValue,
    //     variance_allowance: data_archived.VARIANCE as Prisma.InputJsonValue,
    //     variance_employee: data_archived.VARIANCE_EMP as Prisma.InputJsonValue,
    //   },
    // });

    for (const emp of rows) {
      if (!emp.fch_rfc_deducted || emp.fch_rfc_deducted <= 0) continue;

      const loan = await tx.loan_details.findFirst({
        where: {
          EmpCodeId: emp.EmpCode,
          status: "ACTIVE",
          loan_type: {
            in: ["FCH_LOAN", "RFC_LOAN", "ARE_LOAN"],
          },
          deduct_allowance: true,
        },
        select: {
          loan_id: true,
        },
      });

      if (!loan) continue;

      await tx.loan_ledger.create({
        data: {
          loan_id: loan.loan_id,
          EmpCodeId: emp.EmpCode,
          transaction_date: new Date(),
          payroll_cycle: "30",
          transaction_type: "PAYROLL_DEDUCT",
          debit_amount: 0,
          credit_amount: emp.fch_rfc_deducted,
          remarks: "Allowance Deduction - Loan",
          payment_status: "PAID",
        },
      });
    }
  });
}



type UpdateAllowanceBranchParams = {
  EmpCode: string;
  selectedMonth: string;
  branchCode: string;
};

export async function updateAllowanceBranch({ EmpCode, selectedMonth, branchCode }: UpdateAllowanceBranchParams) {
  await prisma.allowance_branch_override.upsert({
    where: {
      EmpCode_selectedMonth: {
        EmpCode,
        selectedMonth,
      },
    },
    update: {
      branchCode,
    },
    create: {
      EmpCode,
      selectedMonth,
      branchCode,
    },
  });
}





export async function updateAbsentOverride({ EmpCode, selectedMonth, absent_hours, exclude }: {
  EmpCode: string;
  selectedMonth: string;
  absent_hours: number;
  exclude: boolean;
}) {
  await prisma.employeeAbsentOverride.upsert({
    where: {
      EmpCodeId_selectedMonth: {
        EmpCodeId: EmpCode,
        selectedMonth,
      },
    },
    update: {
      absent_hours,
      exclude
    },
    create: {
      EmpCodeId: EmpCode,
      selectedMonth,
      absent_hours,
      exclude,
    },
  });
}



export async function displayAllowanceList({ page, limit, search }: SummaryAllowanceProps) {

  const allowanceWhere: Prisma.archive_allowance_summaryWhereInput = {
    ...(search && {
      OR: [{ allowance_name: { contains: search } }],
    }),
  };

  const allowance_list = await prisma.archive_allowance_summary.findMany({
    where: allowanceWhere,
    skip: (page - 1) * limit,
    take: limit,
    select: {
      allowance_name: true,
      total_cash_allowance: true,
      total_ecola: true,
      grand_total: true,
      totalDeduction: true,
      selectedMonth: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  const total = await prisma.archive_allowance_summary.count({
    where: allowanceWhere,
  });

  return {
    data: allowance_list,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}










export async function getArchiveAllowanceByMonth(selectedMonth: string): Promise<ArchiveAllowanceFullResponse> {

  const [branches, list, details] = await Promise.all([
    prisma.branch.findMany({
      select: {
        branchCode: true,
        position: true,
        company_id: true,
      },
    }),

    prisma.archive_allowance.findMany({
      where: {
        selectedMonth,
      },
      select: {
        EmpCodeId: true,
        name: true,
        cash_allowance: true,
        ecola: true,
        absent_count: true,
        total: true,
        totalDeduction: true,
        deduct: true,
        loan: true,
        position: true,
        createdAt: true,
        branchCode: true,
        emergency_allowance_amount: true,
        is_emergency: true,
      },
      orderBy: {
        EmpCode: {
          Lastname: "asc",
        },
      },
    }),

    prisma.allowanceArchiveDetails.findFirst({
      where: {
        selectedMonth
      },
    })
  ]);


  const branchMap = new Map<string, BranchMeta>(
    branches.map((b) => [
      b.branchCode,
      {
        branchCode: b.branchCode,
        position: b.position,
        company_id: b.company_id ?? null,
      },
    ])
  );


  const enriched: ArchiveAllowanceDTO[] = list.map((row) => {
    const meta = branchMap.get(row.branchCode);

    return {
      EmpCodeId: row.EmpCodeId,
      name: row.name,
      cash_allowance: row.cash_allowance ? Number(row.cash_allowance) : null,
      ecola: row.ecola ? Number(row.ecola) : null,
      absent_count: row.absent_count ? Number(row.absent_count) : null,
      total: row.total ? Number(row.total) : null,
      totalDeduction: row.totalDeduction ? Number(row.totalDeduction) : null,
      deduct: row.deduct ? Number(row.deduct) : null,
      loan: row.loan ? Number(row.loan) : null,
      position: row.position,
      createdAt: row.createdAt,
      branchCode: row.branchCode,
      branchPosition: meta?.position ?? 999,
      company_id: meta?.company_id ?? null,
      emergency_allowance_amount: row.emergency_allowance_amount ? Number(row.emergency_allowance_amount) : null,
      is_emergency: row.is_emergency,
    };
  });
  const parsedDetails = details
    ? {
      company_list: details.company_list,
      loans: details.loans,
      variance_allowance: details.variance_allowance,
      variance_employee: details.variance_employee,
    }
    : null;

  return {
    list: enriched,
    details: parsedDetails,
  };
}













export async function getBranchesByCompany(companyCode: string) {
  const branches = await prisma.branch.findMany({
    where: {
      company_id: companyCode,
    },
    select: {
      branchCode: true,
      Location: true,
      company_id: true,
    },
    orderBy: {
      branchCode: "asc",
    },
  });

  return branches;
}









export async function getArchiveAllowanceByCompanyBranch({ selectedMonth, company, branch, empId }: {
  selectedMonth: string;
  company: string;
  branch: string;
  empId?: string;
}) {
  return await prisma.archive_allowance.findMany({
    where: {
      selectedMonth,
      ...(empId && { EmpCodeId: empId }),
      EmpCode: {
        BranchCode: {
          branchCode: branch,
          company_id: company,
        },
      },
    },
    select: {
      EmpCodeId: true,
      name: true,
      cash_allowance: true,
      ecola: true,
      totalDeduction: true,
      deduct: true,
      loan: true,
      total: true,
      EmpCode: {
        select: {
          Firstname: true,
          Lastname: true,
          BranchCode: {
            select: {
              Location: true,
              company_id: true,
            },
          },
          employeepayroll: {
            select: {
              gmail_account: true,
            }
          }
        },
      },
    },
    orderBy: {
      EmpCode: {
        Lastname: "asc",
      },
    },
  });
}





export async function getLoanFor() {
  try {
    const data = await prisma.loan_details.findMany({
      where: {
        deduct_allowance: true,
        status: "ACTIVE",
      },
      select: {
        EmpCode: {
          select: {
            EmpCode: true,
            Firstname: true,
            Lastname: true,
            BranchCodeId: true,

          },
        },
        per_payroll_deduct: true,
        loan_type: true,
        others_types: true,
      },
    });

    return data.map((loan) => ({
      EmpCode: loan.EmpCode.EmpCode,
      Firstname: loan.EmpCode.Firstname ?? "",
      Lastname: loan.EmpCode.Lastname ?? "",
      per_payroll_deduct: loan.per_payroll_deduct?.toNumber() ?? 0,
      BranchCodeId: loan.EmpCode.BranchCodeId,
      loan_type: loan.loan_type,
      others_types: loan.others_types,
    }));
  } catch (error) {
    console.error("Error occured", error);
    throw error;
  }
}





function getPreviousMonth2(selectedMonth: string) {
  const [year, month] = selectedMonth.split("-").map(Number);
  const date = new Date(year, month - 2);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export async function getVarianceForAllowance(selectedMonth: string) {
  try {
    const prevMonth = getPreviousMonth2(selectedMonth);

    // CURRENT (computed)
    const { summary } = await computeAllowanceForMonth(selectedMonth);

    // PREVIOUS (DB)
    const previous = await prisma.archive_allowance_summary.findUnique({
      where: { selectedMonth: prevMonth },
    });

    if (!previous) {
      return null;
    }

    const currentCash = Number(summary.cash_allowance ?? 0);
    const currentEcola = Number(summary.ecola ?? 0);
    const currentGrandTotal = currentCash + currentEcola;

    const prevCash = Number(previous.total_cash_allowance ?? 0);
    const prevEcola = Number(previous.total_ecola ?? 0);
    const prevGrandTotal = prevCash + prevEcola;

    return {
      previous: {
        selectedMonth: prevMonth,
        cash_assistance: prevCash,
        ecola: prevEcola,
        grand_total: prevGrandTotal,
      },
      current: {
        selectedMonth,
        cash_assistance: currentCash,
        ecola: currentEcola,
        grand_total: currentGrandTotal,
      },
      variance: {
        cash_assistance: currentCash - prevCash,
        ecola: currentEcola - prevEcola,
        grand_total: currentGrandTotal - prevGrandTotal,
      },
    };
  } catch (error) {
    console.error("Error occurred", error);
    throw error;
  }
}




export async function ViewAllList(selectedMonth: string) {
  try {
    const { rows } = await computeAllowanceForMonth(selectedMonth);
    const loan_list = await getLoanFor();
    const variance_allowance = await getVarianceForAllowance(selectedMonth);
    // const variance_employee = await getVarianceEmployees(selectedMonth);
    const getTotalPerCompanyList = await getTotalPerCompany(selectedMonth);

    const branches = await prisma.branch.findMany({
      select: {
        branchCode: true,
        position: true,
      },
    });

    const branchPositionMap = new Map(
      branches.map((b) => [b.branchCode, b.position])
    );

    const excludedEmpCodes = ["EMB10356", "EMB10346", "EMB10634", "EMB10631"];

    const filteredRows = rows.filter((row) => !excludedEmpCodes.includes(row.EmpCode));

    const boardMembers = filteredRows.filter((row) => row.bod_member === "bod1" || row.bod_member === "bod3");

    const M2Members = filteredRows.filter((row) => row.Department === "M2");

    const nonBoard = filteredRows.filter((row) => row.bod_member !== "bod1" && row.bod_member !== "bod3");

    const mancom = nonBoard.filter((row) => row.bod_member === "Mancom");

    const MHMembers = filteredRows.filter(
      (row) =>
        row.branch_code === "EMB-MAIN" &&
        row.Department !== "M2" &&
        row.bod_member !== "bod1" &&
        row.bod_member !== "bod3" &&
        row.bod_member !== "Mancom"
    );

    const regularEmployees = nonBoard.filter((row) => row.bod_member !== "Mancom" && row.Department !== "M2");


    const branchesByCompany: Record<string, Record<string, AllowanceRow[]>> = {};

    const COMPANY_ORDER = ["EMB", "FCH", "RFC", "ELC", "PSPMI", "DOJA"];



    for (const employee of regularEmployees) {
      const branch = employee.branch_code ?? "NO_BRANCH";
      const company = branch.split("-")[0] ?? "UNKNOWN";

      if (!branchesByCompany[company]) {
        branchesByCompany[company] = {};
      }

      if (!branchesByCompany[company][branch]) {
        branchesByCompany[company][branch] = [];
      }
      branchesByCompany[company][branch].push(employee);
    }

    for (const company of Object.keys(branchesByCompany)) {
      for (const branch of Object.keys(branchesByCompany[company])) {
        branchesByCompany[company][branch].sort((a, b) => {
          return (a.name ?? "").localeCompare(b.name ?? "");
        });
      }
    }



    const orderedBranches: Record<
      string,
      Record<string, AllowanceRow[]>
    > = {};

    for (const company of COMPANY_ORDER) {
      if (!branchesByCompany[company]) {
        continue;
      }

      const branchEntries = Object.entries(
        branchesByCompany[company]
      );

      branchEntries.sort((a, b) => {
        const posA =
          branchPositionMap.get(a[0]) ?? 999;

        const posB =
          branchPositionMap.get(b[0]) ?? 999;

        return posA - posB;
      });

      orderedBranches[company] =
        Object.fromEntries(branchEntries);
    }

    if (M2Members.length > 0) {
      if (!orderedBranches["EMB"]) {
        orderedBranches["EMB"] = {};
      }

      const {
        ["EMB-MAIN"]: _removedEmbMain,
        ...embBranchesWithoutMain
      } = orderedBranches["EMB"];

      orderedBranches["EMB"] = {
        BACOLOD_BRANCH: M2Members,
        ...embBranchesWithoutMain,
      };
    }



    const loansByEmployee = new Map<
      string,
      AllowanceLoan[]
    >();

    for (const loan of loan_list) {
      const empCode = loan.EmpCode.trim();

      const currentLoans = loansByEmployee.get(empCode) ?? [];

      currentLoans.push(loan);

      loansByEmployee.set(empCode, currentLoans);
    }

    const summarizedBranches: Record<
      string,
      CompanyAllowanceSummary
    > = {};

    for (const [company, companyBranches] of Object.entries(
      orderedBranches
    )) {
      const summarizedCompanyBranches: Record<
        string,
        BranchAllowanceSummary
      > = {};

      const companyGrandTotal: AllowanceTotals = {
        cash_allowance: 0,
        computed_ecola: 0,
        deduct: 0,
        total: 0,
      };

      for (const [branchName, employees] of Object.entries(
        companyBranches
      )) {
        const branchTotals = employees.reduce<AllowanceTotals>(
          (totals, employee) => {
            totals.cash_allowance += Number(
              employee.cash_allowance ?? 0
            );

            totals.computed_ecola += Number(
              employee.computed_ecola ?? 0
            );

            totals.deduct += Number(
              employee.deduct ?? 0
            );

            totals.total += Number(
              employee.total ?? 0
            );

            return totals;
          },
          {
            cash_allowance: 0,
            computed_ecola: 0,
            deduct: 0,
            total: 0,
          }
        );

        const branchLoans = employees.flatMap(
          (employee) => {
            return (
              loansByEmployee.get(
                employee.EmpCode.trim()
              ) ?? []
            );
          }
        );

        const totalBranchLoans = branchLoans.reduce(
          (total, loan) => {
            return (
              total +
              Number(loan.per_payroll_deduct ?? 0)
            );
          },
          0
        );

        const totalDisbursement = {
          cash_allowance: MathRound(
            branchTotals.cash_allowance - totalBranchLoans
          ),
          computed_ecola: MathRound(
            branchTotals.computed_ecola
          ),
          deduct: MathRound(
            branchTotals.deduct
          ),
          total: MathRound(
            branchTotals.total - totalBranchLoans
          ),
        };

        summarizedCompanyBranches[branchName] = {
          employees,
          loans: branchLoans,
          total_loans: MathRound(totalBranchLoans),
          totals: {
            cash_allowance: MathRound(
              branchTotals.cash_allowance
            ),
            computed_ecola: MathRound(
              branchTotals.computed_ecola
            ),
            deduct: MathRound(
              branchTotals.deduct
            ),
            total: MathRound(branchTotals.total),
          }, disbursement: totalDisbursement,
        };

        companyGrandTotal.cash_allowance +=
          branchTotals.cash_allowance;

        companyGrandTotal.computed_ecola +=
          branchTotals.computed_ecola;

        companyGrandTotal.deduct +=
          branchTotals.deduct;

        companyGrandTotal.total +=
          branchTotals.total;
      }

      summarizedBranches[company] = {
        branches: summarizedCompanyBranches,
        grand_total: {
          cash_allowance: MathRound(
            companyGrandTotal.cash_allowance
          ),
          computed_ecola: MathRound(
            companyGrandTotal.computed_ecola
          ),
          deduct: MathRound(
            companyGrandTotal.deduct
          ),
          total: MathRound(companyGrandTotal.total),
        },
      };
    }

















    const mhTotals = MHMembers.reduce(
      (acc, employee) => {
        acc.cash_allowance += Number(employee.cash_allowance ?? 0);
        acc.computed_ecola += Number(employee.computed_ecola ?? 0);
        acc.total += Number(employee.total ?? 0);

        return acc;
      },
      {
        cash_allowance: 0,
        computed_ecola: 0,
        total: 0,
      }
    );


    const boardAndMancom = [
      ...boardMembers,
      ...mancom,
    ];

    const boardAndMancomTotals = boardAndMancom.reduce(
      (acc, employee) => {
        acc.cash_allowance += Number(employee.cash_allowance ?? 0);
        acc.computed_ecola += Number(employee.computed_ecola ?? 0);
        acc.total += Number(employee.total ?? 0);

        return acc;
      },
      {
        cash_allowance: 0,
        computed_ecola: 0,
        total: 0,
      }
    );


    const fin_total_mh_boardmancom = {
      cash_allowance: mhTotals.cash_allowance + boardAndMancomTotals.cash_allowance,
      computed_ecola: mhTotals.computed_ecola + boardAndMancomTotals.computed_ecola,
      total: mhTotals.total + boardAndMancomTotals.total,
    }

    const mhAndMancomLoans = loan_list.filter((loan) =>
      new Set([
        ...MHMembers.map((employee) => employee.EmpCode),
        ...mancom.map((employee) => employee.EmpCode),
      ]).has(loan.EmpCode)
    );

    const totalmhAndMancomLoans = mhAndMancomLoans.reduce(
      (total, loan) => total + Number(loan.per_payroll_deduct),
      0
    );

    const totalDisburse = {
      cash_allowance: (mhTotals.cash_allowance + boardAndMancomTotals.cash_allowance) - totalmhAndMancomLoans,
      computed_ecola: mhTotals.computed_ecola + boardAndMancomTotals.computed_ecola,
      total: (mhTotals.total + boardAndMancomTotals.total) - totalmhAndMancomLoans,
    }

    return {
      BOARD_MEMBER: boardMembers,
      MANCOM: mancom,
      MH: MHMembers,
      mh_totals: mhTotals,
      board_mancom_totals: boardAndMancomTotals,
      total_mh_boardmancom: fin_total_mh_boardmancom,
      mh_mancom_loans: mhAndMancomLoans,
      totalmhAndMancomLoans,
      total_disburse: totalDisburse,
      BRANCHES: summarizedBranches,
      VARIANCE: variance_allowance ?? null,
      // VARIANCE_EMP: variance_employee ?? null,
      TOTAL_PER_COMPANY: getTotalPerCompanyList ?? null,
    };

  } catch (error) {
    console.error("Error Occured", error);
    throw error;
  }
}












export async function getVarianceEmployees(selectedMonth: string) {
  try {
    const prevMonth = getPreviousMonth2(selectedMonth);

    const { rows: currentRows } =
      await computeAllowanceForMonth(selectedMonth);

    const previousRows =
      await prisma.archive_allowance.findMany({
        where: {
          selectedMonth: prevMonth,
        },
        select: {
          EmpCode: true,
          cash_allowance: true,
          ecola: true,
          base_cash_assistance: true,
          base_ecola: true,
          selectedMonth: true,
          absent_count: true,
          loan: true,
        },
      });

    const currentEmpCodes = currentRows.map((employee) =>
      employee.EmpCode.trim()
    );

    /*
     * Order newest first. The first record encountered
     * for each EmpCodeId will be the latest history.
     */
    const salaryHistory =
      await prisma.employeeSalaryHistory.findMany({
        where: {
          salary_type: SalaryType.Allowance,
          EmpCodeId: {
            in: currentEmpCodes,
          },
        },
        select: {
          EmpCodeId: true,
          createdAt: true,
          remarks: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const latestAllowanceHistoryMap = new Map<string, (typeof salaryHistory)[number]>();

    for (const history of salaryHistory) {
      const empCode = history.EmpCodeId.trim();

      if (!latestAllowanceHistoryMap.has(empCode)) {
        latestAllowanceHistoryMap.set(
          empCode,
          history
        );
      }
    }




    const previousEmployeeMap = new Map(
      previousRows.map((employee) => [
        employee.EmpCode.EmpCode.trim(),
        employee,
      ])
    );

    const currentEmployeeMap = new Map(
      currentRows.map((employee) => [
        employee.EmpCode.trim(),
        employee,
      ])
    );

    type CurrentEmployee =
      (typeof currentRows)[number];

    type PreviousEmployee =
      (typeof previousRows)[number];

    type AddEmployee = {
      EmpCode: string;
      currentEmployee: CurrentEmployee | null;
      previousEmployee: PreviousEmployee | null;
      previous_cash_assistance: number;
      current_cash_assistance: number;
      cash_assistance_variance: number;
      reasons: string[];
      ecola_variance: number;
      current_ecola: number;
      base_ecola?: number;
    };

    type LessEmployee = {
      EmpCode: string;
      currentEmployee: CurrentEmployee | null;
      previousEmployee: PreviousEmployee | null;
      reasons: Array<
        | "ABSENT_IN_CURRENT_MONTH"
        | "NOT_IN_CURRENT"
      >;
      cash_allowance_variance: number;
      ecola_variance: number;

    };

    const addEmployeeMap = new Map<
      string,
      AddEmployee
    >();

    const lessEmployeeMap = new Map<
      string,
      LessEmployee
    >();

    /*
     * ADD:
     * Previous-month absences are added back.
     */
    for (const previousEmployee of previousRows) {
      const empCode = previousEmployee.EmpCode.EmpCode.trim();

      const previousAbsentCount = Number(
        previousEmployee.absent_count ?? 0
      );

      if (previousAbsentCount <= 0) {
        continue;
      }

      const currentEmployee = currentEmployeeMap.get(empCode) ?? null;

      const previousCashAssistance = Number(
        previousEmployee.cash_allowance ?? 0
      );

      const currentCashAssistance = Number(
        currentEmployee?.cash_allowance ?? 0
      );

      const previousBaseCashAssitance = Number(
        previousEmployee.base_cash_assistance ?? 0
      );

      const previousEcola = Number(
        previousEmployee.ecola ?? 0
      );

      const previousBaseEcola = Number(
        previousEmployee.base_ecola ?? 0
      );

      const currentEcola = Number(
        currentEmployee?.computed_ecola ?? 0
      );

      addEmployeeMap.set(empCode, {
        EmpCode: empCode,
        currentEmployee,
        previousEmployee,
        previous_cash_assistance: previousCashAssistance,
        current_cash_assistance: currentCashAssistance,
        cash_assistance_variance: previousBaseCashAssitance - previousCashAssistance,
        reasons: ["PREVIOUS_MONTH_ABSENCE"],
        ecola_variance: previousBaseEcola - previousEcola,
        current_ecola: currentEcola,
      });
    }

    /*
     * ADD:
     * Current cash assistance increased compared
     * with the previous month.
     */
    for (const currentEmployee of currentRows) {
      const empCode =
        currentEmployee.EmpCode.trim();

      const previousEmployee =
        previousEmployeeMap.get(empCode);

      if (!previousEmployee) {
        continue;
      }

      const previousCashAssistance = Number(
        previousEmployee.cash_allowance ?? 0
      );

      const currentCashAssistance = Number(
        currentEmployee.cash_allowance ?? 0
      );

      const currentEcola = Number(
        currentEmployee.computed_ecola ?? 0
      );
      const currentBaseEcola = Number(
        currentEmployee.base_ecola ?? 0
      );

      if (
        currentCashAssistance <=
        previousCashAssistance
      ) {
        continue;
      }

      const latestHistory = latestAllowanceHistoryMap.get(empCode);
      const increaseReason = latestHistory?.remarks?.trim() || "CASH_ASSISTANCE_INCREASE";
      const existingEmployee = addEmployeeMap.get(empCode);

      if (existingEmployee) {
        if (
          !existingEmployee.reasons.includes(
            increaseReason
          )
        ) {
          existingEmployee.reasons.push(
            increaseReason
          );
        }

        existingEmployee.currentEmployee =
          currentEmployee;

        existingEmployee.previousEmployee =
          previousEmployee;

        existingEmployee.previous_cash_assistance =
          previousCashAssistance;

        existingEmployee.current_cash_assistance =
          currentCashAssistance;

        existingEmployee.cash_assistance_variance =
          currentCashAssistance -
          previousCashAssistance;

        existingEmployee.current_ecola = currentEcola;
        existingEmployee.base_ecola = currentBaseEcola;


        continue;
      }

      addEmployeeMap.set(empCode, {
        EmpCode: empCode,
        currentEmployee,
        previousEmployee,
        previous_cash_assistance: previousCashAssistance,
        current_cash_assistance: currentCashAssistance,
        cash_assistance_variance: currentCashAssistance - previousCashAssistance,
        reasons: [increaseReason],
        ecola_variance: 0,
        current_ecola: currentEcola,
      });
    }



    /*
     * LESS:
     * Current-month absences.
     */
    for (const currentEmployee of currentRows) {
      const empCode = currentEmployee.EmpCode.trim();
      const baseCashAllowance = currentEmployee.base_cash_assistance;
      const currentAllowance = currentEmployee.cash_allowance;
      const baseEcola = currentEmployee.base_ecola;
      const currentEcola = currentEmployee.computed_ecola;

      const cashAllowanceVariance = baseCashAllowance - currentAllowance;
      const ecolaVariance = baseEcola - currentEcola;



      /*
       * currentRows uses "absent", not "absent_count".
       */
      const currentAbsentCount = Number(
        currentEmployee.absent ?? 0
      );

      if (currentAbsentCount <= 0) {
        continue;
      }

      lessEmployeeMap.set(empCode, {
        EmpCode: empCode,
        currentEmployee,
        previousEmployee: previousEmployeeMap.get(empCode) ?? null,
        reasons: ["ABSENT_IN_CURRENT_MONTH"],
        cash_allowance_variance: cashAllowanceVariance,
        ecola_variance: ecolaVariance
      });
    }



    /*
     * LESS:
     * Employee existed previously but no longer
     * exists in currentRows.
     */

    for (const previousEmployee of previousRows) {
      const empCode = previousEmployee.EmpCode.EmpCode.trim();
      const previousCashAssistance = Number(previousEmployee.cash_allowance ?? 0);
      const previousEcola = Number(previousEmployee.ecola ?? 0);

      if (currentEmployeeMap.has(empCode)) {
        continue;
      }

      lessEmployeeMap.set(empCode, {
        EmpCode: empCode,
        currentEmployee: null,
        previousEmployee,
        reasons: ["NOT_IN_CURRENT"],
        cash_allowance_variance: previousCashAssistance,
        ecola_variance: previousEcola,
      });
    }








    const formattedAdd = Array.from(addEmployeeMap.values()).map((employee) => ({
      EmpCode: employee.EmpCode,
      name: employee.currentEmployee?.name ??
        [
          employee.previousEmployee?.EmpCode.Lastname,
          employee.previousEmployee?.EmpCode.Firstname,
          employee.previousEmployee?.EmpCode.Middlename,
        ]
          .filter(Boolean)
          .join(" "),

      previous_cash_assistance: employee.previous_cash_assistance,

      current_cash_assistance: employee.current_cash_assistance,

      cash_assistance_variance: MathRound(employee.cash_assistance_variance),

      ecola_variance: MathRound(employee.ecola_variance),

      reasons: employee.reasons,
    }));




    const formattedLess = Array.from(lessEmployeeMap.values()).map((employee) => ({
      EmpCode: employee.EmpCode,

      name:
        employee.currentEmployee?.name ??
        [
          employee.previousEmployee?.EmpCode.Lastname,
          employee.previousEmployee?.EmpCode.Firstname,
          employee.previousEmployee?.EmpCode.Middlename,
        ]
          .filter(Boolean)
          .join(" "),

      branch_code:
        employee.currentEmployee?.branch_code ??
        employee.previousEmployee?.EmpCode.BranchCodeId ??
        null,

      position:
        employee.currentEmployee?.position ??
        employee.previousEmployee?.EmpCode.Position ??
        null,

      absent_count:
        employee.currentEmployee?.absent ??
        Number(employee.previousEmployee?.absent_count ?? 0),

      current_cash_assistance:
        Number(
          employee.currentEmployee?.cash_allowance ?? 0
        ),

      previous_cash_assistance:
        Number(
          employee.previousEmployee?.cash_allowance ?? 0
        ),

      reasons: employee.reasons,

      cash_allowance_variance: MathRound(employee.cash_allowance_variance),
      ecola_variance: MathRound(employee.ecola_variance),

    }));

    return {
      ADD: formattedAdd,
      LESS: formattedLess,
    };
  } catch (error) {
    console.error("Error occurred:", error);
    throw error;
  }
}




















// get total per company for viewing 
type CompanyBranchSummary = Record<
  string,
  {
    total_cash_allowance: number;
    ecola: number;
    total_num: number;
    emergency_allowance_amount: number;
    branches: Record<
      string,
      {
        total_num: number;
        employees: string[];
      }
    >;
  }
>;

export async function getTotalPerCompany(selectedMonth: string): Promise<CompanyBranchSummary> {
  try {
    const { rows: currentRows } = await computeAllowanceForMonth(selectedMonth);

    const result = currentRows.reduce<CompanyBranchSummary>((acc, curr) => {
      const company = curr.company_id ?? "UNKNOWN";
      const branch = curr.branch_code ?? "NO_BRANCH";

      if (!acc[company]) {
        acc[company] = {
          total_cash_allowance: 0,
          ecola: 0,
          total_num: 0,
          emergency_allowance_amount: 0,
          branches: {},
        };
      }

      acc[company].total_cash_allowance += curr.cash_allowance ?? 0;
      acc[company].ecola += curr.computed_ecola ?? 0;
      acc[company].total_num += 1;
      acc[company].emergency_allowance_amount += curr.emergency_allowance_amount ?? 0;
      // branch grouping

      // if (!acc[company].branches[branch]) {
      //   acc[company].branches[branch] = {
      //     total_num: 0,
      //     employees: [],
      //   };
      // }

      // acc[company].branches[branch].total_num += 1;
      // acc[company].branches[branch].employees.push(curr.name);

      return acc;
    }, {});

    return result;
  } catch (error) {
    console.error("error occured -", error);
    throw error;
  }
}








export async function getArchiveReport(selectedMonth: string) {
  return prisma.archive_allowance.findMany({
    where: {
      selectedMonth,
    },
    select: {
      EmpCodeId: true,
      name: true,
      cash_allowance: true,
      ecola: true,
      absent_count: true,
      total: true,
      totalDeduction: true,
      createdAt: true,
      branchCode: true,
    },
    orderBy: {
      EmpCode: {
        BranchCode: {
          company_id: "asc"
        }
      }
    }
  });
}










type AllowanceEmailType = {
  EmpCodeId: string;
  name: string;
  cash_allowance: number | null;
  ecola: number | null;
  deduct: number | null;
  loan: number | null;
  total: number | null;
  email: string;
};


export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
});

export async function sendAllowanceEmailService(
  employee: AllowanceEmailType,
  context: {
    month: string;
    company: string;
    branch: string;
  }
) {

  if (!employee.email) {
    throw new Error("No email found");
  }

  const pdfBuffer = await generateAllowancePDF({
    EmpCodeId: employee.EmpCodeId,
    month: context.month,
    company: context.company,
    branch: context.branch,
  });

  await transporter.sendMail({
    from: `"Payroll System" <${process.env.EMAIL_USER}>`,
    to: employee.email,
    subject: "Your Allowance",
    html: `
      <p>Dear ${employee.name},</p>
      <p>Please find your allowance attached.</p>
      <p>Regards,<br/>Payroll Department</p>
    `,
    attachments: [
      {
        filename: `Allowance-${employee.EmpCodeId}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}

export async function sendBulkAllowanceService({
  month,
  company,
  branch,
}: {
  month: string;
  company: string;
  branch: string;
}) {

  const employees = await getArchiveAllowanceByCompanyBranch({
    selectedMonth: month,
    company,
    branch,
  });

  let successCount = 0;
  let failedCount = 0;

  for (const emp of employees) {
    const email = emp.EmpCode?.employeepayroll?.gmail_account;

    if (!email) continue;

    try {
      await sendAllowanceEmailService(
        {
          ...emp,
          email,
          cash_allowance: emp.cash_allowance ? Number(emp.cash_allowance) : null,
          ecola: emp.ecola ? Number(emp.ecola) : null,
          deduct: emp.deduct ? Number(emp.deduct) : null,
          loan: emp.loan ? Number(emp.loan) : null,
          total: emp.total ? Number(emp.total) : null,
        },
        {
          month,
          company,
          branch,
        }
      );
    } catch (err) {
      console.error(`Failed for ${emp.EmpCodeId}`, err);
    }
  }

  return {
    success: true,
    sent: successCount,
    failed: failedCount,
  };
}













export async function displayEmergencyAllowance() {
  try {
    const data = await prisma.allowance_emergency.findFirst();
    return data;
  }
  catch (error) {
    console.error("error occured", error);
  }
}



export async function updateEmergencyAllowance(allowance_id: number, is_emergency: boolean, emergency_allowance_amount: number) {
  return prisma.allowance_emergency.update({
    where: { allowance_id },
    data: {
      is_emergency: is_emergency,
      emergency_allowance_amount: new Prisma.Decimal(emergency_allowance_amount)
    },
  });
}



//EXPORT EXCEL 


const moneyFormat = '₱#,##0.00;[Red](₱#,##0.00);-';

export async function exportAllowanceExcel(selectedMonth: string): Promise<Buffer> {
  const result = await ViewAllList(selectedMonth);

  const workbook = new ExcelJS.Workbook();

  workbook.creator = "Jamero Group of Companies";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(
    "Cash Assistance",
    {
      views: [
        {
          state: "frozen",
          ySplit: 4,
          showGridLines: false,
        },
      ],
      pageSetup: {
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: {
          left: 0.25,
          right: 0.25,
          top: 0.5,
          bottom: 0.5,
          header: 0.2,
          footer: 0.2,
        },
      },
    }
  );

  worksheet.columns = [
    { key: "number", width: 8 },
    { key: "employee", width: 35 },
    { key: "cashAssistance", width: 20 },
    { key: "ecola", width: 16 },
    { key: "absences", width: 16 },
    { key: "netTotal", width: 20 },
  ];

  const monthLabel = new Date(
    `${selectedMonth}-01T00:00:00`
  ).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  worksheet.mergeCells("A1:F1");
  worksheet.getCell("A1").value =
    "JAMERO GROUP OF COMPANIES";

  worksheet.mergeCells("A2:F2");
  worksheet.getCell("A2").value =
    "CASH ASSISTANCE & ECOLA";

  worksheet.mergeCells("A3:F3");
  worksheet.getCell("A3").value =
    `FOR THE MONTH OF ${monthLabel.toUpperCase()}`;

  for (const cellAddress of ["A1", "A2", "A3"]) {
    const cell = worksheet.getCell(cellAddress);

    cell.font = {
      bold: true,
      size: cellAddress === "A1" ? 14 : 11,
    };

    cell.alignment = {
      horizontal: "left",
      vertical: "middle",
    };
  }

  worksheet.addRow([]);

  const addSection = (
    title: string,
    employees: ExcelEmployee[],
    totals?: ExcelTotals
  ) => {
    const headerRow = worksheet.addRow([
      "#",
      title,
      "CASH ASSISTANCE",
      "ECOLA",
      "ABSENCES",
      "NET TOTAL",
    ]);

    headerRow.height = 22;

    headerRow.eachCell((cell) => {
      cell.font = {
        bold: true,
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "FFE2E5E9",
        },
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      cell.border = {
        bottom: {
          style: "thin",
          color: {
            argb: "FFB7BCC5",
          },
        },
      };
    });

    employees.forEach((employee, index) => {
      const row = worksheet.addRow([
        index + 1,
        employee.name ?? employee.EmpCode,
        Number(employee.cash_allowance ?? 0),
        Number(employee.computed_ecola ?? 0),
        Number(employee.deduct ?? 0),
        Number(employee.total ?? 0),
      ]);

      row.getCell(1).alignment = {
        horizontal: "center",
      };

      row.getCell(2).alignment = {
        horizontal: "left",
      };

      for (let column = 3; column <= 6; column += 1) {
        row.getCell(column).numFmt = moneyFormat;
        row.getCell(column).alignment = {
          horizontal: "right",
        };
      }
    });

    if (totals) {
      const totalRow = worksheet.addRow([
        "",
        "GRAND TOTAL",
        totals.cash_allowance,
        totals.computed_ecola,
        totals.deduct ?? 0,
        totals.total,
      ]);

      totalRow.eachCell((cell) => {
        cell.font = {
          bold: true,
        };

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: "FFF2F3F5",
          },
        };

        cell.border = {
          top: {
            style: "thin",
            color: {
              argb: "FFB7BCC5",
            },
          },
        };
      });

      totalRow.getCell(2).alignment = {
        horizontal: "center",
      };

      for (let column = 3; column <= 6; column += 1) {
        totalRow.getCell(column).numFmt = moneyFormat;
        totalRow.getCell(column).alignment = {
          horizontal: "right",
        };
      }
    }

    worksheet.addRow([]);
  };

  const getTotals = (
    employees: ExcelEmployee[]
  ): ExcelTotals => {
    return employees.reduce<ExcelTotals>(
      (totals, employee) => {
        totals.cash_allowance += Number(
          employee.cash_allowance ?? 0
        );

        totals.computed_ecola += Number(
          employee.computed_ecola ?? 0
        );

        totals.deduct =
          Number(totals.deduct ?? 0) +
          Number(employee.deduct ?? 0);

        totals.total += Number(employee.total ?? 0);

        return totals;
      },
      {
        cash_allowance: 0,
        computed_ecola: 0,
        deduct: 0,
        total: 0,
      }
    );
  };

  addSection(
    "BOARD",
    result.BOARD_MEMBER,
    getTotals(result.BOARD_MEMBER)
  );

  addSection(
    "MANCOM",
    result.MANCOM,
    getTotals(result.MANCOM)
  );

  addSection(
    "Branch:MH",
    result.MH,
    {
      cash_allowance: result.mh_totals.cash_allowance,
      computed_ecola: result.mh_totals.computed_ecola,
      deduct: result.MH.reduce(
        (total, employee) =>
          total + Number(employee.deduct ?? 0),
        0
      ),
      total: result.mh_totals.total,
    }
  );

const summaryHeaderRow = worksheet.addRow([
  "",
  "",
  "CASH ALLOWANCE",
  "ECOLA",
  "",
  "TOTAL",
]);

summaryHeaderRow.eachCell((cell) => {
  cell.font = { bold: true };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: "FFE2E5E9",
    },
  };
  cell.alignment = {
    horizontal: "center",
    vertical: "middle",
  };
});

const mhSummaryRow = worksheet.addRow([
  "",
  "TOTAL MH",
  result.mh_totals.cash_allowance,
  result.mh_totals.computed_ecola,
  "",
  result.mh_totals.total,
]);

const boardMancomSummaryRow = worksheet.addRow([
  "",
  "TOTAL BOARD & MANCOM",
  result.board_mancom_totals.cash_allowance,
  result.board_mancom_totals.computed_ecola,
  "",
  result.board_mancom_totals.total,
]);

const totalSummaryRow = worksheet.addRow([
  "",
  "TOTAL",
  result.total_mh_boardmancom.cash_allowance,
  result.total_mh_boardmancom.computed_ecola,
  "",
  result.total_mh_boardmancom.total,
]);

for (const row of [
  mhSummaryRow,
  boardMancomSummaryRow,
  totalSummaryRow,
]) {
  row.getCell(2).font = {
    bold: true,
  };

  for (let column = 3; column <= 6; column += 1) {
    row.getCell(column).numFmt = moneyFormat;
    row.getCell(column).alignment = {
      horizontal: "right",
    };
  }
}

totalSummaryRow.eachCell((cell) => {
  cell.font = {
    bold: true,
  };

  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: "FFF2F3F5",
    },
  };
});

worksheet.addRow([]);

/*
 * MH AND MANCOM LOANS
 */
if (result.mh_mancom_loans.length > 0) {
  const loanHeaderRow = worksheet.addRow([
    "",
    "EMPLOYEE",
    "AMOUNT",
    "",
    "DESCRIPTION",
    "",
  ]);

  loanHeaderRow.eachCell((cell) => {
    cell.font = {
      bold: true,
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "FFE2E5E9",
      },
    };

    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };
  });

  for (const loan of result.mh_mancom_loans) {
    const loanRow = worksheet.addRow([
      "",
      `Less: ${loan.EmpCode}`,
      Number(loan.per_payroll_deduct ?? 0),
      "",
      loan.loan_type ?? loan.others_types ?? "",
      "",
    ]);

    loanRow.getCell(3).numFmt = moneyFormat;
  }

  const loanTotalRow = worksheet.addRow([
    "",
    "TOTAL",
    result.totalmhAndMancomLoans,
    "",
    "",
    "",
  ]);

  loanTotalRow.getCell(2).font = {
    bold: true,
  };

  loanTotalRow.getCell(3).font = {
    bold: true,
  };

  loanTotalRow.getCell(3).numFmt =
    moneyFormat;

  worksheet.addRow([]);
}

/*
 * TOTAL DISBURSEMENT
 */
const disbursementHeaderRow = worksheet.addRow([
  "",
  "",
  "CASH ALLOWANCE",
  "ECOLA",
  "",
  "TOTAL",
]);

disbursementHeaderRow.eachCell((cell) => {
  cell.font = {
    bold: true,
  };

  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: {
      argb: "FFE2E5E9",
    },
  };

  cell.alignment = {
    horizontal: "center",
    vertical: "middle",
  };
});

const disbursementRow = worksheet.addRow([
  "",
  "TOTAL DISBURSE",
  result.total_disburse.cash_allowance,
  result.total_disburse.computed_ecola,
  "",
  result.total_disburse.total,
]);

disbursementRow.getCell(2).font = {
  bold: true,
};

for (let column = 3; column <= 6; column += 1) {
  disbursementRow.getCell(column).numFmt =
    moneyFormat;
}

worksheet.addRow([]);







  for (const [company, companyData] of Object.entries(
    result.BRANCHES
  )) {
    const companyStartRow = worksheet.rowCount + 1;

    worksheet.mergeCells(
      `A${companyStartRow}:F${companyStartRow}`
    );

    const companyCell = worksheet.getCell(
      `A${companyStartRow}`
    );

    companyCell.value = company;
    companyCell.font = {
      bold: true,
      color: {
        argb: "FFFFFFFF",
      },
    };

    companyCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "FF334155",
      },
    };

    companyCell.alignment = {
      horizontal: "left",
      vertical: "middle",
    };

   for (const [branchName, branchData] of Object.entries(
  companyData.branches
)) {
  addSection(
    `Branch:${branchName}`,
    branchData.employees,
    branchData.totals
  );

  if (branchData.loans.length > 0) {
    const loanHeaderRow = worksheet.addRow([
      "",
      "LOAN DEDUCTIONS",
      "",
      "",
      "",
      "",
    ]);

    worksheet.mergeCells(
      `B${loanHeaderRow.number}:F${loanHeaderRow.number}`
    );

    loanHeaderRow.getCell(2).font = {
      bold: true,
    };

    loanHeaderRow.getCell(2).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "FFF1F5F9",
      },
    };

    loanHeaderRow.getCell(2).alignment = {
      horizontal: "left",
      vertical: "middle",
    };

    branchData.loans.forEach((loan, index) => {
      const employee = branchData.employees.find(
        (item) =>
          item.EmpCode.trim() === loan.EmpCode.trim()
      );

      const employeeName =
        employee?.name ?? loan.EmpCode;

      //const description = loan.others_types ?? loan.loan_type ??"";
      const description = `${loan.loan_type}, ${loan.others_types}`

   const loanRow = worksheet.addRow([
  index + 1,
  employeeName,
  Number(loan.per_payroll_deduct ?? 0),
  description,
  "",
  "",
]);

worksheet.mergeCells(
  `D${loanRow.number}:F${loanRow.number}`
);

loanRow.getCell(4).alignment = {
  horizontal: "left",
  vertical: "middle",
  wrapText: true,
};

      loanRow.getCell(1).alignment = {
        horizontal: "center",
      };

      loanRow.getCell(3).numFmt = moneyFormat;

      loanRow.getCell(3).alignment = {
        horizontal: "right",
      };
    });

    const loanTotalRow = worksheet.addRow([
      "",
      "TOTAL LOAN DEDUCTION",
      branchData.total_loans,
      "",
      "",
      "",
    ]);

    loanTotalRow.getCell(2).font = {
      bold: true,
    };

    loanTotalRow.getCell(3).font = {
      bold: true,
    };

    loanTotalRow.getCell(3).numFmt =
      moneyFormat;

    loanTotalRow.getCell(3).alignment = {
      horizontal: "right",
    };

    const disbursementRow = worksheet.addRow([
      "",
      "TOTAL DISBURSEMENT",
      branchData.disbursement.cash_allowance,
      branchData.disbursement.computed_ecola,
      branchData.disbursement.deduct,
      branchData.disbursement.total,
    ]);

    disbursementRow.eachCell((cell) => {
      cell.font = {
        bold: true,
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "FFE2E8F0",
        },
      };
    });

    for (
      let column = 3;
      column <= 6;
      column += 1
    ) {
      disbursementRow.getCell(column).numFmt =
        moneyFormat;

      disbursementRow.getCell(column).alignment = {
        horizontal: "right",
      };
    }

    worksheet.addRow([]);
  }
}

    const companyTotalRow = worksheet.addRow([
      "",
      `${company} GRAND TOTAL`,
      companyData.grand_total.cash_allowance,
      companyData.grand_total.computed_ecola,
      companyData.grand_total.deduct,
      companyData.grand_total.total,
    ]);

    companyTotalRow.eachCell((cell) => {
      cell.font = {
        bold: true,
        color: {
          argb: "FFFFFFFF",
        },
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "FF475569",
        },
      };
    });

    for (let column = 3; column <= 6; column += 1) {
      companyTotalRow.getCell(column).numFmt =
        moneyFormat;

      companyTotalRow.getCell(column).alignment = {
        horizontal: "right",
      };
    }

    worksheet.addRow([]);
  }

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 4) {
      row.height = 20;
    }

    row.eachCell((cell) => {
      cell.alignment = {
        ...cell.alignment,
        vertical: "middle",
      };
    });
  });

  worksheet.autoFilter = undefined;

  worksheet.headerFooter.oddFooter =
    "Page &P of &N";

  const excelBuffer =
    await workbook.xlsx.writeBuffer();

  return Buffer.from(excelBuffer);
}