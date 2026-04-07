import { AuditAction, AuditModule, BonusType, Prisma } from "@prisma/client"
import { prisma } from "../../config/prismaClient"
import { CreateBonusRuleCompanyInput, CreateBonusRuleInput, UpdateBonusRuleInput } from "./bonus.schema"
import { calculateBonusAmount, calculateBonusAmountWithLeave, countEligibleMonthsWithHalfRule, getBonusStartAndEndDate, getTenureInMonths, getTenureInYears } from "./bonus.utils"
import { getLastDayOfMonthFromPeriod } from "../../helper/dateHelper"
import { createAuditLog } from "../audit/audit.service"
import { formatDateToMMDDYY } from "../../utils/formatDateToMMDDYY"
import { VarianceEmployee } from "./bonus.types"
import { getPreviousPayrollDate } from "../../utils/getPreviousPayrollDate"

//Bonus Rules
export async function createBonusRuleService(data: CreateBonusRuleInput) {
  return prisma.bonusRule.create({data})
}


export async function updateBonusRuleService(
  id: number,
  data: UpdateBonusRuleInput
) {
  const rule = await prisma.bonusRule.findUnique({ where: { id } })
  if (!rule) throw new Error("Bonus rule not found")

  // const used = await prisma.employeeBonus.findFirst({
  //   where: { bonusRuleId: id }
  // })
  // if (used) {
  //     const newRule = await prisma.bonusRule.create({
  //       data: {
  //         ...rule,
  //         ...data,
  //         id: undefined,
  //         version: rule.version + 1,
  //         parentRuleId: rule.id,
  //         isActive: true,
  //         createdAt: new Date()
  //       }
  //     })
  //     await prisma.bonusRule.update({
  //       where: {id: rule.id},
  //       data: {isActive: false}
  //     })

  //     await prisma.bonusRuleCompany.updateMany({
  //       where: {bonusRuleId: rule.id},
  //       data: {
  //         bonusRuleId: newRule.id
  //       }
  //     }
  //   )     
    
  //   return newRule
  // }
  return prisma.bonusRule.update({
    where: { id },
    data
  })
}


export async function getAllBonusRulesService() {
  return prisma.bonusRule.findMany({
    where: {
      isActive: true
    },
    include:{
      companyRule: {
        select:{
          companyCode: true
        }
      }
    },
      orderBy: {
          createdAt: "desc"
      }
  })
}

export async function deleteBonusRulesService(id: number) {
  const rule = await prisma.bonusRule.findUnique({ where: { id } })

    if (!rule) throw new Error("BONUS_RULE_NOT_FOUND")

    const used = await prisma.employeeBonus.findFirst({
      where: { bonusRuleId: id }
    })

    if(used) {
      return prisma.bonusRule.update({
        where: {id},
        data: {
          isActive: false,
          deletedAt: new Date()
        }
      })
    }

    return prisma.bonusRule.delete({
      where: {id}
    })
}

// Company Rules 

export async function createBonusRuleCompanyServices(data: CreateBonusRuleCompanyInput) {
  const rule = await prisma.bonusRule.findUnique({
    where: {
      id: data.bonusRuleId
    }
  })
  if (!rule) throw new Error("BONUS_RULE_NOT_FOUND")

  const company = await prisma.company_details.findMany({
    where: {
        CompanyCode: data.companyCode,
    }
  })
  if(company.length === 0) throw new Error("COMPANY_NOT_FOUND")


  const duplicate  = await prisma.bonusRuleCompany.findMany({
    where:{
      companyCode: data.companyCode,
      bonusRuleId: data.bonusRuleId
    }
  })

  if(duplicate.length  !==0) throw new Error("RULES_DUPLICATION")



  return prisma.bonusRuleCompany.create({data});
}

export async function deleteBonusRuleCompanyServices(id: number) {
  const rule = await prisma.bonusRuleCompany.findUnique({
    where: {
      id
    }
  })
  if (!rule) throw new Error("BONUS_RULE_NOT_FOUND")
    return prisma.bonusRuleCompany.delete(
      {
        where: {id}
      }
    )
}

