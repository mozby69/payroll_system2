import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { toMonth } from "../../helper/prepare_payroll_helper";
import { computeAbsent, computeGrossPay, computeLate, computeOvertime, computePagibig, computePhilRate, computeSemiMonthlySalary, computeSSSContribution, computeSSSContributionEmployer, computeWHTx } from "../prepare_payroll/prepare_payroll.computation";
import { nowPH } from "../../utils/timezone";
import { io } from "../../server";



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
  
    io.emit("payroll:updated");
    return result;
  }
  






  export async function saveComputedFinalPayroll() {
    const computed = await displayCompletePayroll(['FOR_APPROVAL']);
  
    if (!computed || computed.length === 0) return 0;
  
    const payload = computed.map((emp) => ({
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
    }));
  
    await prisma.employeePayrollArchive.createMany({
      data: payload,
      skipDuplicates: true, 
    });


    const payCycle = payload[0].PayCode;
    const cycleCategory = payload[0].cycle_category;
    const payrollPeriod = payload[0].payroll_period;


    await prisma.totalPayroll.create({
        data:{
          PayCycle:payCycle,
          cycle_category:cycleCategory,
          payroll_period:payrollPeriod,
          Total_GrossPay: payload.reduce((sum, emp) => sum + Number(emp.Grosspay ?? 0),0),
          Total_NetPay: payload.reduce((sum, emp) => sum + Number(emp.Netpay ?? 0),0),
          Total_Late: payload.reduce((sum, emp) => sum + Number(emp.Late ?? 0),0),
          Total_Absent: payload.reduce((sum, emp) => sum + Number(emp.Absent ?? 0),0),
          Total_OverTimePay: payload.reduce((sum, emp) => sum + Number(emp.Overtime ?? 0),0),
          Total_SSSContributionEmployee: payload.reduce((sum, emp) => sum + Number(emp.SSS_employee_share ?? 0),0),
          Total_SSSContributionEmployer: payload.reduce((sum, emp) => sum + Number(emp.SSS_employer_share ?? 0),0),
          Total_PagibigContributionEmployee: payload.reduce((sum, emp) => sum + Number(emp.Pagibig_employee_share ?? 0),0),
          Total_PagibigContributionEmployer: payload.reduce((sum, emp) => sum + Number(emp.Pagibig_employer_share ?? 0),0),
          Total_PhilhealthContributionEmployee: payload.reduce((sum, emp) => sum + Number(emp.philhealth_employee_share ?? 0),0),
          Total_PhilhealthContributionEmployer: payload.reduce((sum, emp) => sum + Number(emp.philhealth_employee_share ?? 0),0),
          total_wtax: payload.reduce((sum, emp) => sum + Number(emp.w_tax ?? 0),0),
          total_basic_salary: payload.reduce((sum, emp) => sum + Number(emp.Basic_salary ?? 0),0),
          createdAt:nowPH(),
        },
    });
      
    

  
   await prisma.employeeSummary.updateMany({
      where: { status: "FOR_APPROVAL" },
      data: { status: "DONE" },
    });
  
    return payload.length;
  }
  







  export async function reCheckPayroll() {
   
    const data = await prisma.employeeSummary.updateMany({
      where: { status: "FOR_APPROVAL" },
      data: { status: "PENDING" },
    });

    io.emit("payroll:updated");
  
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
  