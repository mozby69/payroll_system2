import { Prisma } from "@prisma/client";
import { JsonField } from "../../types/utilsTypes";

   

export type EmployeeSummaryTypes = {
    EmpCode_id: string;
    PayCode: string;
    CycleCategory: string;
    PayrollPeriod: string;
    LateCount: number;
    TotalAbsentHours: number;
    TotalUndertime: number;
    TotalOvertime: number;
    RegularAtt: Prisma.InputJsonValue;
    OvertimeAtt: Prisma.InputJsonValue;
    NightShiftAtt: Prisma.InputJsonValue;
    NightShiftOtAtt: Prisma.InputJsonValue;
} 