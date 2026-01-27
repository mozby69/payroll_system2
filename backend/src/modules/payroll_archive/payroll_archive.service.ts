import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { toMonth } from "../../helper/prepare_payroll_helper";
import { computeAbsent, computeGrossPay, computeLate, computeOvertime, computePhilRate, computeSemiMonthlySalary, computeSSSContribution, computeSSSContributionEmployer } from "../prepare_payroll/prepare_payroll.computation";





export async function archiveComputedPayroll({cycle,payrollPeriod}: {
    cycle: string;
    payrollPeriod: string;
  }) {
    // 1. Reference tables
    const sssTable = await prisma.sSS_Contributions.findMany({
      orderBy: { start_range: "asc" },
    });
  
    const phil = await prisma.payroll_Parameters.findFirst(
        {
            select:{
                SettingName:true,
                SettingPercentage:true,
            }
        }
    );
  
    // 2. Employees with relations
    const employees = await prisma.employee.findMany({
      include: {
        employeepayroll: {
          orderBy: { payroll_id: "desc" },
          take: 1,
        },
        pagibig_list: { take: 1 },
        loan_details: true,
        employeesummary: {
            where: {
                status: "PENDING",
              },
          orderBy: { PayCode: "desc" },
          take: 1,
        },
      },
    });
  
    const archiveOps: Prisma.PrismaPromise<any>[] = [];
  
    for (const emp of employees) {
      const summary = emp.employeesummary[0];
      if (!summary) continue;
  
      const basicSalary =
        emp.employeepayroll[0]?.basic_salary?.toNumber() ?? 0;
  
      const semiPay = computeSemiMonthlySalary(basicSalary);
  
      const sssEmployee = Number(computeSSSContribution(basicSalary, sssTable));
  
      const sssEmployer = Number(computeSSSContributionEmployer(basicSalary, sssTable));
  
      const philRate = Number(computePhilRate(semiPay,phil?.SettingPercentage?.toNumber() ?? 0));
  
      const pagibigEmp = emp.pagibig_list[0]?.pagibig_employee_share?.toNumber() ?? 0;
  
      const pagibigEmployer = emp.pagibig_list[0]?.pagibig_employer_share?.toNumber() ?? 0;
  
      // Loans
      const loans = { FCH: 0, SSS: 0, PAGIBIG: 0 };
      const currentMonth = toMonth(new Date());
  
      for (const loan of emp.loan_details) {
        if (!loan.loan_type || !loan.per_payroll_deduct) continue;
        if (!loan.start_date || !loan.end_date) continue;
  
        const start = toMonth(loan.start_date);
        const end = toMonth(loan.end_date);
  
        if (currentMonth >= start && currentMonth <= end) {
          loans[
            loan.loan_type.replace("_LOAN", "") as keyof typeof loans
          ] = loan.per_payroll_deduct.toNumber();
        }
      }
  
      const late = computeLate(Number(summary.LateCount ?? 0), basicSalary);
  
      const absent = computeAbsent(Number(summary.TotalAbsentHours ?? 0),basicSalary);
  
      const overtime = computeOvertime(basicSalary, {
        regular: summary.RegularAtt,
        overtime: summary.OvertimeAtt,
        nightShift: summary.NightShiftAtt,
        nightShiftOt: summary.NightShiftOtAtt,
      });
  
      const gross = computeGrossPay(overtime,semiPay,late,absent);
  
      const net = gross - (sssEmployee + pagibigEmp + philRate + loans.FCH + loans.SSS + loans.PAGIBIG);
  
    
      archiveOps.push(
        prisma.employeePayrollArchive.create({
          data: {
            PayCode: summary.PayCode,
            EmpCodeId: emp.EmpCode,
  
            cycle_category: cycle,
            selected_payroll_date: payrollPeriod,
  
            Basic_salary: basicSalary,
            Grosspay: gross,
            Netpay: net,
  
            Late: late,
            Absent: absent,
            Overtime: overtime,
  
            SSS_employee_share: sssEmployee,
            SSS_employer_share: sssEmployer,
  
            Pagibig_employee_share: pagibigEmp,
            Pagibig_employer_share: pagibigEmployer,
  
            philhealth_employee_share: philRate / 2,
            philhealth_employer_share: philRate / 2,
  
            ar_e: emp.employeepayroll[0]?.cash_assistance ?? 0,
  
            fch_loan: loans.FCH,
            sss_loan: loans.SSS,
            pagibig_loan: loans.PAGIBIG,
  
            status: "PENDING",
          },
        })
      );
    }
  
    // Optional safety guard
    if (archiveOps.length === 0) {
      return { message: "No payroll records archived" };
    }
  
    // 4. Transaction
    return prisma.$transaction(archiveOps);
  }
  












