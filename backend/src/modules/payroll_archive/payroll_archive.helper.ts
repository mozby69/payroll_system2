import { Prisma } from "@prisma/client";
import { PayrollDateRange } from "../api/api.types";

export function isPayrollDateRange(value: Prisma.JsonValue): value is PayrollDateRange {
    return (
      typeof value === "object" &&
      value !== null &&
      "start_date" in value &&
      "end_date" in value
    );
  }
  