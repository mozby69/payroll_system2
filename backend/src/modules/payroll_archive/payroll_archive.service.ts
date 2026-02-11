import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { toMonth } from "../../helper/prepare_payroll_helper";
import { computeAbsent, computeGrossPay, computeLate, computeOvertime, computePagibig, computePhilRate, computeSemiMonthlySalary, computeSSSContribution, computeSSSContributionEmployer, computeWHTx } from "../prepare_payroll/prepare_payroll.computation";
import { nowPH } from "../../utils/timezone";
import { io } from "../../server";
import { PayrollDateRange } from "../api/api.types";
import { isPayrollDateRange } from "./payroll_archive.helper";



export async function displayCompletePayroll(statuses:("PENDING" | "FOR_APPROVAL")[]) {
  
    try{
      const sssTable = await prisma.sSS_Contributions.findMany({
        select: {
          start_range: true,
          end_range: true,
          employee_share: true,
          employer_share:true,
        },
        orderBy: {
          start_range: "asc",
        },
      });

      const phil = await prisma.payroll_Parameters.findFirst({ select: { SettingPercentage: true } });

      const tax_list = await prisma.tax_table.findMany({
        select:{
          start_range:true,
          end_range:true,
          annual_base_tax_bracket:true,
          rate_per_bracket:true,
          annual_base_tax_per_year:true,
        },
      });

      const employeeList = await prisma.employeeSummary.findMany({
        where:{
          status: {
            in: statuses,
          },
          EmpCode:{
            EmployeeStatus:{
              notIn: ["Resigned","Inactive","Terminate"],
            },
          }
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
          selected_payroll_date:true,
          EmpCode:{
            select:{
              Firstname:true,
              Lastname:true,
              employeepayroll:{
                select:{
                  basic_salary: true,
                }
              },
                  
            pagibig_list:{
              select:{
                pagibig_id:true,
                pagibig_employee_share:true,
                pagibig_employer_share:true,
              }
            },
            },
            
          },
          
          
        },
        orderBy:{
          EmpCodeId:'asc',
        }
      });


      const normalized = employeeList.map((emp) => {
        const basicSalary = Number(emp.EmpCode.employeepayroll?.basic_salary ?? 0);
        const totalLateCount = emp.LateCount ? Number(emp.LateCount): 0;
        const totalAbsent = emp.TotalAbsentHours ? Number(emp.TotalAbsentHours) : 0;
        const phil_percentage = phil?.SettingPercentage?.toNumber() ?? 0;
        const rawPagibigEmployee = emp.EmpCode.pagibig_list[0]?.pagibig_employee_share?.toNumber() ?? 0;
        const rawPagibigEmployer = emp.EmpCode.pagibig_list[0]?.pagibig_employer_share?.toNumber() ?? 0;
        const Paycodes = emp.PayCode;

        const absent = computeAbsent(totalAbsent,basicSalary);
        const lateCount = computeLate(totalLateCount,basicSalary);
        const semiMonthly =  computeSemiMonthlySalary(basicSalary);
        const sssContribEmployee = Number(computeSSSContribution(basicSalary, sssTable,Paycodes));
        const sssContribEmployer = computeSSSContributionEmployer(basicSalary, sssTable,Paycodes);
        const philhealthRate = computePhilRate(semiMonthly, phil_percentage,Paycodes);
        const pagibigEmployeeShare = computePagibig(rawPagibigEmployee,Paycodes);
        const pagibigEmployerShare = computePagibig(rawPagibigEmployer,Paycodes)
        const complete_contrib = Number(computeSSSContribution(basicSalary, sssTable)) + 
                                  computePhilRate(semiMonthly, phil_percentage) +
                                  computePagibig(rawPagibigEmployee);

        const overTime = computeOvertime(basicSalary, {
          regular: emp.RegularAtt,
          overtime: emp.OvertimeAtt,
          nightShift: emp.NightShiftAtt,
          nightShiftOt: emp.NightShiftOtAtt,
        });
    
        const grossPay = computeGrossPay(overTime,semiMonthly,lateCount,absent);
        const netPay = grossPay - (sssContribEmployee + pagibigEmployeeShare + philhealthRate);
        const TaxList = computeWHTx(basicSalary,complete_contrib,tax_list,Paycodes);
   
        return {
          ...emp,
          semi_monthly:semiMonthly.toFixed(2),
          overtime:overTime,
          late_count:lateCount,
          absence:absent,
          gross_pay:grossPay,
          sss_contrib_employee:sssContribEmployee,
          sss_contrib_employer:sssContribEmployer,
          philhealth_contrib:philhealthRate,
          pagibig_contrib_employee:pagibigEmployeeShare,
          pagibig_contrib_employer:pagibigEmployerShare,
          net_pay:netPay.toFixed(2),
          wtax:TaxList,
        };


      });

      return normalized;
    
    }
    catch(error){
      console.error("error occurred",error);
    }


  }







  









  export async function saveComputedPayroll() {
   
    const result = await prisma.employeeSummary.updateMany({
      where: { status: "PENDING" },
      data: { status: "FOR_APPROVAL" },
    });
  
    io.emit("payroll:changed");
    return result;
  }
  





  export async function saveComputedFinalPayroll() {
    const computed = await displayCompletePayroll(["FOR_APPROVAL"]);
  
    if (!computed || computed.length === 0) return 0;
  
    const payCycle = computed[0].PayCode;
    const cycleCategory = computed[0].CycleCategory;
    const payrollPeriod = computed[0].PayrollPeriod;
    const rawSelectedPayrollDate = computed[0]?.selected_payroll_date;
  
    if (!rawSelectedPayrollDate || !isPayrollDateRange(rawSelectedPayrollDate)) {
      throw new Error("Invalid selected_payroll_date");
    }
  
    // ================= AGGREGATE TOTALS =================
    const totals = computed.reduce(
      (acc, emp) => {
        acc.gross += Number(emp.gross_pay ?? 0);
        acc.net += Number(emp.net_pay ?? 0);
        acc.late += Number(emp.late_count ?? 0);
        acc.absent += Number(emp.absence ?? 0);
        acc.overtime += Number(emp.overtime ?? 0);
        acc.sssEmployee += Number(emp.sss_contrib_employee ?? 0);
        acc.sssEmployer += Number(emp.sss_contrib_employer ?? 0);
        acc.pagibigEmployee += Number(emp.pagibig_contrib_employee ?? 0);
        acc.pagibigEmployer += Number(emp.pagibig_contrib_employer ?? 0);
        acc.philEmployee += Number(emp.philhealth_contrib ?? 0);
        acc.wtax += Number(emp.wtax ?? 0);
        acc.basic += Number(emp.semi_monthly ?? 0);
        return acc;
      },
      {
        gross: 0,
        net: 0,
        late: 0,
        absent: 0,
        overtime: 0,
        sssEmployee: 0,
        sssEmployer: 0,
        pagibigEmployee: 0,
        pagibigEmployer: 0,
        philEmployee: 0,
        wtax: 0,
        basic: 0,
      }
    );
  
    return await prisma.$transaction(async (tx) => {
      // ================= 1️⃣ CREATE TOTAL PAYROLL =================
      const total = await tx.totalPayroll.create({
        data: {
          PayCycle: payCycle,
          cycle_category: cycleCategory,
          payroll_period: payrollPeriod,
          selected_payroll_date: {
            start_date: rawSelectedPayrollDate.start_date,
            end_date: rawSelectedPayrollDate.end_date,
          },
          Total_GrossPay: totals.gross,
          Total_NetPay: totals.net,
          Total_Late: totals.late,
          Total_Absent: totals.absent,
          Total_OverTimePay: totals.overtime,
          Total_SSSContributionEmployee: totals.sssEmployee,
          Total_SSSContributionEmployer: totals.sssEmployer,
          Total_PagibigContributionEmployee: totals.pagibigEmployee,
          Total_PagibigContributionEmployer: totals.pagibigEmployer,
          Total_PhilhealthContributionEmployee: totals.philEmployee,
          Total_PhilhealthContributionEmployer: totals.philEmployee, // if same logic
          total_wtax: totals.wtax,
          total_basic_salary: totals.basic,
          createdAt: nowPH(),
        },
      });
  
      // ================= 2️⃣ INSERT EMPLOYEE ARCHIVES =================
      const archivePayload = computed.map((emp) => ({
        PayCode: emp.PayCode,
        Late: emp.late_count,
        Absent: emp.absence,
        cycle_category: emp.CycleCategory,
        payroll_period: emp.PayrollPeriod,
        Overtime: emp.overtime,
        Grosspay: emp.gross_pay,
        w_tax: emp.wtax,
        Netpay: Number(emp.net_pay),
        Basic_salary: Number(emp.semi_monthly),
  
        SSS_employee_share: emp.sss_contrib_employee,
        SSS_employer_share: emp.sss_contrib_employer,
  
        Pagibig_employee_share: emp.pagibig_contrib_employee,
        Pagibig_employer_share: emp.pagibig_contrib_employer,
  
        philhealth_employee_share: emp.philhealth_contrib,
        philhealth_employer_share: emp.philhealth_contrib,
  
        EmpCodeId: emp.EmpCodeId,
  
        // ✅ FOREIGN KEY LINK
        totalPayrollId: total.id,
      }));
  
      await tx.employeePayrollArchive.createMany({
        data: archivePayload,
        skipDuplicates: true,
      });
  
      // ================= 3️⃣ UPDATE SUMMARY =================
      await tx.employeeSummary.updateMany({
        where: { status: "FOR_APPROVAL" },
        data: { status: "DONE" },
      });
  
      return archivePayload.length;
    }).then((count) => {
      io.emit("payroll:calendarUpdate");
      return count;
    });
  }
  






  export async function reCheckPayroll() {
   
    const data = await prisma.employeeSummary.updateMany({
      where: { status: "FOR_APPROVAL" },
      data: { status: "PENDING" },
    });

    io.emit("payroll:changed");
  
    return data;
  }
  


  
  // export async function displayArchivedData() {
  //   try {
  //     const employeeList = await prisma.employeePayrollArchive.findMany({
  //       where: {
  //         status: "PENDING",
  //       },
  //       include: {
  //         EmpCode: {
  //           select: {
  //             Firstname: true,
  //             Lastname: true,
  //           },
  //         },
  //       },
  //       orderBy: {
  //         EmpCodeId: "asc",
  //       },
  //     });

  //     const normalized = employeeList.map((emp) => {

  //       return {
     
  //         EmpCode:{
  //           Firstname:emp.EmpCode.Firstname,
  //           Lastname:emp.EmpCode.Lastname,
  //         },
  //         semi_monthly:emp.Basic_salary,
  //         overtime:emp.Overtime,
  //         late_count:emp.Late,
  //         absence:emp.Absent,
  //         gross_pay:emp.Grosspay,
  //         wtax:emp.w_tax,
  //         sss_contrib_employee:emp.SSS_employee_share,
  //         philhealth_contrib:emp.philhealth_employee_share,
  //         pagibig_contrib_employee:emp.Pagibig_employee_share,
  //         net_pay:emp.Netpay,
  //         sss_contrib_employer:emp.SSS_employer_share,
  //         pagibig_contrib_employer:emp.Pagibig_employer_share,
  //       };


  //     });

  //     return normalized;

  //   } 

  //   catch (error) {
  //     console.error("error occurred", error);
  //     throw error;
  //   }
  // }
  