import { prisma } from "../../config/prismaClient";
import { hrApi } from "../../lib/hrApi";
import { ApiParams } from "../../types/utilsTypes";
import { EmployeeSummaryTypes } from "./api.types";
import { generatePayCode } from "./api.utils";

export async function fetchHrAttendance(params: ApiParams){
    const {startDate, endDate, branchCycle} = params;

    const response = await hrApi.get("/attendance/summary/", {
        params: {
            startDate,
            endDate,
            branchCycle
        },
    });

    return response.data;
}

export function transformAttendanceData(
    hrData: any,
    params: ApiParams
  ): EmployeeSummaryTypes[] {
  
    const cyclePay = hrData.CyclePay;   
    const referenceDate = params.endDate;
    const payCode = generatePayCode(cyclePay, referenceDate);

  
    return (hrData.data ?? []).map((emp: any) => ({
      EmpCode_id: emp.EmpCode_id,
      PayCode: payCode,
      CycleCategory:params.branchCycle,   
      PayrollPeriod: cyclePay,
      LateCount: Number(emp.LateCount ?? 0),
      TotalAbsentHours: Number(emp.TotalAbsentHours ?? 0),
      TotalUndertime: Number(emp.TotalUndertime ?? 0),
      TotalOvertime: Number(emp.TotalOvertime ?? 0),
  
      RegularAtt: emp.RegularAtt ?? {},
      OvertimeAtt: emp.OvertimeAtt ?? {},
      NightShiftAtt: emp.NightShiftAtt ?? {},
      NightShiftOtAtt: emp.NightShiftOtAtt ?? {},
    }));
  }



  export async function saveEmployeeAttendance(
    employees: EmployeeSummaryTypes[]
  ) {
    if (!employees.length) return;
  
    await prisma.employeeSummary.createMany({
      data: employees.map(emp => ({
        EmpCodeId: emp.EmpCode_id,  
        PayCode: emp.PayCode,
        CycleCategory: emp.CycleCategory,
        PayrollPeriod: emp.PayrollPeriod,
        LateCount: emp.LateCount,
        TotalAbsentHours: emp.TotalAbsentHours,
        TotalUndertime: emp.TotalUndertime,
        TotalOvertime: emp.TotalOvertime,
        
        RegularAtt: emp.RegularAtt,
        OvertimeAtt: emp.OvertimeAtt,
        NightShiftAtt: emp.NightShiftAtt,
        NightShiftOtAtt: emp.NightShiftOtAtt,
      })),
      skipDuplicates: true,
    });
  }
  