import { Decimal } from "@prisma/client/runtime/library";

export type PaginationParams = {
    page:number;
    limit:number;
    search?: string;
    payCode?:string;
  }
  

export type SSSRange = {
    start_range: Decimal | null;
    end_range: Decimal | null;
    employee_share: Decimal | null;
    employer_share: Decimal | null;
  };

export type TaxField = {
  start_range: number | null;
  end_range:number | null;
  annual_base_tax_bracket: Decimal | null;
  rate_per_bracket: Decimal | null;
  annual_base_tax_per_year: Decimal | null;
}
  

  export interface FetchEmployeesByCycleParams {
    cycle: "10-25-Cycle" | "15-30-Cycle";
  }
  

  export interface loanProps{
    empCode: string;
    loan_type: "FCH_LOAN" | "SSS_LOAN" | "PAGIBIG_LOAN";
    principal: number;
    term_value: number;
    term_unit: "MONTHS" | "YEARS";
    start_date: Date;
  }
  
  