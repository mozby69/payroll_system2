import { BonusType, FormulaType } from "@prisma/client"
import { formatDateOnly } from "../../utils/formatDateOnly"

export function getTenureInMonths(hireDate: Date, asOf: Date): number {
    return (
      (asOf.getFullYear() - hireDate.getFullYear()) * 12 +
      (asOf.getMonth() - hireDate.getMonth())
    )
  }

  export function getTenureInYears(hireDate: Date, asOf: Date): number {
    const months =
      (asOf.getFullYear() - hireDate.getFullYear()) * 12 +
      (asOf.getMonth() - hireDate.getMonth())
  
    const years = Math.floor(months / 12)
  
    return years >= 1 ? years : 0
  }
  
  export function getLastDayOfMonth(period: string): Date {
    const [year, month] = period.split("-").map(Number)
    return new Date(year, month, 0)
  }


export function calculateBonusAmount(
  formula: FormulaType,
  basicPay: number
): number {
  switch (formula) {
    case "BASIC_DIV_2":
      return basicPay / 2
    case "BASIC_DIV_1":
      return basicPay / 1
    default:
      return 0
  }
}

export function getBonusStartAndEndDate(
  eligibleMonth: number,
  bonusType: BonusType,
  asOfDate: Date
) {
  const year = asOfDate.getFullYear()

  let monthsBack = 0

  switch (bonusType) {
    case "QUARTERLY":
      monthsBack = 2
      break
    case "MIDYEAR":
      monthsBack = 5
      break
    case "ANNUAL":
      monthsBack = 11
      break
  }

  const bonusEnd = new Date(year, eligibleMonth, 0)
  const bonusStart = new Date(bonusEnd)
  bonusStart.setMonth(bonusStart.getMonth() - monthsBack)
  bonusStart.setDate(1)

  return {
    bonusStart: formatDateOnly(bonusStart),
    bonusEnd: formatDateOnly(bonusEnd)
  }
}


export function calculateBonusAmountWithLeave(
  bonusType: string,
  eligibleMonth: number,
  basic_salary: number,
) {
  let count = 0
  let salary = 0

  if (bonusType === "QUARTERLY") {
    salary = basic_salary / 2
    count = 3
  } else if (bonusType === "MIDYEAR") {
    salary = basic_salary / 2
    count = 6
  }

  const amount = (salary / count) * eligibleMonth

  return {
    amount,
    count,
  }
}


export function countEligibleMonthsWithHalfRule(
  bonusStart: Date,
  bonusEnd: Date,
  leaveStart: Date | null,
  leaveEnd: Date | null
): number {

  let total = 0
  const current = new Date(bonusStart)

  while (current <= bonusEnd) {

    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1)
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)

    const overlapsLeave =
      leaveStart &&
      leaveEnd &&
      monthStart <= leaveEnd &&
      monthEnd >= leaveStart

    if (!overlapsLeave) {
      total += 1
    } else {
      // Check if employee returns inside this month
      if (leaveEnd &&
          leaveEnd >= monthStart &&
          leaveEnd <= monthEnd) {

        const returnDay = leaveEnd.getDate()

        if (returnDay >= 1 && returnDay <= 15) {
          total += 0.5
        }
        // 16+ → add 0
      }
      // If fully covered whole month → add 0
    }

    current.setMonth(current.getMonth() + 1)
  }

  return total
}

export function generateBatchId(releasePeriod: string) {
  const timestamp = Date.now()
  return `BONUS-${releasePeriod}-${timestamp}`
}
