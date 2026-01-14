import { Prisma } from "@prisma/client";

export type DateRange = {
    startDate: string;
    endDate: string;
  };


  export type ApiParams = {
    startDate: string;
    endDate: string;
    branchCycle: string;
  }


  export  type JsonField = | Prisma.JsonValue | string | null | undefined;