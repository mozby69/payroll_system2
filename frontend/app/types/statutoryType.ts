export interface SSSProps {
    sss_contrib_id:number;
    start_range: number;
    end_range: number;
    employee_share: number;
    employer_share: number;

  }
  

  export interface SSSMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  export interface SSSResponse {
    data: SSSProps[];
    meta: SSSMeta;
}
  



export interface PagibigProps {
  pagibig_id:number;
  pagibig_employee_share:number;
  pagibig_employer_share: number;
  EmpCodeId: string;
  Name: string;

}


export interface PagibigMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PagibigResponse {
  data: PagibigProps[];
  meta: PagibigMeta;
}


export interface PhilResponse {
  id:number;
  SettingName:string;
  SettingPercentage:string;
}

export interface WTaxItem {
  id:number;
  start_range:number;
  end_range:number;
  annual_base_tax_bracket:number;
  rate_per_bracket:number;
  annual_base_tax_per_year:number;
}

export type WTaxResponse = WTaxItem[];







export interface TaxBracket {
  start_range: number;
  end_range: number;
  annual_base_tax_bracket: string;
  annual_base_tax_per_year: string;
  rate_per_bracket: string;
}

export interface WtaxComputationListProps {
  EmpCode:string;
  Name:string;
  basic_salary:number;
  philhealth_emp:number;
  sss_emp:number;
  pagibig_emp:number;
  tax:TaxBracket[];
}

export interface WtaxListComputaionResponse {
  data: WtaxComputationListProps[];
  meta: PagibigMeta;
}




export interface DisplayWtaxPaidItem {
  PayCode: string;
  Grosspay: number;
  EmpCodeId: string;
}

export interface DisplayWtaxPaidResponse {
  data: {
    records: DisplayWtaxPaidItem[];
    totalGrossPay: number;
  };
}



export interface MonthlyTaxPayment {
  id: string;
  taxAmount: number;
  isPaid: boolean;
  taxPeriod: {
    id: string;
    month: number;
    year: number;
  };
}

export interface DisplayWtaxResponse {
  data: MonthlyTaxPayment[];
}


export type MonthList = {
  January: number;
  February: number;
  March: number;
  April: number;
  May: number;
  June: number;
  July: number;
  August: number;
  September: number;
  October: number;
  November: number;
  December: number;
};

// types/wtax.types.ts
export type DisplayWtaxFetch = {
  basic_salary: number;
  b2: number;
  a2: number;
  sss_employe_contrib: number;
  philhealth_contrib: number;
  pagibig_contrib: number;
  b3: number;
  b4: number;
  b5: number;
  c3: number;
  c4: number;
  c5: number;
  c2: number;
  d2: number;
  e2: number;
  f2: number;
  h2: number;
  g2: number;
  h3: number;
  i3: number;
  j3: number;
  l3: number;
  j4: number;
  j5: number;
  k3:number;
  month_list: MonthList;
};

export type DisplayWtaxFetchResponse = {
  data: DisplayWtaxFetch | null;
};