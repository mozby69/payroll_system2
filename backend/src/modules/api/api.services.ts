import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { hrApi } from "../../lib/hrApi";
import { ApiParams } from "../../types/utilsTypes";
import { nowPH } from "../../utils/timezone";
import { EmployeeSummaryTypes } from "./api.types";
import { generatePayCode } from "./api.utils";
import { io } from "../../server";

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
      selected_payroll_date: {
        start_date: params.startDate,
        end_date: params.endDate,
      },
    }));
  }



export async function saveEmployeeAttendance(
    employees: EmployeeSummaryTypes[]
  ) {
    if (!employees.length) return;
  

    await prisma.$transaction(async (tx) => {

      const hasForApproval = await tx.employeeSummary.count({
        where: {
          status: "FOR_APPROVAL",
        },
      });
  
      if (hasForApproval > 0) {
        throw new Error(
          "There is an existing approval payroll"
        );
      }

      await tx.employeeSummary.deleteMany({
        where: {
          status: "PENDING",
        },
      });
  
      await tx.employeeSummary.createMany({
        data: employees.map((emp) => ({
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
          selected_payroll_date:emp.selected_payroll_date,
          createdAt: nowPH(),
        })),
        skipDuplicates: true,
      });
    });
  }
  






  export async function getDisabledPayrollRangesByCycle(cycleCategory: string) {
    const records = await prisma.totalPayroll.findMany({
      where: {
        cycle_category: cycleCategory,
        selected_payroll_date: {
          not: Prisma.JsonNull,
        },
      },
      select: {
        selected_payroll_date: true,
      },
    });
  
    return records.map((r) => r.selected_payroll_date).filter(
        (r): r is { start_date: string; end_date: string } =>
          typeof r === "object" &&
          r !== null &&
          "start_date" in r &&
          "end_date" in r
      );
  }
  