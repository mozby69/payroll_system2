import { prisma } from "../../config/prismaClient"
import { CreateBonusRuleCompanyInput, CreateBonusRuleInput, UpdateBonusRuleInput } from "./bonus.schema"
import { calculateBonusAmount, getTenureInMonths } from "./bonus.utils"

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
  asOfDate,
  generateDate
}: {
  bonusRuleId: number
  releasePeriod: string
  company: string
  asOfDate: Date
  generateDate: Date
}) {
  return prisma.$transaction(async tx => {
    const rule = await tx.bonusRule.findUnique({
      where: { id: bonusRuleId }
    })

    if (!rule) {
      throw new Error("Bonus rule not found")
    }

    const employees = await tx.employee.findMany({
      where: { EmployeeStatus: "Active" },
      include: { employeepayroll: true }
    })

    const invalidEmployees: Array<{
      empCode: string
      name: string | null
      basicSalary: number
      amount: number
    }> = []

    // 🔹 FIRST PASS — VALIDATION ONLY
    for (const emp of employees) {
      if (!emp.EmployementDate) continue

      const tenure = getTenureInMonths(emp.EmployementDate, asOfDate)
      if (tenure < rule.minTenureMonths) continue
      console.log("tenure: ", tenure);
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
    // ❌ STOP EVERYTHING if invalid data exists
    if (invalidEmployees.length > 0) {
      throw new Error(
        JSON.stringify({
          code: "INVALID_BONUS_AMOUNT",
          invalidEmployees
        })
      )
    }

    // 🔹 SECOND PASS — GENERATION (SAFE)
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

    for (const emp of employees) {
      if (!emp.EmployementDate) continue

      const tenure = getTenureInMonths(emp.EmployementDate, asOfDate)
      if (tenure < rule.minTenureMonths) continue

      const payroll = emp.employeepayroll
      if (!payroll || !payroll.basic_salary) continue

      const basicSalary = Number(payroll.basic_salary)
      const amount = calculateBonusAmount(rule.formulaType, basicSalary)

      const exists = await tx.employeeBonus.findFirst({
        where: {
          employeeCode: emp.EmpCode,
          bonusRuleId: rule.id,
          releasePeriod
        }
      })

      if (exists) continue

      await tx.employeeBonus.create({
        data: {
          employeeCode: emp.EmpCode,
          bonusRuleId: rule.id,
          amount,
          bonusSummaryId: bonusSummary.id,
          generatedForMonth: rule.eligibleMonth,
          releasePeriod,
          status: "GENERATED"
        }
      })

      totalEmployees++
      totalAmount += amount
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
    select: {
      employeeCode: true,
      amount: true,
      bonusRuleId: true,

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
      ? getTenureInMonths(row.employee.EmployementDate, new Date())
      : 0
  }))
}





