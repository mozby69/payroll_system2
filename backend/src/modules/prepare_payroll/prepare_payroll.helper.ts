import { Prisma } from "@prisma/client";

export type SummaryOverrideChanges = {
  LateCount?: number;
  TotalAbsentHours?: number;
  TotalUndertime?: number;
  TotalOvertime?: number;
  basic_salary?: number;
  philhealth_employee?: number;
  philhealth_employer?: number;
  final_wtax?: number;
};

export function parseSummaryOverrideChanges(
  value: Prisma.JsonValue | null | undefined
): SummaryOverrideChanges {
  if (
    value === null ||
    value === undefined ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  const record = value as Prisma.JsonObject;
  const changes: SummaryOverrideChanges = {};

  if (typeof record.LateCount === "number") {
    changes.LateCount = record.LateCount;
  }

  if (typeof record.TotalAbsentHours === "number") {
    changes.TotalAbsentHours =
      record.TotalAbsentHours;
  }

  if (typeof record.TotalUndertime === "number") {
    changes.TotalUndertime =
      record.TotalUndertime;
  }

  if (typeof record.TotalOvertime === "number") {
    changes.TotalOvertime =
      record.TotalOvertime;
  }

  if (typeof record.basic_salary === "number") {
    changes.basic_salary = record.basic_salary;
  }

  if (
    typeof record.philhealth_employee === "number"
  ) {
    changes.philhealth_employee =
      record.philhealth_employee;
  }

  if (
    typeof record.philhealth_employer === "number"
  ) {
    changes.philhealth_employer =
      record.philhealth_employer;
  }

  if (typeof record.final_wtax === "number") {
    changes.final_wtax = record.final_wtax;
  }

  return changes;
}





//send email payslip

export function formatPayrollPeriod(payCode: string): string {
  const monthMap: Record<string, string> = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  const parts = payCode.split("-");

  if (parts.length !== 4) {
    return payCode;
  }

  const [monthName, startDay, endDay, year] = parts;

  const month = monthMap[monthName];

  if (!month) {
    return payCode;
  }

  const from = `${month}/${startDay.padStart(2, "0")}/${year}`;
  const to = `${month}/${endDay.padStart(2, "0")}/${year}`;

  return `${from}  To  ${to}`;
}