import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { hrApi } from "../../lib/hrApi";
import { ApiParams } from "../../types/utilsTypes";
import { nowPH } from "../../utils/timezone";
import { EmployeeSummaryTypes } from "./api.types";
import { generatePayCode } from "./api.utils";
import { io } from "../../server";
import { appendMissingBodEmployees, probitionaryEmployees, specialLeaveEmployeesServices } from "../general/general.services";
import { totalmem } from "os";
export async function fetchHrAttendance(params: ApiParams){
  const {startDate, endDate, branchCycle} = params;


  const totatPayroll = await prisma.totalPayroll.findFirst({
    where: {
      cycle_category: branchCycle,
      status: "COMPLETED"
    },
    orderBy: {
      id: "desc"
    }
  })
 const  prevPeriod = totatPayroll?.payroll_period ?? "";
 const api = await hrApi();


  const response = await api.get("/api/attendance/summary/", {
      params: {
          startDate,
          endDate,
          branchCycle,
          prevPeriod
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



  export async function saveEmployeeAttendance(employees: EmployeeSummaryTypes[],branchCycle: string) {
    if (!employees.length) return;
    await prisma.$transaction(async (tx) => {

      //EXCEPT COMPANY 
      const excludedEmployees = await tx.employee.findMany({
      where: {
        EmpCode: {
          in: employees.map((e) => e.EmpCode_id),
        },
        BranchCode: {
          company_id: {
            in: [],
          },
        },
      },
      select: {
        EmpCode: true,
      },
    });
    const excludedSet = new Set(excludedEmployees.map((e) => e.EmpCode));
    const filteredEmployees = employees.filter((emp) => !excludedSet.has(emp.EmpCode_id));
    // END OF EXCEPT COMPANY



      const bodAttendance = await appendMissingBodEmployees(tx, filteredEmployees);
      const probiAttendance = await probitionaryEmployees(tx, filteredEmployees);
      const specialLeaveAttendance = await specialLeaveEmployeesServices(tx, filteredEmployees);
  
      const finalData = [
        ...filteredEmployees.map((emp) => ({
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
          selected_payroll_date: emp.selected_payroll_date,
          createdAt: nowPH(),
          updatedAt: nowPH(),
        })),
        ...bodAttendance,
        ...probiAttendance,
        ...specialLeaveAttendance,
      ];
  
      // 🚀 UPSERT LOOP (SAFE — keeps relations)
      for (const emp of finalData) {
        await tx.employeeSummary.upsert({
          where: {
            PayCode_EmpCodeId_PayrollPeriod: {
              PayCode: emp.PayCode,
              EmpCodeId: emp.EmpCodeId,
              PayrollPeriod: emp.PayrollPeriod,
            },
            status:"PENDING",
          },
          update: {
            CycleCategory: emp.CycleCategory,
            LateCount: emp.LateCount,
            TotalAbsentHours: emp.TotalAbsentHours,
            TotalUndertime: emp.TotalUndertime,
            TotalOvertime: emp.TotalOvertime,
            RegularAtt: emp.RegularAtt,
            OvertimeAtt: emp.OvertimeAtt,
            NightShiftAtt: emp.NightShiftAtt,
            NightShiftOtAtt: emp.NightShiftOtAtt,
            selected_payroll_date: emp.selected_payroll_date,
            updatedAt: nowPH(),
          },
          create: emp,
        });
      }
    });
  }
  






export async function getDisabledPayrollRangesByCycle(cycleCategory: string) {
    const records = await prisma.totalPayroll.findMany({
      where: {
        cycle_category: cycleCategory,
        status:"COMPLETED",
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
  