export async function getBonusCompanyRuleServices(bonusRuleId: number) {
  const rule = await prisma.bonusRule.findUnique({
    where: {
     id: bonusRuleId
    },

  })
  if (!rule) throw new Error("BONUS_RULE_NOT_FOUND")
       return await prisma.bonusRuleCompany.findMany({
          where:{
            bonusRuleId
          }, select: {
              id: true,
              bonusRuleId: true,
              companyCode: true,
              companyDetails: true
          },
         
         
        })
    }

//GENERATE BONUS
export async function generateBonusForAllEmployees({
  bonusRuleId,
  releasePeriod,
  companyCode,
  asOfDate,
  generateDate,
  batchId,
  tx,
}: {
  bonusRuleId: number
  releasePeriod: string
  companyCode?: string
  asOfDate: Date
  generateDate: Date
  batchId: string
  tx: Prisma.TransactionClient
}) {
  return prisma.$transaction(async tx => {
    const rule = await tx.bonusRule.findUnique({
      where: { id: bonusRuleId },
      include: { companyRule: true },
    })

    if (!rule) throw new Error("Bonus rule not found")

    // 🚫 BLOCK duplicate generation
    const blockingSummary = await tx.bonusSummary.findFirst({
      where: {
        bonusRuleId,
        releasePeriod,
        status: { in: ["GENERATED", "PENDING", "APPROVED", "RELEASED"] },
      },
    })

    if (blockingSummary) {
      throw new Error("Bonus already generated for this period")
    }

    // ✅ COMPANY FILTER
    const companies = await tx.bonusRuleCompany.findMany({
      where: {
        bonusRuleId,
        ...(companyCode ? { companyCode } : {}),
      },
    })

    if (!companies.length) throw new Error("NO_COMPANY_ASSIGNED")

    const companyCodes = companies.map(c => c.companyCode)

    // ✅ FETCH EMPLOYEES
    const employees = await tx.employee.findMany({
      where: {
        AND: [
          {
              EmployementDate: {
                lte: generateDate
              }
          },

          {
            BranchCode: {
              CompanyCode: {
                CompanyCode: {
                  in: companyCodes,
                },
              },
            },
          },
          {
            OR: [
              {  EmployeeStatus: {
                in: ["Active", "Inactive"],
              },},
              { bod_member: "bod1" },
              { bod_member: "bod2" },
              {EndDate: {
                gte: generateDate
              }},
           
            ],
          },
        ],
      },
      include: { 
        employeepayroll: true,
         loan_details:{
            where: {
              status: "ACTIVE"
            }
         }
         }
    })


    // ✅ CREATE SUMMARY
    const summary = await tx.bonusSummary.create({
      data: {
        bonusRuleId,
        releasePeriod,
        asOfDate,
        generateDate,
        totalAmount: 0,
        totalEmployees: employees.length, // ✅ ALL employees counted
        batchId,
      },
    })

    let totalAmount = 0

    const rows: Prisma.EmployeeBonusCreateManyInput[] = []

    for (const emp of employees) {
      const payroll = emp.employeepayroll
      const basicSalary = Number(payroll?.basic_salary ?? 0)

      const tenure = emp.EmployementDate
        ? getTenureInYears(emp.EmployementDate, asOfDate)
        : 0

      const isEligible =
        emp.EmployementDate &&
        tenure >= rule.minTenureYear &&
        basicSalary > 0

      let amount = 0
      let remarks = ""
      let hasLeave = false

      // ✅ CALCULATE BONUS ONLY IF ELIGIBLE
      if (isEligible) {
        amount = calculateBonusAmount(rule.formulaType, basicSalary)
      }

      // ✅ LOAN DEDUCTION
      const matchingLoans = emp.loan_details.filter(
        loan => loan.others_types === rule.code
      )

      const totalLoan = matchingLoans.reduce(
        (sum, loan) => sum + Number(loan.principal),
        0
      )

      let netAmount = amount - totalLoan
      if (netAmount < 0) netAmount = 0

      // ✅ ALWAYS PUSH (even if amount = 0)
      rows.push({
        employeeCode: emp.EmpCode,
        bonusRuleId: rule.id,
        bonusSummaryId: summary.id,
        amount,
        generatedForMonth: rule.eligibleMonth,
        loanDeduction: totalLoan,
        netAmount,
        releasePeriod,
        status: "GENERATED",
        hasLeave,
        remarks,
      })

      totalAmount += amount
    }

    // ✅ BULK INSERT
    if (rows.length > 0) {
      await tx.employeeBonus.createMany({
        data: rows,
        skipDuplicates: true,
      })
    }

    // ✅ UPDATE SUMMARY
    await tx.bonusSummary.update({
      where: { id: summary.id },
      data: {
        totalAmount,
      },
    })

    return {
      success: true,
      totalEmployees: rows.length,
      totalAmount,
    }
  })
}

