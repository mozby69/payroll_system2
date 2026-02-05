import { Prisma } from "@prisma/client"
import { prisma } from "../../config/prismaClient"
import { CreateBonusRuleCompanyInput, CreateBonusRuleInput, UpdateBonusRuleInput } from "./bonus.schema"
import { calculateBonusAmount, getTenureInMonths } from "./bonus.utils"
import { getLastDayOfMonthFromPeriod } from "../../helper/dateHelper"

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

  const used = await prisma.employeeBonus.findFirst({
    where: { bonusRuleId: id }
  })
  if (used) {
      const newRule = await prisma.bonusRule.create({
        data: {
          ...rule,
          ...data,
          id: undefined,
          version: rule.version + 1,
          parentRuleId: rule.id,
          isActive: true,
          createdAt: new Date()
        }
      })
      await prisma.bonusRule.update({
        where: {id: rule.id},
        data: {isActive: false}
      })

      await prisma.bonusRuleCompany.updateMany({
        where: {bonusRuleId: rule.id},
        data: {
          bonusRuleId: newRule.id
        }
      }
    )     
    
    return newRule
  }
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
  company,
  companyCode, 
  asOfDate,
  generateDate
}: {
  bonusRuleId: number
  releasePeriod: string
  companyCode?: string
  company: string
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
          in: ["GENERATED", "PENDING", "RELEASED"]
        }
      }
    })


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
         }
      },
      include: { employeepayroll: true }
    })


    const invalidEmployees: Array<{
      empCode: string
      name: string | null
      basicSalary: number
      amount: number
    }> = []

    for (const emp of employees) {
      if (!emp.EmployementDate) continue

      const tenure = getTenureInMonths(emp.EmployementDate, asOfDate)
      if (tenure < rule.minTenureMonths) continue
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
        company,
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
    
      const tenure = getTenureInMonths(emp.EmployementDate, asOfDate)
      if (tenure < rule.minTenureMonths) continue
    
      const payroll = emp.employeepayroll
      if (!payroll?.basic_salary) continue
    
      if (existingEmployeeCodes.has(emp.EmpCode)) continue
    
      const amount = calculateBonusAmount(
        rule.formulaType,
        Number(payroll.basic_salary)
      )
    
      if (amount <= 0) continue
    
      rows.push({
        employeeCode: emp.EmpCode,
        bonusRuleId: rule.id,
        amount,
        bonusSummaryId: bonusSummary.id,
        generatedForMonth: rule.eligibleMonth,
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
          minTenureMonths: true,
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


  
  return rows.map(row => ({
    ...row,
    tenureMonths: row.employee?.EmployementDate
      ? getTenureInMonths(row.employee.EmployementDate, getLastDayOfMonthFromPeriod(row.releasePeriod))
      : 0
  }))
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
        summaryIds 
      }
    })
}




