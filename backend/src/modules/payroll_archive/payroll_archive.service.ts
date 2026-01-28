import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { toMonth } from "../../helper/prepare_payroll_helper";
import { computeAbsent, computeGrossPay, computeLate, computeOvertime, computePhilRate, computeSemiMonthlySalary, computeSSSContribution, computeSSSContributionEmployer } from "../prepare_payroll/prepare_payroll.computation";





export async function archiveComputedPayroll({cycle,payrollPeriod}: {cycle: string; payrollPeriod: string}) {
 
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

    const paycodes = employees
    .map(e => e.employeesummary[0]?.PayCode)
    .filter((p): p is string => Boolean(p));


    const existingArchives = await prisma.employeePayrollArchive.findMany({
      where: {
        PayCode: { in: paycodes },
      },
      select: {
        PayCode: true,
        EmpCodeId: true,
      },
    });
    

  
    const archiveOps: Prisma.PrismaPromise<any>[] = [];
  
    for (const emp of employees) {
      const summary = emp.employeesummary[0];
      if (!summary) continue;

      const archivedSet = new Set(
        existingArchives.map(r => `${r.PayCode}-${r.EmpCodeId}`)
      );
      

      
      const archiveKey = `${summary.PayCode}-${emp.EmpCode}`;
      if (archivedSet.has(archiveKey)) continue;
      
      const basicSalary = emp.employeepayroll[0]?.basic_salary?.toNumber() ?? 0;
  
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

  
  
    if (archiveOps.length === 0) {
      return {
        archived: false,
        reason: "DUPLICATE",
      };
    }
    await prisma.$transaction(archiveOps);

    return {
      archived: true,
    };
  }
  












  export async function displayCompletePayroll() {

    try{
      const employeeList = await prisma.employeeSummary.findMany({
        where:{
          status:"PENDING"
        },
        select:{
          PayCode:true,
          CycleCategory:true,
          PayrollPeriod:true,
          LateCount:true,
          TotalAbsentHours:true,
          TotalOvertime:true,
          TotalUndertime:true,
          RegularAtt:true,
          OvertimeAtt:true,
          NightShiftAtt:true,
          NightShiftOtAtt:true,
          EmpCodeId:true,
          EmpCode:{
            select:{
              Firstname:true,
              Lastname:true,
              employeepayroll:{
                orderBy:{payroll_id:"desc"},
                take:1,
                select:{
                  basic_salary:true,
                },
              },
            },
            
          },
          
          
        },
      });


      const normalized = employeeList.map((emp) => {
        const basicSalary = Number(emp.EmpCode.employeepayroll[0]?.basic_salary ?? 0);
        const totalLateCount = emp.LateCount ? Number(emp.LateCount): 0;


        const lateCount = computeLate(totalLateCount,basicSalary);
        const semiMonthly =  computeSemiMonthlySalary(basicSalary);
        const overTime = computeOvertime(basicSalary, {
          regular: emp.RegularAtt,
          overtime: emp.OvertimeAtt,
          nightShift: emp.NightShiftAtt,
          nightShiftOt: emp.NightShiftOtAtt,
        });
    
        return {
          ...emp,
          semi_monthly:semiMonthly.toFixed(2),
          overtime:overTime,
          late_count:lateCount,
        };


      });

      return normalized;
    
    }
    catch(error){
      console.error("error occurred",error);
    }

    

  }