export async function getEmployeeBonusService() {
  const rows = await prisma.employeeBonus.findMany({
    where: {
      status: "GENERATED"
    },
    select: {
      employeeCode: true,
      amount: true,
      bonusRuleId: true,
      releasePeriod: true,
      bonusRule: {
        select: {
          code: true,
          name: true,
          bonusType: true,
          minTenureYear: true,
        }
      },
      employee: {
        select: {
          Firstname: true,
          Middlename: true,
          Lastname: true,
          EmployementDate: true,
          EmploymentStatus: true,
            employeepayroll: {
                select: {
                  basic_salary: true
                }
            }
        }
      }
    },
    orderBy:{
      employee: {
        Firstname: "desc"
      }
    }
  })



  
  return rows.map(row => ({
    ...row,
    tenureMonths: row.employee?.EmployementDate
      ? getTenureInYears(row.employee.EmployementDate, getLastDayOfMonthFromPeriod(row.releasePeriod))
      : 0
  }))
}

export async function getEmployeeBonusServiceBySummaryIdService(
  bonusSummaryId: number
) {
 return await prisma.employeeBonus.findMany({
      where: {
        bonusSummaryId: bonusSummaryId
      },
      select: {
        employeeCode: true,
        amount: true,
        bonusRuleId: true,
        releasePeriod: true,
  
        bonusRule: {
          select: {
            code: true,
            name: true,
            bonusType: true,
            minTenureYear: true,
          }
        },
        employee: {
          select: {
            Firstname: true,
            Middlename: true,
            Lastname: true,
            EmployementDate: true,
            EmploymentStatus: true,
          }
        }
      }
    })
}



export async function resetBonusService() {
  return prisma.$transaction(async tx => {

    const summaries = await tx.bonusSummary.findMany({
      where: {
        status: "GENERATED"
      },
      select: {
        id: true
      }
    })

    if (summaries.length === 0) {
      return {
        success: false,
        message: "No generated bonus to reset"
      }
    }

    const summaryIds = summaries.map(s => s.id)

    await tx.employeeBonus.updateMany({
      where: {
        bonusSummaryId: { in: summaryIds },
        status: "GENERATED"
      },
      data: {
        status: "RESET",
        resetAt: new Date()
      }
    })

    await tx.bonusSummary.updateMany({
      where: {
        id: { in: summaryIds }
      },
      data: {
        status: "RESET",
        resetAt: new Date()
      }
    })

    return {
      success: true,
      message: "Bonus successfully reset",
      affectedSummaries: summaryIds.length
    }
  })
}

export async function submitBonusSerive(){
    return prisma.$transaction(async tx => {

      const summaries = await tx.bonusSummary.findMany({
        where: {
          status: "GENERATED"
        },
        select: {
          id: true
        }
      })
  
      if (summaries.length === 0) {
        return {
          success: false,
          message: "No generated bonus to submit"
        }
      }
      
     const summaryIds = summaries.map(s => s.id)
      await tx.bonusSummary.updateMany({
        where: {
          id: {in: summaryIds}
        },
        data: {
            status: "PENDING",
            createdAt: new Date()
        }
      })

     const update = await tx.employeeBonus.updateMany({
        where: {
          bonusSummaryId: {in: summaryIds}
        },
        data:{
          status: "PENDING",
          generatedAt: new Date()
        }
      })
      return {
        updated: update.count,
        message: "Bonus summaries successfully submitted.",
        summaryIds 
      }
    })
}

