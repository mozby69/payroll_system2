import { CompanyDetailsType } from "./generalTypes"

export type BonusType =
  | "QUARTERLY"
  | "MIDYEAR"
  | "ANNUAL"
  | "SPECIAL"

export type BonusRuleInfo = {
    code: string
    name: string
    bonusType: BonusType
    minTenureMonths: number
  }

  export type EmployeeInfo = {
    Firstname: string
    Middlename: string | null
    Lastname: string
    EmployementDate: string // ISO string from backend
    EmploymentStatus: string
  }


  export type EmployeeBonus = {
    employeeCode: string
    amount: string // keep string if coming from Decimal
    bonusRuleId: number
    bonusRule: BonusRuleInfo
    employee: EmployeeInfo
    tenureMonths: number
  }

export type InvalidEmployees = {
  empCode: string
  name: string
  basicSalary: number
  amount: number
}

 export type BonusErrorResponse = {
    code: string
    invalidEmployees: InvalidEmployees[]
    message: string
  }

  export type BonusCompanyRule = {
    id: number
    bonusRuleId: number
    companyCode: string
    companyDetails: CompanyDetailsType
  }

  export type BonusSummaryType = {
      id: number
      bonusRuleId: number
      releasePeriod: string
      asOfDate: string
      generateDate: string
      totalEmployees: number
      totalAmount: number
      status: string
      releaseDate: string
      resetAt: string
      createdAt: string
      bonusRule: {
        code: string
        name: string
        companyRule: {
          companyCode: string
        }[]
      }
  }
  

  
  