export type TotalPayroll = {
    id: number
    PayCycle: string
    cycle_category: string
    payroll_period: string
    Total_GrossPay: string
    Total_NetPay: string
    createdAt: string
    Total_Late: string
    Total_Absent: string
    Total_OverTimePay: string
    Total_SSSContributionEmployee: string
    Total_SSSContributionEmployer: string
    Total_PagibigContributionEmployee: string
    Total_PagibigContributionEmployer: string
    Total_PhilhealthContributionEmployee: string
    Total_PhilhealthContributionEmployer: string
    total_wtax: string
  }
  
  export type PaginatedResponse<T> = {
    data: T[]
    meta: {
      total: number
      page: number
      pageSize: number
      totalPages: number
    }
  }
  