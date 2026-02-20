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