import { prisma } from "../../config/prismaClient"
import { CreateBonusRuleInput, UpdateBonusRuleInput } from "./bonus.schema"
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


//Generate Bonus
export async function generateBonusForAllEmployees({
  bonusRuleId,
  releasePeriod,
  asOfDate
}: {
  bonusRuleId: number
  releasePeriod: string
  asOfDate: Date
}) {
  const rule = await prisma.bonusRule.findUnique({
    where: { 
      id: bonusRuleId 
    }
  })

  if (!rule) {
    throw new Error("Bonus rule not found")
  }

  const employees = await prisma.employee.findMany({
    where: {
      EmployeeStatus: "Active"
    },
    include: {
        employeepayroll: true
      }
  })

  for (const emp of employees) {
    if (!emp.EmployementDate) continue
     const tenure = getTenureInMonths(emp.EmployementDate, asOfDate)

    if (tenure < rule.minTenureMonths) continue

    console.log(emp.Firstname ," ",  tenure, " amount: ", emp.EmployeeStatus);

    const payroll = emp.employeepayroll

    if (!payroll || !payroll.basic_salary) continue
    
    const basicSalary = Number(payroll.basic_salary)
    
    const amount = calculateBonusAmount(
      rule.formulaType,
      basicSalary
    )

    if (amount <= 0) continue
    // prevent duplicate generation
    const exists = await prisma.employeeBonus.findFirst({   
      where: {
        employeeCode: emp.EmpCode,
        bonusRuleId: rule.id,
        releasePeriod
      }
    })

    if (exists) continue

    await prisma.employeeBonus.create({
      data: {
        employeeCode: emp.EmpCode,
        bonusRuleId: rule.id,
        amount,
        generatedForMonth: rule.eligibleMonth,
        releasePeriod,
        status: "GENERATED"
      }
    })
  }
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





