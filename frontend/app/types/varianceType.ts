

export interface Variance {
    basic: number;
    sssEmployee: number;
    sssEmployer: number;
    phil: number;
    pagibigEmployee: number;
    pagibigEmployer: number;
  }

  

export interface PreviousPeriod {
    cycle_category: string;
    PayCycle: string;
    total_basic_salary: string;
    payroll_period: string;
    Total_SSSContributionEmployee: string;
    Total_SSSContributionEmployer: string;
    Total_PhilhealthContributionEmployee: string;
    Total_PhilhealthContributionEmployer: string;
    Total_PagibigContributionEmployee: string;
    Total_PagibigContributionEmployer: string;
    total_wtax: string;
    parsedDate: string;
  }
  
  export interface CurrentPeriod {
    paycode: string;
    total_semi_monthly: number;
    total_sss_employee: number;
    total_sss_employer: number;
    total_phil: number;
    total_pagibig_employee: number;
    total_pagibig_employer: number;
    previous: PreviousPeriod[];
    variance: Variance;
  }
  

  export interface VarianceRow {
    PayCycle: string;
    basic: number;
    sssEmployee: number;
    sssEmployer: number;
    phil: number;
  }


export interface VarianceResponse {
  success: boolean;
  current_period: {
    rows: VarianceRow[];
  };
}
