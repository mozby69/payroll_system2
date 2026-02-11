import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { allowanceprops, SummaryAllowanceProps } from "./allowance.types";
import {  formatAllowanceMonth, getDaysInMonth, getPreviousMonth } from "./allowance.helper";
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
  
    //return employees.map((emp) => {
      const rows = employees.map((emp) => {

      const totalAbsentHours = emp.employeesummary.reduce((sum, row) => sum + Number(row.TotalAbsentHours ?? 0),0);
      const cashAssistance = emp.employeepayroll?.cash_assistance?.toNumber() ?? 0;
      const ecola = emp.employeepayroll?.ecola?.toNumber() ?? 0;
      const cashDailyRate = cashAssistance / daysInPrevMonth;
      const ecolaDailyRate = ecola / daysInPrevMonth;
      const totalCashAllowance = cashAssistance - (cashDailyRate * totalAbsentHours);
      const totalEcola = ecola - (ecolaDailyRate * totalAbsentHours);
      const total = totalCashAllowance + totalEcola;
      const totalDeduction = (cashDailyRate * totalAbsentHours) + (ecolaDailyRate * totalAbsentHours);
  
      return {
        EmpCode: emp.EmpCode,
        name: `${emp.Firstname ?? ""} ${emp.Lastname ?? ""}`.trim(),
        cash_allowance: totalCashAllowance,
        ecola: totalEcola,
        absent: totalAbsentHours,
        total,
        selectedMonth,
        totalDeduction
      };
    });

    const summary = rows.reduce(
      (acc, row) => {
        acc.cash_allowance += row.cash_allowance;
        acc.ecola += row.ecola;
        acc.total += row.total;
        acc.totalDeduction += row.totalDeduction;
        return acc;
      },
      {
        cash_allowance: 0,
        ecola: 0,
        total: 0,
        totalDeduction: 0,
      }
    );
  
    return {
      rows,
      summary,
    };
  }
  
  





  export async function saveAllowanceArchive(selectedMonth: string) {
    // 1️⃣ Check if month already saved (SUMMARY table)
    const existingSummary =
      await prisma.archive_allowance_summary.findUnique({
        where: { selectedMonth },
      });
  
    if (existingSummary) {
      throw new Error("ALLOWANCE_ALREADY_SAVED");
    }
  
    // 2️⃣ Compute allowance
    const { rows, summary } = await computeAllowanceForMonth(selectedMonth);
  
    if (!rows.length) return;
  
    // 3️⃣ Transaction
    await prisma.$transaction(async (tx) => {
      // A. Save SUMMARY first
      await tx.archive_allowance_summary.create({
        data: {
          allowance_name: formatAllowanceMonth(selectedMonth),
          selectedMonth,
          total_cash_allowance: summary.cash_allowance,
          total_ecola: summary.ecola,
          grand_total: summary.total,
          totalDeduction: summary.totalDeduction,
          createdAt: nowPH(),
        },
      });
  
      // B. Save DETAIL rows
      await tx.archive_allowance.createMany({
        data: rows.map((emp) => ({
          EmpCode: emp.EmpCode,
          name: emp.name,
          cash_allowance: emp.cash_allowance,
          ecola: emp.ecola,
          absent: emp.absent,
          total: emp.total,
          totalDeduction: emp.totalDeduction,
          selectedMonth, // FK
          createdAt: nowPH(),
        })),
      });
    });
  }








export async function displayAllowanceList({page,limit,search}: SummaryAllowanceProps) {

  const allowanceWhere: Prisma.archive_allowance_summaryWhereInput = {
  
    ...(search && {
      OR: [
        { allowance_name: { contains: search } }
      ],
    }),
  };


  const allowance_list = await prisma.archive_allowance_summary.findMany({
    where: allowanceWhere,
    skip: (page - 1) * limit,
    take: limit,
      select:{
        allowance_name:true,
        total_cash_allowance:true,
        total_ecola:true,
        grand_total:true,
        totalDeduction:true,
        selectedMonth:true,
      },
      orderBy:{
        id:'desc',
      },
  })
    
  const total = await prisma.archive_allowance_summary.count({ where: allowanceWhere });

  return {
    data:allowance_list,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
  
}




export async function getArchiveAllowanceByMonth(selectedMonth: string) {
  return prisma.archive_allowance.findMany({
    where: {
      selectedMonth,
    },
    select: {
      EmpCode: true,
      name: true,
      cash_allowance: true,
      ecola: true,
      absent: true,
      total: true,
      totalDeduction: true,
      createdAt: true,
    },
    orderBy: {
      EmpCode: 'asc',
    },
  });
}
