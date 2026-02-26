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