export async function getBonusSummaryService() {
    return await prisma.bonusSummary.findMany({
      where: {
        status: {
          notIn: ["RESET", "GENERATED"]
        }
      },
      include:{
        bonusRule: {
          select: {
            code: true,
            name: true,
            companyRule: {
              select: {
                companyCode: true
              }
            }
          }
        }
      },
      orderBy: {
        id: "desc"
      }
    })
}


export async function approveBonusService(
  bonusSummaryId: number,
  approvedBy: number
) {
  return prisma.$transaction(async (tx) => {

    const summary = await tx.bonusSummary.findUnique({
      where: { id: bonusSummaryId }
    })

    if (!summary) {
      throw new Error("Bonus summary not found.")
    }

    if (summary.status === "APPROVED") {
      throw new Error("Bonus already released.")
    }

    if (summary.status !== "PENDING"  ) {
      throw new Error("Released bonus cannot be modified.")
    }


    await tx.bonusSummary.update({
      where: { id: bonusSummaryId },
      data: {
        status: "APPROVED",
        approvedDate: new Date(),
        approvedById: approvedBy
      }
    })

    const updated = await tx.employeeBonus.updateMany({
      where: {
        bonusSummaryId,
        status: { not: "APPROVED" }
      },
      data: {
        status: "APPROVED"
      }
    })

    
    await createAuditLog(tx, {
      module: AuditModule.BONUS,
      action: AuditAction.APPROVE,
      referenceId: bonusSummaryId,
      performedById: approvedBy,
      description: "Approved bonus summary",
      metadata: {
        previousStatus: "PENDING",
        newStatus: "APPROVED"
      }
    })


    return {
      message: "Bonus approved successfully",
      updatedEmployees: updated.count,
      bonusSummaryId
    }
  })
}

export async function  rejectBonusService(
  bonusSummaryId: number,
  releasedBy: number
) {
    return prisma.$transaction(async (tx) =>{
      const summary = await tx.bonusSummary.update({
        where: {
          id: bonusSummaryId
        },
        data:{
          status: "CANCELLED",
          updatedAt: new Date(),
          rejectedById: releasedBy
        }
      })

      await tx.employeeBonus.updateMany({
        where:{
          bonusSummaryId: bonusSummaryId
        },
        data: {
          status: "CANCELLED"
        }
      })
      
      return {
        message: "Bonus summary has been successfully cancelled.",
        summary,
      }

    })
}

export async function releaseBonusService(
  bonusSummaryId: number,
  releasedBy: number
) {
  return prisma.$transaction(async (tx) => {


    const summary = await tx.bonusSummary.findUnique({
      where: { id: bonusSummaryId },
      include: {
        bonusRule: {
          select: {
            id: true,
            code: true,
            name: true
          },
        },
      },
    })

    if (!summary) {
      throw new Error("Bonus summary not found")
    }

  
    const loanSummary = await tx.bonusSummary.findUnique({
      where: { id: bonusSummaryId },
      include: {
        employeeBonuses: {
          where: {
            employee: {
              loan_details: {
                some: {
                  status: "ACTIVE",
                  others_types: summary.bonusRule.code,
                  principal: { not: 0 },
                },
              },
            },
          },
          include: {
            employee: {
              include: {
                loan_details: {
                  where: {
                    status: "ACTIVE",
                    others_types: summary.bonusRule.code,
                    principal: { not: 0 },
                  },
                },
              },
            },
          },
        },
      },
    })

    if(!loanSummary){
      throw new Error("Bonus summary not found")
    }


    const allLoanDetails = loanSummary.employeeBonuses.flatMap(b =>
      b.employee?.loan_details ?? []
    )

    const loanIds = allLoanDetails.map(l => l.loan_id)

    await tx.loan_details.updateMany({
      where: {
        loan_id: {
          in: loanIds
        }
      },
      data: {
        status: "CLOSED"
      }
    })

    await tx.loan_ledger.createMany({
      data: allLoanDetails.map(loan => ({
        loan_id: loan.loan_id,
        EmpCodeId: loan.EmpCodeId,
        transaction_date: new Date(),
        transaction_type: "PAYROLL_DEDUCT",
        debit_amount: 0,
        credit_amount: Number(loan.principal),
        remarks: `Loan deducted from  ${summary.bonusRule.name}`,
        payment_status: "PAID"
      }))
    })

    await tx.bonusSummary.update({
      where:{
        id: bonusSummaryId
      },
      data:{
        status: "RELEASED"
      }
    })

    await tx.employeeBonus.updateMany({
      where: {
        bonusSummaryId
      },
      data:{
        status: "RELEASED"
      }
    })

    return {
      message: "Employees with active loans retrieved successfully",
      updatedEmployees: loanIds,
      bonusSummaryId,
    }
  })
}


