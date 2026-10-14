export interface SSSProps {
  sss_contrib_id: number;
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
  pagibig_id: number;
  pagibig_employee_share: number;
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
  id: number;
  SettingName: string;
  SettingPercentage: string;
}

export interface WTaxItem {
  id: number;
  start_range: number;
  end_range: number;
  annual_base_tax_bracket: number;
  rate_per_bracket: number;
  annual_base_tax_per_year: number;
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
  EmpCode: string;
  Name: string;
  basic_salary: number;
  philhealth_emp: number;
  sss_emp: number;
  pagibig_emp: number;
  tax: TaxBracket[];
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
  k3: number;
  month_list: MonthList;
};

export type DisplayWtaxFetchResponse = {
  data: DisplayWtaxFetch | null;
};



interface col1Props {
  a2: number;
  basic_salary: number;
  b2: number;
  c2: number;
  d2: number;
  e2: number;
  f2: number;
  g2: number;
  h2: number;
}
interface col2Props {
  philhealth_contrib: number;
  b3: number;
  c3: number;
  h3: number;
  i3: number;
  j3: number;
  k3: number;
  l3: number;
}

interface col3Props {
  sss_employe_contrib: number;
  b4: number;
  c3: number;
  j4: number;
  c4: number;
}
interface col4Props {
  pagibig_contrib: number;
  b5: number;
  c5: number;
  j5: number;
}
interface monthProps {
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
}
interface taxEmpProps {
  EmpCodeId: string;
  PayCode: string;
  Basic_salary: number;
  Grosspay: number;
  philhealth_employee_share: number;
  SSS_employee_share: number
  Pagibig_employee_share: number
  w_tax: number

}
export interface paymentProps {
  EmpCodeId: string;
  taxAmount: string;
  col1: col1Props;
  col2: col2Props;
  col3: col3Props;
  col4: col4Props;
  month_list: monthProps;
  name: string;
  civil_status: string;
  archive_employee_payroll: taxEmpProps[];
}


export interface taxPeriodListProps {
  month: string;
  year: number;
  payments: paymentProps[];
}



export interface WtaxTaxPeriodResponse {
  data: taxPeriodListProps[];
  meta: PagibigMeta;
}