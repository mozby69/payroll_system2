

export interface StatutoryProps{
    page: number;
    limit: number;
    search?: string;
}


export interface WtaxListProps{
    page:number;
    limit:number;
    search?:string;
}


export type SaveWtaxMonthlyParams = {
  month: number;
  year: number;
  taxAmount: number;
  empCodeId: string;
};



export interface WTaxTaxPeriodProps{
    page:number;
    limit:number;
    search?:string;
}