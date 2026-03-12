

  

// export interface PreviousPeriod {
//     cycle_category: string;
//     PayCycle: string;
//     total_basic_salary: string;
//     payroll_period: string;
//     Total_SSSContributionEmployee: string;
//     Total_SSSContributionEmployer: string;
//     Total_PhilhealthContributionEmployee: string;
//     Total_PhilhealthContributionEmployer: string;
//     Total_PagibigContributionEmployee: string;
//     Total_PagibigContributionEmployer: string;
//     total_wtax: string;
//     parsedDate: string;
//   }
  
//   export interface CurrentPeriod {
//     paycode: string;
//     total_semi_monthly: number;
//     total_sss_employee: number;
//     total_sss_employer: number;
//     total_phil: number;
//     total_pagibig_employee: number;
//     total_pagibig_employer: number;
//     previous: PreviousPeriod[];
//     variance: Variance;
//   }
  



  
export interface VarianceRow {
  rowKey?: string;
  id?: number;
  cycle_category?: string;
  PayCycle: string;
  payroll_period?: string;

  total_basic_salary: string | number;
  Total_SSSContributionEmployee: string | number;
  Total_SSSContributionEmployer: string | number;

  Total_PhilhealthContributionEmployee: string | number;
  Total_PhilhealthContributionEmployer: string | number;

  Total_PagibigContributionEmployee?: string | number;
  Total_PagibigContributionEmployer?: string | number;

  total_wtax?: string | number;
}

export interface CompanyVarianceRow {
  PayCycle: string;

  total_basic_salary?: number;
  Total_SSSContributionEmployee?: number;
  Total_SSSContributionEmployer?: number;

  Total_PhilhealthContributionEmployee?: number;
  Total_PhilhealthContributionEmployer?: number;

  Total_PagibigContributionEmployee?: number;
  Total_PagibigContributionEmployer?: number;

  total_wtax?: number;
}

export interface CompanyVariance {
  company: string | null;
  rows: CompanyVarianceRow[];
}

export interface VarianceResponse {
  total_variance: VarianceRow[];
  company_variance: CompanyVariance[];
}