export async function getEmployeesByBonusSummarySerive(
  companyCode?: string,
  id?: number
) {
  return await prisma.$transaction(async (tx) => {
    const summary = await tx.bonusSummary.findFirst({
      include: {
        bonusRule: {
          select: { code: true, name: true, bonusType: true, eligibleMonth: true }
        }

      },
      where: id 
      ? {id}
      : {status: "GENERATED"}
    })
    if (!summary) {
      return {
        summary: null,
        companies: [],
        employees: [],
      }
    }

  


    const allowedCompanies = await tx.bonusRuleCompany.findMany({
      where: {
        bonusRuleId: summary.bonusRuleId,
      },
      select: { companyCode: true },
      orderBy:{
        companyCode: "asc"
      }
    })

    const companyCodes = allowedCompanies.map(c => c.companyCode)

    if (companyCodes.length === 0) {
      return {
        summary,
        companies: [],
        employees: [],
      }
    }

    const selectedCompanyCode =
    companyCode ?? allowedCompanies[0].companyCode



   

  
  const employees = await tx.employee.findMany({
    where: {
      AND: [
          {
            BranchCode: {
              CompanyCode: {
                CompanyCode: selectedCompanyCode
              },
            },
          },

          { 
            OR: [
              {
                EmployeeStatus: {
                  in: ["Active", "Inactive"],
                },
                EmployementDate: {
                  lte: summary.generateDate
                }
              },

              {
                EmployeeStatus: "Resigned",
                EmployementDate: {
                  lte: summary.generateDate
                },
                EndDate:{
                  gte: summary.generateDate
                }
              },

              {
                OR: [
                  { bod_member: "bod1" },
                  { bod_member: "bod2" }
                ],
              },
            ],
          },
      ],
    },
    include: {
      employeepayroll: true,
      employee_bonues: {
        where: { bonusSummaryId: summary.id },
      },
      BranchCode: {
        select: {
          CompanyCode: {
            select: {
              CompanyCode: true,
            },
          },
        },
      },
      loan_details: {
        where: {
          status: "ACTIVE",
          others_types: summary.bonusRule.code,
        },
      },
    },
    orderBy: [
      { Lastname: "asc" },
      { Firstname: "asc" }
    ]
  })

     const variance = await prisma.$transaction(async (tx) => {
      return await reconcileEmployeePayrollBonus(
        tx,
        selectedCompanyCode,
        summary
      )
    })

    // console.log("test: ", variance)


    const result = employees.map(emp => {
      const bonus = emp.employee_bonues[0]

      return {
        employeeCode: emp.EmpCode,
        companyCode:
          emp.BranchCode?.CompanyCode?.CompanyCode,
        fullName: `${emp.Lastname}, ${emp.Firstname}`,
        employementDate: emp.EmployementDate,
        tenureYears: emp.EmployementDate
          ? getTenureInYears(
              emp.EmployementDate,
              getLastDayOfMonthFromPeriod(summary.releasePeriod)
            )
          : 0,
        basicSalary:
          emp.employeepayroll?.basic_salary ?? 0,
        bonusAmount: bonus?.amount ?? 0,
        bonusStatus:
          bonus?.status ?? "NOT_GENERATED",
        bonusId: bonus?.id ?? null,
        fchLoan: bonus?.loanDeduction ?? 0,
        netAmount: bonus?.netAmount ?? 0,
        hasLeave: bonus?.hasLeave ?? false,
        remarks: bonus?.remarks ?? null,
        notes: bonus?.notes ?? null,
      }
    })
    

    return {
      summary,
      companies: allowedCompanies,
      employees: result,
      variance 
    }
  })
}


