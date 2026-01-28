import { FormulaType } from "@prisma/client"

export function getTenureInMonths(hireDate: Date, asOf: Date): number {
    return (
      (asOf.getFullYear() - hireDate.getFullYear()) * 12 +
      (asOf.getMonth() - hireDate.getMonth())
    )
  }
  


export function calculateBonusAmount(
  formula: FormulaType,
  basicPay: number
): number {
  switch (formula) {
    case "BASIC_DIV_2":
      return basicPay / 2
    default:
      return 0
  }
}
