import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { toMonth } from "../../helper/prepare_payroll_helper";
import { computeAbsent, computeGrossPay, computeLate, computeOvertime, computePagibig, computePhilRate, computeSemiMonthlySalary, computeSSSContribution, computeSSSContributionEmployer, computeWHTx } from "../prepare_payroll/prepare_payroll.computation";



export async function displayCompletePayroll() {

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
          status:"PENDING",
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
        const sssContribEmployee = Number(computeSSSContribution(basicSalary, sssTable));
        const sssContribEmployer = computeSSSContributionEmployer(basicSalary, sssTable);
        const philhealthRate = computePhilRate(semiMonthly, phil_percentage);
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
        const TaxList = computeWHTx(basicSalary,complete_contrib,tax_list);
   
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
    const computed = await displayCompletePayroll();
  
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
      Basic_salary: Number(emp.EmpCode.employeepayroll?.basic_salary ?? 0),
  
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

    
  
    await prisma.employeeSummary.updateMany({
      where: { status: "PENDING" },
      data: { status: "SAVED" },
    });
  
    return payload.length;
  }
  