export async function updateBonusService(
  id: number,
  bonusAmount: number,
  performedById: number,
) {
  return prisma.$transaction(async (tx) => {

    const existing = await tx.employeeBonus.findUnique({
      where: { id }
    })

    if (!existing) {
      throw new Error("Bonus not found")
    }

    const loanDeduction = existing.loanDeduction?.toNumber() ?? 0

    const netAmount = bonusAmount - loanDeduction

    const updated = await tx.employeeBonus.update({
      where: { id },
      data: {
        amount: bonusAmount,
        netAmount,
        updatedAt: new Date() // also fix field name if typo
      }
    })

    await tx.auditLog.create({
      data: {
        module: "BONUS",
        action: "UPDATE",
        referenceId: id,
        referenceCode: existing.employeeCode ?? null,
        description: `Updated bonus amount from ${existing.amount} to ${bonusAmount}`,
        metadata: {
          oldAmount: existing.amount,
          newAmount: bonusAmount,
          loanDeduction,
          netAmount
        },
        performedById,
      }
    })

    return updated
  })
}


export async function checkPayrollService() {
  const totalResult = await prisma.employeePayrollArchive.aggregate({
    _sum: { Basic_salary: true },
    where: {
      EmpCode: {
        BranchCode: {
          company_id: "EMB",
        },
      },
    },
  })

  const employees = await prisma.employeePayrollArchive.findMany({
    where: {
      EmpCode: {
        BranchCode: {
          company_id: "EMB",
        },
      },
    },
    select: {
      Basic_salary: true,
      EmpCode: {
        select: {
          Lastname: true,
        },
      },
    },
    orderBy: {
      EmpCode:{
        Lastname: "asc"
      }
    }
  })

  return {
    totalBasicSalary: totalResult._sum.Basic_salary ?? 0,
    employees,
  }
}


export async function getEmployeesWithVarianceService(companyCodes: string) {
  const [archiveData, currentData] = await prisma.$transaction([
    // Archive salaries
    prisma.employeePayrollArchive.findMany({
      where: {
        EmpCode: {
          BranchCode: {
            company_id:  companyCodes ,
          },
        },
      },
      select: {
        EmpCodeId: true,
        Basic_salary: true,
      },
    }),

    // Current salaries
    prisma.employee.findMany({
      where: {
        BranchCode: {
          CompanyCode: {
            CompanyCode:  companyCodes ,
          },
        },
        OR: [
          { EmployeeStatus: "Active" },
          { bod_member: { in: ["bod1", "bod2"] } },
        ],
      },
      select: {
        EmpCode: true,
        employeepayroll: {
          select: {
            basic_salary: true
          }
        },
        Lastname: true,
        Firstname: true,
      },
    }),
  ])

  // Convert archive to map for fast lookup
  const archiveMap = new Map<string, number>()

archiveData.forEach(a => {
  archiveMap.set(a.EmpCodeId, Number(a.Basic_salary || 0))
})

const employeesWithVariance = currentData
  .map(emp => {
    const archiveSalary = archiveMap.get(emp.EmpCode) ?? 0
    const currentSalary = Number(emp.employeepayroll?.basic_salary || 0)
    const variance = currentSalary - archiveSalary

    return {
      EmpCode: emp.EmpCode,
      name: `${emp.Lastname ?? ""}, ${emp.Firstname ?? ""}`,
      archiveSalary,
      currentSalary,
      variance,
    }
  })
  .filter(emp => emp.variance !== 0)

  return employeesWithVariance
}

type SummaryInput = {
  id: number
  generateDate: Date
  asOfDate: Date
  bonusRule: {
    code: string
    eligibleMonth: number
    bonusType: BonusType
  }
}




