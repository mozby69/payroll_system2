


export interface conversionProps {
  id:number;
  vacation:number;
  sick: number;
  firstname: string;
  lastname: string;
  EmpCode:string;
  total:number;
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
