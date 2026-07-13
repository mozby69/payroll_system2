export type CycleCategory = "10-25-Cycle" | "15-30-Cycle";

export interface VarianceAmountRow {
  paycode: string;
  basic_pay: number;
  sss_employee: number;
  sss_employer: number;
  phil_employee: number;
  phil_employer: number;
  pagibig_employee: number;
  pagibig_employer: number;
  wtax: number;
}

export interface VarianceComputedRow {
  paycode: string;
  basic_pay_variance: number;
  sss_employee: number;
  sss_employer: number;
  phil_employee: number;
  phil_employer: number;
  pagibig_employee: number;
  pagibig_employer: number;
  wtax: number;
}

export interface VarianceAnalysis {
  current: VarianceAmountRow;
  recent_prev: VarianceAmountRow;
  older_prev: VarianceAmountRow;
  variance: VarianceComputedRow;
}

export interface VarianceResponse {
  data: VarianceAnalysis;
}


// employee variance 



export type VarianceEmployee = {
  EmpCode: string;
  Lastname: string;
  Firstname: string;
  EmploymentStatus: string;

  current_basic: number;
  previous_basic: number;
  basic_variance: number;

  current_sss_employee: number;
  previous_sss_employee: number;
  sss_employee_variance: number;

  current_sss_employer: number;
  previous_sss_employer: number;
  sss_employer_variance: number;

  current_phil_employee: number;
  previous_phil_employee: number;
  phil_employee_variance: number;

  current_pagibig_employee: number;
  previous_pagibig_employee: number;
  pagibig_employee_variance: number;

  current_pagibig_employer: number;
  previous_pagibig_employer: number;
  pagibig_employer_variance: number;

  isCurrentPayroll: boolean;
  isArchiveBasic: boolean;
  isArchiveContribution: boolean;

  leaveName?: string;
  old_salary?: number;
  new_salary?: number;
  remarks?: string;
};


// export type EmployeeVarianceResponse = {
//   data: {
//     Probationary: {
//       employees: VarianceEmployee[];
//     };
//     back_to_work_with_specialleave: {
//       employees: VarianceEmployee[];
//     };
//     back_to_work_without_specialleave: {
//       employees: VarianceEmployee[];
//     };
//     missing_in_current_with_specialleave: {
//       employees: VarianceEmployee[];
//     };
//     missing_in_current_without_specialleave: {
//       employees: VarianceEmployee[];
//     };
//     resigned: {
//       employees: VarianceEmployee[];
//     };
//     salary_adjustment: {
//       increase: VarianceEmployee[];
//       decrease: VarianceEmployee[];
//     };
//   };
// };


export type VarianceEmployee2 = {
  EmpCode: string;
  Lastname: string;
  Firstname: string;
  EmploymentStatus: string;

  basic_variance: number;
  sss_employee_variance: number;
  sss_employer_variance: number;
  phil_employee_variance: number;
  phil_employer_variance: number;
  pagibig_employee_variance: number;
  pagibig_employer_variance: number;
  wtax_variance:number;

  leaveName?: string;
  old_salary?: number;
  new_salary?: number;
  remarks?: string;
};

export type EmployeeVarianceResponse = {
  data: {
    Probationary: {
      employees: VarianceEmployee2[];
    };
    back_to_work_with_specialleave: {
      employees: VarianceEmployee2[];
    };
    back_to_work_without_specialleave: {
      employees: VarianceEmployee2[];
    };
    missing_in_current_with_specialleave: {
      employees: VarianceEmployee2[];
    };
    missing_in_current_without_specialleave: {
      employees: VarianceEmployee2[];
    };
    resigned: {
      employees: VarianceEmployee2[];
    };
    wtax_adjustment:{
      employees: VarianceEmployee2[];
    },
    salary_adjustment: {
      increase: VarianceEmployee2[];
      decrease: VarianceEmployee2[];
    };
  };
};