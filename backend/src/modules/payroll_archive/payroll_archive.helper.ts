import { Prisma } from "@prisma/client";
import { PayrollDateRange } from "../api/api.types";
import { PayrollRow } from "./payroll_archive.types";

export function isPayrollDateRange(value: Prisma.JsonValue): value is PayrollDateRange {
    return (
      typeof value === "object" &&
      value !== null &&
      "start_date" in value &&
      "end_date" in value
    );
  }
  



  
export function groupByCompany(data: PayrollRow[]) {
      const grouped: Record<string, PayrollRow[]> = {
        BDO: [],
        PNB: [],
      };
    
      for (const row of data) {
        const companyId =
          row.EmpCode?.BranchCode?.company_id ?? "UNKNOWN";
    
        const bank = companyId === "EMB" ? "BDO" : "PNB";
    
        grouped[bank].push(row);
      }
    
      return grouped;
    }