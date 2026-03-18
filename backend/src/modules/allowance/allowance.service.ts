import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { allowanceprops, AllowanceRow, SummaryAllowanceProps } from "./allowance.types";
import {  formatAllowanceMonth, getDaysInMonth, getPreviousMonth } from "./allowance.helper";
import { nowPH } from "../../utils/timezone";





export async function fetchAllowanceWithAbsent({page,limit,search,selectedMonth}: allowanceprops) {
    const [year, month] = selectedMonth.split("-").map(Number);
    const prev = getPreviousMonth(year, month);
  
    const monthName = new Date(prev.year, prev.month - 1).toLocaleString("en-US", { month: "long" });
  
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
                in: ["bod1", "bod2","bod3"],
              },
            },
          ],
        },
    
        ...(search
          ? [
              {
                OR: [
                  { EmpCode: { contains: search } },
                  { Firstname: { contains: search } },
                  { Lastname: { contains: search } },
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
        EmployeeStatus:true,
        BranchCode:true,
        employeepayroll: {
          select: {
            cash_assistance: true,
            ecola: true,
            with_ecola:true,
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
      },
      orderBy: {
        Lastname:"asc",
      },
    });
  
    const daysInPrevMonth = getDaysInMonth(prev.year, prev.month);

    const normalized = employees.map((emp) => {
      const totalAbsentHours = emp.employeesummary.reduce((sum, row) => sum + Number(row.TotalAbsentHours ?? 0),0);

      const cashAssistance = emp.employeepayroll?.cash_assistance?.toNumber() ?? 0;

      const ecola = emp.employeepayroll?.ecola?.toNumber() ?? 0;

      const cashDailyRate = cashAssistance / daysInPrevMonth;
      
      const ecolaDailyRate = ecola / daysInPrevMonth;

      const hasEcola = emp.employeepayroll?.with_ecola === true;

      const totalCashAllowance = cashAssistance - (cashDailyRate * totalAbsentHours);
    
      const totalEcola = hasEcola ? ecola - (ecolaDailyRate * totalAbsentHours) : 0;
      
      const total = (totalCashAllowance + totalEcola).toFixed(2);
      const finalTotal = Number(total);
      
      const totalDeductions = (cashDailyRate * totalAbsentHours) + (hasEcola ? ecolaDailyRate * totalAbsentHours : 0);

      // const cashDailyRate = cashAssistance / daysInPrevMonth;
      // const ecolaDailyRate = ecola / daysInPrevMonth;

      // const absentDeduction = (cashDailyRate * totalAbsentHours) + (ecolaDailyRate * totalAbsentHours);

      // const total = cashAssistance + ecola - absentDeduction;

      return {
        EmpCode: emp.EmpCode,
        Firstname: emp.Firstname,
        Lastname: emp.Lastname,
        cash_assistance: totalCashAllowance,   
        ecola: totalEcola,                      
        deduct:totalDeductions,
        total: finalTotal,          
        loan:0,           
        totalDeduction: totalDeductions,   
        BranchCode:emp.BranchCode,
      };
    });


  // loan code ↓

    if (normalized.length > 0) {

      const empCodes = normalized.map(e => e.EmpCode);

      const loans = await prisma.loan_details.findMany({
        where: {
          EmpCodeId: { in: empCodes },
          status: "ACTIVE",
          loan_type:  {
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

      const loanIds = loans.map(l => l.loan_id);

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

        const empLoan = loans.find(
          l => l.EmpCodeId === row.EmpCode
        );

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

    const monthName = new Date(prev.year, prev.month - 1).toLocaleString("en-US", {
      month: "long",
    });
  
    const daysInPrevMonth = getDaysInMonth(prev.year, prev.month);
  
    const employees = await prisma.employee.findMany({
      where: {
        OR: [
          {
            EmployeeStatus: {
              notIn: ["Resigned", "Inactive", "Terminate"],
            },
          },
          {
            bod_member: {
              in: ["bod1", "bod2","bod3"],
            },
          },
        ],
      },


      select: {
        EmpCode: true,
        Firstname: true,
        Lastname: true,
        bod_member:true,
        Position:true,
        BranchCode:{
          select:{
            branchCode:true,
          }
        },
        employeepayroll: {
          select: {
            cash_assistance: true,
            ecola: true,
            with_ecola:true,
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
      },
      orderBy:{
        Lastname:"asc",
      }
    });
  
    //return employees.map((emp) => {
    const rows = employees.map((emp) => {

      const totalAbsentHours = emp.employeesummary.reduce((sum, row) => sum + Number(row.TotalAbsentHours ?? 0),0);
      const cashAssistance = emp.employeepayroll?.cash_assistance?.toNumber() ?? 0;
      const hasEcola = emp.employeepayroll?.with_ecola === true;
      const branchCode = emp.BranchCode?.branchCode;
      const bodMember = emp.bod_member;
      const manCom = emp.Position;

      const ecola = emp.employeepayroll?.ecola?.toNumber() ?? 0;
      const cashDailyRate = cashAssistance / daysInPrevMonth;
      const ecolaDailyRate = ecola / daysInPrevMonth;

      const totalCashAllowance = cashAssistance - (cashDailyRate * totalAbsentHours);
    
      const totalEcola = hasEcola? ecola - (ecolaDailyRate * totalAbsentHours): 0;
      
      const total = totalCashAllowance + totalEcola;

      const totalDeduction = (cashDailyRate * totalAbsentHours) + (hasEcola ? ecolaDailyRate * totalAbsentHours : 0);


      // loan code ↓
      const fch_rfc_deducted = 0;
      // loan code ↑


      return {
     
        EmpCode: emp.EmpCode,
        name: `${emp.Lastname ?? ""} ${emp.Firstname ?? ""}`.trim(),
        cash_allowance: totalCashAllowance,
        computed_ecola: totalEcola,
        absent: totalAbsentHours,
        total,
        selectedMonth,
        deduct:totalDeduction,
        totalDeduction,
        branch_code:branchCode ?? "NO_BRANCH",
        bod_member:bodMember,
        position:manCom,
     
        // loan code ↓
        fch_rfc_deducted
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
            loan_type:  {
              in: ["FCH_LOAN", "RFC_LOAN", "ARE_LOAN"],
            },
            deduct_allowance: true,
          },
          select: {
            loan_id: true,
            EmpCodeId: true,
            loan_type: true,
            per_payroll_deduct: true,
            cycle_category:true,
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

        const loanDeduct = (loan?: {
          amount: number;
          alreadyDeducted: boolean;
        }) => (loan && !loan.alreadyDeducted ? loan.amount : 0);

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const empLoans = loanByEmp[row.EmpCode] ?? {};

        
          const fch = loanDeduct(empLoans["FCH_LOAN"]);
          const rfc = loanDeduct(empLoans["RFC_LOAN"]);
          const totalLoanDeduction = fch + rfc;
          
          rows[i] = {
            ...row,
          
            totalDeduction: totalLoanDeduction + row.totalDeduction,
            total: row.total  - totalLoanDeduction,
            fch_rfc_deducted: totalLoanDeduction,
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
        return acc;
      },
      {
        cash_allowance: 0,
        ecola: 0,
        total: 0,
        totalDeduction: 0,
        deduct:0,
        fch_rfc_deducted:0,
      }
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
  
    // 2️⃣ Compute allowance
    const { rows, summary } = await computeAllowanceForMonth(selectedMonth);
  
    if (!rows.length) return;
  
    // 3️⃣ Transaction
    await prisma.$transaction(async (tx) => {
      // A. Save SUMMARY first
      await tx.archive_allowance_summary.create({
        data: {
          allowance_name: formatAllowanceMonth(selectedMonth),
          selectedMonth,
          total_cash_allowance: summary.cash_allowance,
          total_ecola: summary.ecola,
          grand_total: summary.total,
          totalDeduction: summary.totalDeduction,
          totalAbsent:summary.deduct,
          totalLoan:summary.fch_rfc_deducted,
          createdAt: nowPH(),
        },
      });
  
      // B. Save DETAIL rows
      await tx.archive_allowance.createMany({
        data: rows.map((emp) => ({
          EmpCodeId: emp.EmpCode,
          name: emp.name,
          cash_allowance: emp.cash_allowance,
          ecola: emp.computed_ecola,
          absent_count: emp.absent,
          deduct:emp.deduct,
          total: emp.total,
          totalDeduction:emp.deduct + emp.fch_rfc_deducted,
         // totalAbsentHours: emp.totalDeduction,
          selectedMonth, // FK
          loan:emp.fch_rfc_deducted,
          createdAt: nowPH(),
        })),
        
      });
 for (const emp of rows) {

          if (!emp.fch_rfc_deducted || emp.fch_rfc_deducted <= 0) continue;

          const loan = await tx.loan_details.findFirst({
            where: {
              EmpCodeId: emp.EmpCode,
              status: "ACTIVE",
              loan_type:  {
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








export async function displayAllowanceList({page,limit,search}: SummaryAllowanceProps) {

  const allowanceWhere: Prisma.archive_allowance_summaryWhereInput = {
  
    ...(search && {
      OR: [
        { allowance_name: { contains: search } }
      ],
    }),
  };


  const allowance_list = await prisma.archive_allowance_summary.findMany({
    where: allowanceWhere,
    skip: (page - 1) * limit,
    take: limit,
      select:{
        allowance_name:true,
        total_cash_allowance:true,
        total_ecola:true,
        grand_total:true,
        totalDeduction:true,
        selectedMonth:true,
      },
      orderBy:{
        id:'desc',
      },
  })
    
  const total = await prisma.archive_allowance_summary.count({ where: allowanceWhere });

  return {
    data:allowance_list,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
  
}




export async function getArchiveAllowanceByMonth(selectedMonth: string) {
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
    },
    orderBy: {
      EmpCodeId: 'asc',
    },
  });
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




export async function getArchiveAllowanceByCompanyBranch({
  selectedMonth,
  company,
  branch,
}: {
  selectedMonth: string;
  company: string;
  branch: string;
}) {
  return await prisma.archive_allowance.findMany({
    where: {
      selectedMonth,
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
      deduct:true,
      loan:true,
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
        },
      },
    },
    orderBy: {
      EmpCode:{
        Lastname:"asc"
      }
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
            EmpCode: true, // 🔥 include this if needed
            Firstname: true,
            Lastname: true,
          },
        },
        per_payroll_deduct: true,
      },
    });

    return data.map((loan) => ({
      EmpCode: loan.EmpCode.EmpCode,
      Firstname: loan.EmpCode.Firstname,
      Lastname: loan.EmpCode.Lastname,
      per_payroll_deduct: loan.per_payroll_deduct?.toNumber() ?? 0,
    }));
  } catch (error) {
    console.error("Error occured", error);
    throw error;
  }
}

export async function ViewAllList(selectedMonth: string) {
  try {
    const { rows } = await computeAllowanceForMonth(selectedMonth);
    const loan_list = await getLoanFor();

    const excludedEmpCodes = ["EMB10356","EMB10346","EMB10634","EMB10631"];

    const filteredRows = rows.filter((row) => !excludedEmpCodes.includes(row.EmpCode));

    const boardMembers = filteredRows.filter(
      (row) => row.bod_member === "bod1" || row.bod_member === "bod3"
    );
    // 2️⃣ Exclude board members first
    const nonBoard = filteredRows.filter((row) => row.bod_member !== "bod1" && row.bod_member !== "bod3");

    // 3️⃣ MANCOM (Senior_Manager only, excluding board)
    const mancom = nonBoard.filter((row) => row.position === "Senior_Manager");

    // 4️⃣ Remaining employees (exclude MANCOM & BOARD)
    const regularEmployees = nonBoard.filter((row) => row.position !== "Senior_Manager");

    const branches: Record<string, AllowanceRow[]> = {};

    for (const employee of regularEmployees) {
      const branch = employee.branch_code ?? "NO_BRANCH";

      if (!branches[branch]) {
        branches[branch] = [];
      }
      branches[branch].push(employee);
    }

    return {
      BOARD_MEMBER: boardMembers,
      MANCOM: mancom,
      BRANCHES: branches,
      LOANS: loan_list ?? [],
    };
  } catch (error) {
    console.error("Error Occured", error);
    throw error;
  }
}