export async function reconcileEmployeePayrollBonus(
  tx: Prisma.TransactionClient,
  selectedCompanyCode: string,
  summary: SummaryInput,
) {
  // Employees

  const startAndEnd = getBonusStartAndEndDate(summary.bonusRule.eligibleMonth, summary.bonusRule.bonusType, summary.asOfDate)

    const bonusStart = new Date(startAndEnd.bonusStart)
    const bonusEnd   = new Date(startAndEnd.bonusEnd)


  const employees = await tx.employee.findMany({
    where: {
      AND: [
        {
          BranchCode: {
            CompanyCode: {
              CompanyCode: selectedCompanyCode
            },
          },
         
        },
      {
        EmployementDate: {
          lte: summary.generateDate
        }
      },
        {
          OR: [
            { EmployeeStatus: "Active" },
            { bod_member: "bod1" },
            { bod_member: "bod2" },
          ],
        },
      ],
    },

    select: {
      EmpCode: true,
      Firstname: true,
      Lastname: true,
      employeepayroll: {
        select: {
          basic_salary: true
        }
      },
      specialLeaves: {
        where: {
          OR: [
            {
              status: { not: "Expected" },
              start: { not: null, lte: bonusEnd },
              end:   { not: null, gte: bonusStart }
            },
            {
              status: "Expected",
              expectedStart: { not: null, lte: bonusEnd },
              expectedEnd:   { not: null, gte: bonusStart }
            }
          ]
        },
        select: {
          leaveName: true,
          start: true,
          end: true,
          expectedStart: true,
          expectedEnd: true,
          status: true
        }
      },
      employee_salary_history: {
        orderBy: {
          createdAt: "desc"
        },
        take: 1,
        select:{
          remarks: true,
          createdAt: true
        }
      }
    }
  })




  const prevPayroll = await tx.totalPayrollByCompany.findFirst({
    where:{
      company_id: selectedCompanyCode
    },
    select: {
      total_payroll_id: true,
      total_basic_salary: true,
      PayCycle: true,
      cycle_category: true
    },
    orderBy:{
      id: "desc"
    }
  })

  // Payroll Archive
  const payrollArchive = await tx.employeePayrollArchive.findMany({
    where: {
      AND:[
            {
              EmpCode: {
                BranchCode: {
                  company_id: selectedCompanyCode,
                },
              },
            },
            {
              totalPayrollId: prevPayroll?.total_payroll_id
            }
      ]
    },
    select: {
      EmpCodeId: true,
      Basic_salary: true,
      EmpCode: {
        select:{
          Firstname: true,
          Lastname: true,
          EmployeeStatus: true,
          EndDate: true,
          employeepayroll:{
            select:{
              basic_salary: true
            }
          }
        }
      }
    },
  })


  // Bonus Records (this summary only)
  const bonusRecords = await tx.employeeBonus.findMany({
    where: {
      bonusSummaryId: summary.id,
    },
    select: {
      employeeCode: true,
      amount: true, // important
    },
  })


  // Build Sets

  const archiveSet = new Set<string>(
    payrollArchive.map(p => p.EmpCodeId)
  )
  
  const bonusSetEmployee = new Set<string>(
    employees.map(e => e.EmpCode)
  )

  const archiveSalaryMap = new Map(
    payrollArchive.map(a => [a.EmpCodeId, Number(a.Basic_salary)])
  )
  
  

  // CORE VARIANCE LOGIC

  //Employees with salary changed

  const salaryChanged: VarianceEmployee[] = employees
  .filter(emp => archiveSalaryMap.has(emp.EmpCode))
  .map(emp => {
    const currentSalary = Number(emp.employeepayroll?.basic_salary ?? 0)
    const archiveSalary =( archiveSalaryMap.get(emp.EmpCode) ?? 0)  * 2


    if (currentSalary !== archiveSalary) {

      const history = emp.employee_salary_history?.[0]
      
      return {
        EmpCode: emp.EmpCode,
        name: `${emp.Lastname ?? ""}, ${emp.Firstname ?? ""}`,
        basic_salary: (currentSalary - archiveSalary) / 2,
        type: "SALARY_CHANGED" as const,
        remarks: history?.remarks ?? history?.remarks ?? "Salary updated",
        date: history?.createdAt
          ? new Date(history.createdAt).toLocaleDateString()
          : ""
      }
    }

    return null
  })
  .filter(Boolean) as VarianceEmployee[]
  
  //  Employees with bonus but no archive
  const bonusWithoutArchive: VarianceEmployee[] = employees
  .filter(emp =>
    bonusSetEmployee.has(emp.EmpCode) &&
    !archiveSet.has(emp.EmpCode)
  )
  .map(emp => {
    const leave = emp.specialLeaves?.[0]

    const start =
      leave?.status === "Expected"
        ? leave?.expectedStart
        : leave?.start

    const end =
      leave?.status === "Expected"
        ? leave?.expectedEnd
        : leave?.end

    const date =
      start && end
        ? `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`
        : ""
    return {
      EmpCode: emp.EmpCode,
      name: `${emp.Lastname ?? ""}, ${emp.Firstname ?? ""}`,
      basic_salary: Number(emp.employeepayroll?.basic_salary) / 2,
      type: "BONUS_NO_ARCHIVE" as const,
      remarks: leave?.leaveName ?? "",
      date
    }
  })
  
  //  Archive exists but employee/bonus missing
  const archiveWithoutBonus: VarianceEmployee[] = payrollArchive
  .filter(arch => !bonusSetEmployee.has(arch.EmpCodeId))
  .map(arch => ({
    EmpCode: arch.EmpCodeId,
    name: `${arch.EmpCode.Lastname ?? ""}, ${arch.EmpCode?.Firstname ?? ""}`,
    basic_salary: Number(arch.EmpCode?.employeepayroll?.basic_salary) / 2,
    type: "ARCHIVE_NO_BONUS" as const,
    remarks: arch.EmpCode.EmployeeStatus ?? "",
    date: arch.EmpCode.EndDate
          ? new Date(arch.EmpCode.EndDate).toLocaleDateString()
           : ""
  }))
  
  // combine both
  const varianceEmployees: VarianceEmployee[] = [
    ...bonusWithoutArchive,
    ...archiveWithoutBonus,
    ...salaryChanged
  ]

  const totalVarianceBasicSalary = varianceEmployees.reduce((sum, emp) => {
    const amount = emp.basic_salary ?? 0
  
    if (emp.type === "ARCHIVE_NO_BONUS") {
      // employee existed before but not now → subtract
      return sum - amount
    }
  
    if (emp.type === "SALARY_CHANGED") {
      // amount already represents the difference
      return sum + amount
    }
  
    // BONUS_NO_ARCHIVE or other additions
    return sum + amount
  }, 0)


  return {
    prevPayroll: prevPayroll?.total_basic_salary,
    prevPayrollDate: getPreviousPayrollDate(
      prevPayroll?.PayCycle ?? "",
      prevPayroll?.cycle_category ?? ""
    ),
    totalEmployees: employees.length,
    totalArchive: payrollArchive.length,
    varianceCount: varianceEmployees.length,
    varianceEmployees,
    totalVarianceBasicSalary
  }
}


