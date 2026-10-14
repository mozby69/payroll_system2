import { LeaveName, LeaveStatus } from "@prisma/client";

export function mapLeaveName(value: string | null): LeaveName {
  switch (value) {
    case "Maternity":
      return LeaveName.Maternity;
    case "Paternity":
      return LeaveName.Paternity;
    case "Health":
      return LeaveName.Health;
    case "SpecialChild":
      return LeaveName.SpecialChild;
    default:
      throw new Error(`Invalid leaveName: ${value}`);
  }
}

export function mapLeaveStatus(value: string | null): LeaveStatus {
  switch (value) {
    case "Active":
      return LeaveStatus.Active;
    case "Completed":
      return LeaveStatus.Completed;
    case "Expected":
      return LeaveStatus.Expected;
    default:
      throw new Error(`Invalid status: ${value}`);
  }
}