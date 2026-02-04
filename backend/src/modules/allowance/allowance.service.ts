import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { allowanceprops } from "./allowance.types";
import {  getDaysInMonth, getPreviousMonth } from "./allowance.helper";
import { nowPH } from "../../utils/timezone";



export async function fetchAllowanceWithAbsent({page,limit,search,selectedMonth}: allowanceprops) {
    const [year, month] = selectedMonth.split("-").map(Number);
    const prev = getPreviousMonth(year, month);
  
    const monthName = new Date(prev.year, prev.month - 1).toLocaleString("en-US", { month: "long" });
  
    const employeeWhere: Prisma.EmployeeWhereInput = {
      EmployeeStatus: {
        notIn: ["Resigned", "Inactive", "Terminate"],
      },
      ...(search && {
        OR: [
          { EmpCode: { contains: search } },
          { Firstname: { contains: search } },
          { Lastname: { contains: search } },
        ],
      }),
    };
  
    const employees = await prisma.employee.findMany({
      where: employeeWhere,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        EmpCode: true,
        Firstname: true,
        Lastname: true,
        employeepayroll: {
          select: {
            cash_assistance: true,
            ecola: true,
          },
        },
        employeesummary: {
          where: {
            status: "DONE",
            AND: [
              { PayCode: { contains: monthName } },
              { PayCode: { contains: String(prev.year) } },
            ],
          },
          select: {
            TotalAbsentHours: true,
          },
        },
      },
      orderBy: {
        EmpCode: "asc",
      },
    });
  
    const daysInPrevMonth = getDaysInMonth(prev.year, prev.month);

    const normalized = employees.map((emp) => {
        const totalAbsentHours = emp.employeesummary.reduce((sum, row) => sum + Number(row.TotalAbsentHours ?? 0),0);
        const cashAssistance = emp.employeepayroll?.cash_assistance ? emp.employeepayroll.cash_assistance.toNumber() : 0;
        const ecola = emp.employeepayroll?.ecola ? emp.employeepayroll.ecola.toNumber() : 0;
        const cashAssitanceDailyRate = cashAssistance / daysInPrevMonth;
        const ecoalDailyRate = ecola / daysInPrevMonth;
        const totalCashAssistance = cashAssistance - (cashAssitanceDailyRate * totalAbsentHours);
        const totalEcola = ecola - (ecoalDailyRate * totalAbsentHours);
        const totalCash = Number(totalCashAssistance + totalEcola).toFixed(2);
        const x =  (cashAssitanceDailyRate * totalAbsentHours);
        const y = (ecoalDailyRate * totalAbsentHours);
        return {
          EmpCode: emp.EmpCode,
          Firstname: emp.Firstname,
          Lastname: emp.Lastname,
          cash_assistance: emp.employeepayroll?.cash_assistance ?? 0,
          ecola: emp.employeepayroll?.ecola ?? 0,
          totalAbsentHours,
          total:totalCash,
          daysInPrevMonth,
        };
      });
      
  
    const total = await prisma.employee.count({ where: employeeWhere });
  
    return {
      data: normalized,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  












  
export async function computeAllowanceForMonth(selectedMonth: string) {
    const [year, month] = selectedMonth.split("-").map(Number);
    const prev = getPreviousMonth(year, month);
  
    const monthName = new Date(prev.year, prev.month - 1).toLocaleString("en-US", {
      month: "long",
    });
  
    const daysInPrevMonth = getDaysInMonth(prev.year, prev.month);
  
    const employees = await prisma.employee.findMany({
      where: {
        EmployeeStatus: {
          notIn: ["Resigned", "Inactive", "Terminate"],
        },
      },
      select: {
        EmpCode: true,
        Firstname: true,
        Lastname: true,
        employeepayroll: {
          select: {
            cash_assistance: true,
            ecola: true,
          },
        },
        employeesummary: {
          where: {
            status: "DONE",
            AND: [
              { PayCode: { contains: monthName } },
              { PayCode: { contains: String(prev.year) } },
            ],
          },
          select: {
            TotalAbsentHours: true,
          },
        },
      },
    });
  
    return employees.map((emp) => {
      const totalAbsentHours = emp.employeesummary.reduce(
        (sum, row) => sum + Number(row.TotalAbsentHours ?? 0),
        0
      );
  
      const cashAssistance =
        emp.employeepayroll?.cash_assistance?.toNumber() ?? 0;
  
      const ecola =
        emp.employeepayroll?.ecola?.toNumber() ?? 0;
  
      const cashDailyRate = cashAssistance / daysInPrevMonth;
      const ecolaDailyRate = ecola / daysInPrevMonth;
  
      const totalCashAllowance =
        cashAssistance - cashDailyRate * totalAbsentHours;
  
      const totalEcola =
        ecola - ecolaDailyRate * totalAbsentHours;
  
      const total = totalCashAllowance + totalEcola;
  
      return {
        EmpCode: emp.EmpCode,
        name: `${emp.Firstname ?? ""} ${emp.Lastname ?? ""}`.trim(),
        cash_allowance: totalCashAllowance,
        ecola: totalEcola,
        absent: totalAbsentHours,
        total,
        selectedMonth,
      };
    });
  }
  





export async function saveAllowanceArchive(selectedMonth: string) {
    
    const existing = await prisma.archive_allowance.findFirst({
        where: { selectedMonth },
      });
    
      if (existing) {
        throw new Error("ALLOWANCE_ALREADY_SAVED");
      }
    const computed = await computeAllowanceForMonth(selectedMonth);
  
    if (!computed.length) return;
  
    await prisma.$transaction(async (tx) => {
      await tx.archive_allowance.deleteMany({
        where: {
          selectedMonth,
        },
      });
  
      await tx.archive_allowance.createMany({
        data: computed.map((emp) => ({
          EmpCode: emp.EmpCode,
          name: emp.name,
          cash_allowance: emp.cash_allowance,
          ecola: emp.ecola,
          absent: emp.absent,
          total: emp.total,
          selectedMonth: emp.selectedMonth,
          createdAt: nowPH(),
        })),
      });
    });
  }
  