export async function generateMultipleBonuses({
  bonusRuleIds,
  releasePeriod,
  asOfDate,
  generateDate,
  companyCode,
  batchId
}: {
  bonusRuleIds: number[]
  releasePeriod: string
  asOfDate: Date
  generateDate: Date
  companyCode?: string
  batchId: string
}) {
  return prisma.$transaction(async tx => {

    const results = []

    for (const ruleId of bonusRuleIds) {
      const res = await generateBonusForAllEmployees({
        bonusRuleId: ruleId,
        releasePeriod,
        asOfDate,
        generateDate,
        companyCode,
        batchId,
        tx
      })

      results.push({ ruleId, ...res })
    }

    return results
  })
}


type ResolveBonusRulesParams = {
  asOfDate: Date
  providedRuleIds?: number[]
}

export async function resolveBonusRuleIds({
  asOfDate,
  providedRuleIds
}: ResolveBonusRulesParams): Promise<number[]> {

  // ✅ If user already selected rules → use them
  if (providedRuleIds && providedRuleIds.length > 0) {
    return providedRuleIds
  }

  const month = asOfDate.getMonth() + 1

  // ✅ Determine bonus types based on month
  const types =
    month === 6
      ? ["MIDYEAR", "QUARTERLY"]
      : ["QUARTERLY"]

  // ✅ Fetch active rules
  const rules = await prisma.bonusRule.findMany({
    where: {
      bonusType: { in: types as any },
      isActive: true
    },
    select: { id: true }
  })

  if (rules.length === 0) {
    throw {
      code: "NO_ACTIVE_RULE",
      message: "No active bonus rules found for this period"
    }
  }

  return rules.map(r => r.id)
}

