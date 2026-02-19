import { FormulaType } from "@prisma/client"

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
