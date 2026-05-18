


export interface conversionProps {
  id: number;
  vacation: number;
  sick: number;
  firstname: string;
  lastname: string;
  EmpCode: string;
  total: number;
  leave_convert: boolean;
}


export interface conversionArchiveProps {
  created_at: number;
  company_id: number;
  total_amount: number;
  id: number;
}




export interface conversionMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface conversionResponse {
  data: conversionProps[];
  meta: conversionMeta;
}




export interface conversionArchiveResponse {
  data: conversionArchiveProps[];
  meta: conversionMeta;
}



export interface conversionArchiveList {
  EmpCodeId: string,
  Sick: number,
  Vacation: number,
  basic_salary: number,
  daily_rate: number,
  tenure: number,
  EmployementDate:string;
  leave_amount_for_conversion: number,
  total_leave_for_conversion:number;
  leave_convert:number;
  as_of_date:string;
  EmpCode:{
    Firstname:string;
    Lastname:string;
    employeepayroll:{
      bank_account:string;
    }
  }
  totalConversionArchive:{
    created_at:string;
  }
}




export type TotalsConversionArchive = {
  basic: number;
  daily: number;
  amount: number;
};