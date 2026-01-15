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
  };
  

  export interface FetchEmployeesByCycleParams {
    cycle: "10-25-Cycle" | "15-30-Cycle";
  }
  