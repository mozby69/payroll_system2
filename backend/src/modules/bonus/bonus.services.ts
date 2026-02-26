import { AuditAction, AuditModule, Prisma } from "@prisma/client"
import { prisma } from "../../config/prismaClient"
import { CreateBonusRuleCompanyInput, CreateBonusRuleInput, UpdateBonusRuleInput } from "./bonus.schema"
import { calculateBonusAmount, getTenureInMonths, getTenureInYears } from "./bonus.utils"
import { getLastDayOfMonthFromPeriod } from "../../helper/dateHelper"
import { createAuditLog } from "../audit/audit.service"

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


export async function generateBonusForAllEmployees({
  bonusRuleId,
  releasePeriod,
  companyCode, 
  asOfDate,
  generateDate,
}: {
  bonusRuleId: number
  releasePeriod: string
  companyCode?: string
  asOfDate: Date
  generateDate: Date
}) {
  return prisma.$transaction(async tx => {
    const rule = await tx.bonusRule.findUnique({
      where: { id: bonusRuleId },
      include: {
        companyRule: true
      }
    })

    if (!rule) {
      throw new Error("Bonus rule not found")
    }

    const pendingChecker = await tx.employeeBonus.findMany({
        where: {
          status: "GENERATED"
        }
    })

    const blockingSummary = await tx.bonusSummary.findFirst({
      where: {
        bonusRuleId,
        releasePeriod,
        status: {
          in: ["GENERATED", "PENDING", "RELEASED", "APPROVED"]
        }
      }
    })

    if (blockingSummary?.status === "RELEASED") {
      throw {
        code: "PENDING_BONUS",  
        status: 409,
        message: "A bonus generation is already released."
      }
    }

    if (blockingSummary?.status === "APPROVED") {
      throw {
        code: "PENDING_BONUS",
        status: 409,
        message: "A bonus generation is already approved."
      }
    }


    if(pendingChecker.length > 0 || blockingSummary){
      throw {
        code: "PENDING_BONUS",
        status: 409,
        message: "A bonus generation is already pending. Please complete or cancel the existing process before generating a new bonus."
      }
      
    } 
 
    const companies = await tx.bonusRuleCompany.findMany({
      where: {
        bonusRuleId,
        ...(companyCode ? { companyCode } : {})
      }
    })

    if (companies.length === 0) {
      throw new Error("NO_COMPANY_ASSIGNED")
    }

    const companyCodes = companies.map(c => c.companyCode)

 
    const employees = await tx.employee.findMany({
      where: {
        EmployeeStatus: "Active",
         BranchCode: {
          CompanyCode: {
            CompanyCode: {
              in: companyCodes
            }
          }
         },
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


console.log("wow")

    const invalidEmployees: Array<{
      empCode: string
      name: string | null
      basicSalary: number
      amount: number
    }> = []

    for (const emp of employees) {
      if (!emp.EmployementDate) continue

      const tenure = getTenureInYears(emp.EmployementDate, asOfDate)
      if (tenure < rule.minTenureYear) continue
      const payroll = emp.employeepayroll
      if (!payroll || !payroll.basic_salary){
        invalidEmployees.push({
          empCode: emp.EmpCode,
          name: emp.Firstname,
          basicSalary: 0,
          amount: 0
        })
        continue
      } 
      const basicSalary = Number(payroll.basic_salary)
      const amount = calculateBonusAmount(rule.formulaType, basicSalary)
      if (amount <= 0) {
        invalidEmployees.push({
          empCode: emp.EmpCode,
          name: emp.Firstname,
          basicSalary,
          amount
        })
      }
    }


    // if (invalidEmployees.length > 0) {
    //   throw new Error(
    //     JSON.stringify({
    //       code: "INVALID_BONUS_AMOUNT",
    //       invalidEmployees
    //     })
    //   )
    // }

 
    const bonusSummary = await tx.bonusSummary.create({
      data: {
        bonusRuleId,
        releasePeriod,
        asOfDate,
        generateDate,
        totalAmount: 0,
        totalEmployees: 0
      }
    })

    let totalEmployees = 0
    let totalAmount = 0


    const existingBonuses = await tx.employeeBonus.findMany({
      where: {
        bonusRuleId: rule.id,
        releasePeriod,
        bonusSummaryId: bonusSummary.id
      },
      select: {
        employeeCode: true
      }
    }) 
    

    const existingEmployeeCodes = new Set(
      existingBonuses.map(b => b.employeeCode)
    )

    const rows: Prisma.EmployeeBonusCreateManyInput[] = []
    


    for (const emp of employees) {
      if (!emp.EmployementDate) continue
    
      const tenure = getTenureInYears(emp.EmployementDate, asOfDate)
      if (tenure < rule.minTenureYear) continue
    
      const payroll = emp.employeepayroll
      if (!payroll?.basic_salary) continue
    
      if (existingEmployeeCodes.has(emp.EmpCode)) continue
    
      const amount = calculateBonusAmount(
        rule.formulaType,
        Number(payroll.basic_salary)
      )
      
      // Find matching active loans
      const matchingLoans = emp.loan_details.filter(
        loan =>
          loan.status === "ACTIVE" &&
          loan.others_types === rule.code
      )
      
      // Compute total principal
      const totalPrincipal = matchingLoans.reduce(
        (sum, loan) => sum + Number(loan.principal),
        0
      )
      
      // Deduct from bonus
      let finalAmount = amount - totalPrincipal
      
      // Prevent negative bonus
      if (finalAmount < 0) {
        finalAmount = 0
      }
    
      if (amount <= 0) continue

      rows.push({
        employeeCode: emp.EmpCode,
        bonusRuleId: rule.id,
        amount: amount,
        bonusSummaryId: bonusSummary.id,
        generatedForMonth: rule.eligibleMonth,
        loanDeduction: totalPrincipal,
        netAmount: finalAmount,
        releasePeriod,
        status: "GENERATED"
      })
    
      totalEmployees++
      totalAmount += amount
    }

    if (rows.length > 0) {
      await tx.employeeBonus.createMany({
        data: rows,
        skipDuplicates: true
      })
    }
    
 
    await tx.bonusSummary.update({
      where: { id: bonusSummary.id },
      data: {
        totalEmployees,
        totalAmount
      }
    })

    return { success: true }
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
          select: { code: true, name: true, bonusType: true,  }
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
      EmployeeStatus: "Active",
      BranchCode: {
        CompanyCode: {
          CompanyCode: selectedCompanyCode,
        },
      },
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
    orderBy: { Lastname: "asc" },
  })

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
      }
    })

    return {
      summary,
      companies: allowedCompanies,
      employees: result,
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



