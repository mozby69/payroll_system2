/* ================================
   VARIANCE EMPLOYEE TYPES
================================ */

export interface VarianceEmployee {
  empId: string
  name: string

  previousBasic?: number
  currentBasic?: number

  previousSSS?: number
  currentSSS?: number

  previousSSSEmployer?: number
  currentSSSEmployer?: number

  previousPhil?: number
  currentPhil?: number

  previousPhilEmployer?: number
  currentPhilEmployer?: number


  previousPag?: number
  currentPag?: number

  previousPagEmployer?: number
  currentPagEmployer?: number

  previousTaxEmploye?: number
  currentTaxEmploye?: number


  leaveType?: string


  difference?: number
}
export interface VarianceAnalysis {
  newEmployees: VarianceEmployee[]
  salaryIncrease: VarianceEmployee[]
  resignedEmployees: VarianceEmployee[]

  sssEmployeeVariance?: VarianceEmployee[]
  sssEmployerVariance?: VarianceEmployee[]

  philEmployerVariance: VarianceEmployee[]
  philVariance: VarianceEmployee[]

  pagEmployerVariance: VarianceEmployee[]
  pagVariance: VarianceEmployee[]

  taxVariance: VarianceEmployee[]

  specialLeaveEmployees: VarianceEmployee[]  
}

/* ================================
   PAYROLL VARIANCE CALCULATION
================================ */

export interface PayrollVariance {
  basic: number
  sssEmployee: number
  sssEmployer: number
  philhealthEmployee: number
  philhealthEmployer: number
}

export interface PayrollVarianceResult {
  current: {
    payroll_period: string
    total_basic_salary: number

    Total_SSSContributionEmployee: number
    Total_SSSContributionEmployer: number

    Total_PhilhealthContributionEmployee: number
    Total_PhilhealthContributionEmployer: number
  }

  previousPayroll: {
    payroll_period: string
    total_basic_salary: number
  } | null

  previousSameCycle: {
    payroll_period: string

    Total_SSSContributionEmployee: number
    Total_SSSContributionEmployer: number

    Total_PhilhealthContributionEmployee: number
    Total_PhilhealthContributionEmployer: number
  } | null

  variance: PayrollVariance
}


/* ================================
   VARIANCE TABLE ROW
================================ */

export interface VarianceRow {
  rowKey?: string
  id?: number

  cycle_category?: string
  PayCycle: string
  payroll_period?: string

  total_basic_salary: number | string

  Total_SSSContributionEmployee: number | string
  Total_SSSContributionEmployer: number | string

  Total_PhilhealthContributionEmployee: number | string
  Total_PhilhealthContributionEmployer: number | string

  Total_PagibigContributionEmployee?: number | string
  Total_PagibigContributionEmployer?: number | string

  total_wtax?: number | string
}


/* ================================
   COMPANY VARIANCE TABLE
================================ */

export interface CompanyVarianceRow {
  PayCycle: string

  total_basic_salary?: number

  Total_SSSContributionEmployee?: number
  Total_SSSContributionEmployer?: number

  Total_PhilhealthContributionEmployee?: number
  Total_PhilhealthContributionEmployer?: number

  Total_PagibigContributionEmployee?: number
  Total_PagibigContributionEmployer?: number

  total_wtax?: number
}

export interface CompanyVariance {
  company: string | null
  rows: CompanyVarianceRow[]
}


/* ================================
   API RESPONSE
================================ */

export interface VarianceResponse {
  includePagibigAndTax: boolean

  total_variance: VarianceRow[]
  company_variance: CompanyVariance[]

  variance_analysis: VarianceAnalysis
}