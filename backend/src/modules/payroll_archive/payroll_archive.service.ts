import { prisma } from "../../config/prismaClient";
import { computeAbsent, computeGrossPay, computeLate, computeOvertime, computePagibig, computePhilRateEmployee, computePhilRateEmployer, computeSemiMonthlySalary, computeSSSContribution, computeSSSContributionEmployer, computeWHTx } from "../prepare_payroll/prepare_payroll.computation";
import { nowPH } from "../../utils/timezone";
import { io } from "../../server";
import { PayrollDateRange } from "../api/api.types";
import { groupByCompany, isPayrollDateRange } from "./payroll_archive.helper";
import { convertPayrollLabelToPeriod, EmployeeBankAccountsParams, PayrollRow } from "./payroll_archive.types";
import { Console } from "console";
import { getBodPhilhealth, getSSSContributions, getTaxTable } from "../general/general.services";
import { logs_action_type } from "@prisma/client";


export async function employeeProbationary(){

  try{
    // const computed = await displayCompletePayroll(["PENDING"]);
    // if (!computed || computed.length === 0) return 0;
    // const payCycle = computed[0].PayCode;

    // const data1 = await prisma.employee.findMany({
    //   where:{
    //     EmploymentStatus:"Probationary",
    //     EmployeeStatus:"Active"
    //   }
    // })

    // return {data1,payCycle};
    
  }


  catch(error){
    console.log('error occured',error);
  }

}



export async function saveWtaxOverrideService(data: {PayCode: string; EmpCodeId: string; PayrollPeriod: string; computedWtax: number; editedValue: number}) {
  const {PayCode,EmpCodeId, PayrollPeriod,computedWtax, editedValue} = data;

  await prisma.payrollWtaxOverride.create({
    data: {
      PayCode,
      EmpCodeId,
      PayrollPeriod,
      computed_value: computedWtax ?? 0,
      edited_value: editedValue
    }
  });
}



export async function displayCompletePayroll(statuses:("PENDING" | "FOR_CHECKER" | "FOR_APPROVER" )[] ,company_id?:string) {
  
    try{
      const sssTable = await getSSSContributions();
      const phil = await prisma.payroll_Parameters.findFirst({ select: { SettingPercentage: true } });
      const bodPhil = await getBodPhilhealth();
      const tax_list = await getTaxTable();
      

      const baseFilter = {
        EmpCode: {
          BranchCode: {
            company_id: company_id,
          },
        },
      };




      const employeeList = await prisma.employeeSummary.findMany({
        where: {
          AND: [
            {
              status: {
                in: statuses,
              },
            },
        
            {
              OR: [
                // NORMAL
                {
                  AND: [
                    baseFilter,
                    {
                      OR: [
                        {
                          EmpCode: {
                            EmployeeStatus: {
                              notIn: ["Resigned", "Inactive", "Terminate"],
                            },
                          },
                        },
                        {
                          EmpCode: {
                            bod_member: {
                              in: ["bod1", "bod2"],
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
        
                // ALIEN
                {
                  AND: [
                    {
                      EmpCode: {
                        isAlien: true,
                        secondaryBranch:{
                          company_id: company_id
                        }
                      },
                    },
                    {
                      OR: [
                        {
                          EmpCode: {
                            EmployeeStatus: {
                              notIn: ["Resigned", "Inactive", "Terminate"],
                            },
                          },
                        },
                        {
                          EmpCode: {
                            bod_member: {
                              in: ["bod1", "bod2"],
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
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
              EmploymentStatus:true,
              isNewEmployee:true,
              bod_member:true,
              Taxable:true,
              isAlien: true,
              BranchCode:{
                select:{
                  company_id:true,
                },
              },
              employeepayroll:{
                select:{
                  basic_salary: true,
                }
              },
              secondaryBranch: true,
                  
            pagibig_list:{
              select:{
                pagibig_id:true,
                pagibig_employee_share:true,
                pagibig_employer_share:true,
              }
            },
            specialLeaves:{
              select:{
                leaveName: true,
                status:true,
              }
            }
            },
            
          },
        },
        orderBy:{
          EmpCode:{
            Lastname:"asc",
          }
        }
      });

      if (!employeeList || employeeList.length === 0) {
        return [];
      }

      

// loans fetch and query here ↓

    const empCodes = employeeList.map(e => e.EmpCodeId);
    const payrollPeriod = employeeList[0].PayCode;
    const currentPayrollPeriod = convertPayrollLabelToPeriod(payrollPeriod)
    const payCycle = employeeList[0].PayrollPeriod;

    const [payYear, payMonth] = currentPayrollPeriod.split("-").map(Number);
    const payrollCycle = payCycle.split("-")[0];

    const loans = await prisma.loan_details.findMany({
      where: {
        EmpCodeId: { in: empCodes },
        status: "ACTIVE",
        loan_type: {
          in: ["FCH_LOAN", "SSS_LOAN", "PAGIBIG_LOAN", "RFC_LOAN", "ARE_LOAN"],
        },
      },
      select: {
        loan_id: true,
        EmpCodeId: true,
        loan_type: true,
        per_payroll_deduct: true,
      },
    });

    const loanIds = loans.map(l => l.loan_id);

    const ledgers = await prisma.loan_ledger.findMany({
      where: { loan_id: { in: loanIds } },
      orderBy: { transaction_date: "desc" },
    });

    const latestLedger = new Map<number, any>();
    for (const l of ledgers) {
      if (!latestLedger.has(l.loan_id)) {
        latestLedger.set(l.loan_id, l);
      }
    }

    const loanByEmp: Record<string, any> = {};

    for (const loan of loans) {
      const ledger = latestLedger.get(loan.loan_id);

      let alreadyDeducted = false;
      if (ledger) {
        const d = ledger.transaction_date;
        alreadyDeducted =
          d.getFullYear() === payYear &&
          d.getMonth() + 1 === payMonth &&
          ledger.payroll_cycle === payrollCycle;
      }
      
      if (!loanByEmp[loan.EmpCodeId]) {
        loanByEmp[loan.EmpCodeId] = {};
      }

      loanByEmp[loan.EmpCodeId][loan.loan_type] = {
        amount: Number(loan.per_payroll_deduct),
        alreadyDeducted,
      };

      
    }

    const loanDeduct = (loan?: { amount: number; alreadyDeducted: boolean }) =>
      loan && !loan.alreadyDeducted ? loan.amount : 0;

// loans fetch and query here ↑




      //wtax override 
      const overrides = await prisma.payrollWtaxOverride.findMany({
        where: {
          OR: employeeList.map((e) => ({
            PayCode: e.PayCode,
            EmpCodeId: e.EmpCodeId,
            PayrollPeriod: e.PayrollPeriod
          }))
        },
        orderBy: { created_at: "desc" }
      });

      const overrideMap = new Map<string, number>();

      for (const o of overrides) {
        const key = `${o.PayCode}_${o.EmpCodeId}_${o.PayrollPeriod}`;
        if (!overrideMap.has(key)) {
          overrideMap.set(key, Number(o.edited_value));
        }
      }
      //wtax override

      const normalized = employeeList.map((emp) => {
        
        const basicSalary = Number(emp.EmpCode.employeepayroll?.basic_salary ?? 0);
        const totalLateCount = emp.LateCount ? Number(emp.LateCount): 0;
        const totalUndertimeCount = emp.TotalUndertime ? Number(emp.TotalUndertime): 0;
        const totalAbsent = emp.TotalAbsentHours ? Number(emp.TotalAbsentHours) : 0;
        const phil_percentage = phil?.SettingPercentage?.toNumber() ?? 0;
        const rawPagibigEmployee = emp.EmpCode.pagibig_list[0]?.pagibig_employee_share?.toNumber() ?? 0;
        const rawPagibigEmployer = emp.EmpCode.pagibig_list[0]?.pagibig_employer_share?.toNumber() ?? 0;
        const Paycodes = emp.PayCode;
        const isNewProbi = emp.EmpCode.EmploymentStatus === "Probationary" && emp.EmpCode.isNewEmployee;
        const isBod = emp.EmpCode.bod_member?.trim().toLowerCase() === "bod1";
        const isTaxable = emp.EmpCode.Taxable;

        const bodMap = new Map(
          bodPhil.map((b) => [
            b.EmpCodeId.trim().toUpperCase(),
            b.employee_share?.toNumber() ?? 0,
          ])
        );
        
        const normalizedId = emp.EmpCodeId.trim().toUpperCase();
        const bodShare = bodMap.get(normalizedId) ?? 0;
        


     

        const absent = computeAbsent(totalAbsent,basicSalary);
        const lateCount = computeLate(totalLateCount,basicSalary);
        const undertimeCount = computeLate(totalUndertimeCount,basicSalary);
        const semiMonthly =  computeSemiMonthlySalary(basicSalary);
        const sssContribEmployee = Number(computeSSSContribution(basicSalary, sssTable,isNewProbi,Paycodes));
        const sssContribEmployer = computeSSSContributionEmployer(basicSalary, sssTable,isNewProbi,Paycodes,);
        const philhealthRateEmployee = computePhilRateEmployee(semiMonthly, phil_percentage,isBod,bodShare,isNewProbi,Paycodes);
        const philhealthRateEmployer = computePhilRateEmployer(basicSalary, phil_percentage,isBod,bodShare,isNewProbi,Paycodes);
        const pagibigEmployeeShare = computePagibig(rawPagibigEmployee,Paycodes);
        const pagibigEmployerShare = computePagibig(rawPagibigEmployer,Paycodes);
        const complete_contrib = Number(computeSSSContribution(basicSalary, sssTable,isNewProbi))
                                +  computePhilRateEmployee(semiMonthly, phil_percentage,isNewProbi)
                                + pagibigEmployeeShare;


    
        // Loan Code ↓

        const loans = loanByEmp[emp.EmpCodeId] ?? {};
        const fch_loan = loanDeduct(loans.FCH_LOAN);
        const sss_loan = loanDeduct(loans.SSS_LOAN);
        const pagibig_loan = loanDeduct(loans.PAGIBIG_LOAN);
        const rfc_loan = loanDeduct(loans.RFC_LOAN);
        const are_loan = loanDeduct(loans.ARE_LOAN);
        // Loan Code ↑

        const totalLoanDeduction = fch_loan + sss_loan + pagibig_loan + rfc_loan + are_loan;


        const overTime = computeOvertime(basicSalary, {
          regular: emp.RegularAtt,
          overtime: emp.OvertimeAtt,
          nightShift: emp.NightShiftAtt,
          nightShiftOt: emp.NightShiftOtAtt,
        });
        const computedWtax  = computeWHTx(basicSalary,complete_contrib,tax_list,isTaxable,Paycodes);

        const key = `${emp.PayCode}_${emp.EmpCodeId}_${emp.PayrollPeriod}`;
        const overrideValue = overrideMap.get(key);
    
        const finalWtax = overrideValue ?? computedWtax;


        const grossPay = computeGrossPay(overTime,semiMonthly,lateCount,undertimeCount,absent);
        const netPay = grossPay - (sssContribEmployee + pagibigEmployeeShare + philhealthRateEmployee +totalLoanDeduction + finalWtax);
    
        const companyId = emp.EmpCode.BranchCode?.company_id;

        const totalDeductions = totalLoanDeduction + finalWtax + sssContribEmployee + pagibigEmployeeShare + philhealthRateEmployee;

        // console.log("total",emp.EmpCode.Firstname,'totaldeduct-',totalDeductions);
      
        return {
          ...emp,
          semi_monthly:semiMonthly.toFixed(2),
          overtime:overTime,
          late_count:lateCount,
          undertime:undertimeCount,
          absence:absent,
          gross_pay:grossPay,

          // Loan Code ↓
          fch_loan,
          sss_loan,
          pagibig_loan,
          rfc_loan,
          are_loan,
          // Loan Code ↑

          sss_contrib_employee:sssContribEmployee,
          sss_contrib_employer:sssContribEmployer,
          philhealth_contrib_employee:philhealthRateEmployee,
          philhealth_contrib_employer:philhealthRateEmployer,
          pagibig_contrib_employee:pagibigEmployeeShare,
          pagibig_contrib_employer:pagibigEmployerShare,
          net_pay:netPay,
          wtax: finalWtax,          
          computedWtax: computedWtax,
          company_id:companyId,
          total_deductions:totalDeductions,
      
        };
 

      });



      return normalized;
    
    }
    catch(error){
      console.error("error occurred",error);
    }


  }







  









  export async function saveComputedPayroll(company_id:string) {
   
    const result = await prisma.employeeSummary.updateMany({
      where: {
        OR:[
          {
            status: "PENDING",
            EmpCode:{
             BranchCode:{
               company_id:company_id,
             }
            } 
          },
             {
              AND: [
                { 
                  EmpCode:{
                  isAlien: true,
                  secondaryBranch: {
                    company_id: company_id,
                  },
                  }
                },
      
                {
                  status: "PENDING",
                }
              ]
            }
        ]
        },
      data: { status: "FOR_CHECKER" },
    });
  
    io.emit("payroll:changed");
    return result;
  }


  





  export async function saveComputedFinalPayroll(cycle: "10-25-Cycle" | "15-30-Cycle",companyId: string,approvedBy:number) {
    return await prisma.$transaction(async (tx) => {
  
     
  
      // ── Filter computed payroll to this company only ────────────────────────
      const allComputed = await displayCompletePayroll(["FOR_APPROVER"]);
      if (!allComputed || allComputed.length === 0) return 0;
  
      const computed = allComputed.filter((e) => 
        e.company_id === companyId
               ||
       ( e.EmpCode?.isAlien === true &&
        e.EmpCode?.secondaryBranch?.company_id === companyId)
      );
      if (computed.length === 0) return 0;
  
      const empCodes        = computed.map((e) => e.EmpCodeId);
      const payrollPeriod   = computed[0].PayCode;
      const payCycle        = computed[0].PayrollPeriod;
      const payrollCycle    = payCycle.split("-")[0];
      const cycleCategory   = cycle;
  
      const currentPayrollPeriod = convertPayrollLabelToPeriod(payrollPeriod);
      const [payYear, payMonth]  = currentPayrollPeriod.split("-").map(Number);
  
      const rawSelectedPayrollDate = computed[0]?.selected_payroll_date;
      if (!rawSelectedPayrollDate || !isPayrollDateRange(rawSelectedPayrollDate)) {
        throw new Error("Invalid selected_payroll_date");
      }
  
      // ── Loans ───────────────────────────────────────────────────────────────
      const loans = await tx.loan_details.findMany({
        where: {
          EmpCodeId: { in: empCodes },
          status: "ACTIVE",
          loan_type: { in: ["FCH_LOAN", "SSS_LOAN", "PAGIBIG_LOAN", "RFC_LOAN", "ARE_LOAN"] },
        },
        select: { loan_id: true, EmpCodeId: true, loan_type: true, per_payroll_deduct: true },
      });
  
      const loanIds = loans.map((l) => l.loan_id);
      const ledgers = await tx.loan_ledger.findMany({
        where: { loan_id: { in: loanIds } },
        orderBy: { transaction_date: "desc" },
      });
  
      const latestLedger = new Map<number, any>();
      for (const l of ledgers) {
        if (!latestLedger.has(l.loan_id)) latestLedger.set(l.loan_id, l);
      }
  
      const loanByEmp: Record<string, any> = {};
      for (const loan of loans) {
        const ledger = latestLedger.get(loan.loan_id);
        let alreadyDeducted = false;
        if (ledger) {
          const d = ledger.transaction_date;
          alreadyDeducted =
            d.getFullYear() === payYear &&
            d.getMonth() + 1 === payMonth &&
            ledger.payroll_cycle === payrollCycle;
        }
        if (!loanByEmp[loan.EmpCodeId]) loanByEmp[loan.EmpCodeId] = {};
        loanByEmp[loan.EmpCodeId][loan.loan_type] = {
          loan_id: loan.loan_id,
          amount: Number(loan.per_payroll_deduct),
          alreadyDeducted,
        };
      }
  
      const loanDeduct = (loan?: { amount: number; alreadyDeducted: boolean }) =>
        loan && !loan.alreadyDeducted ? loan.amount : 0;
  
      const companyTotals = computed.reduce(
        (acc, emp) => {
          acc.gross       += Number(emp.gross_pay ?? 0);
          acc.net         += Number(emp.net_pay ?? 0);
          acc.late        += Number(emp.late_count ?? 0);
          acc.undertime   += Number(emp.undertime ?? 0);
          acc.absent      += Number(emp.absence ?? 0);
          acc.overtime    += Number(emp.overtime ?? 0);
          acc.sssEmp      += Number(emp.sss_contrib_employee ?? 0);
          acc.sssEr       += Number(emp.sss_contrib_employer ?? 0);
          acc.pagibigEmp  += Number(emp.pagibig_contrib_employee ?? 0);
          acc.pagibigEr   += Number(emp.pagibig_contrib_employer ?? 0);
          acc.philEmp     += Number(emp.philhealth_contrib_employee ?? 0);
          acc.philEr      += Number(emp.philhealth_contrib_employer ?? 0);
          acc.wtax        += Number(emp.wtax ?? 0);
          acc.basic       += Number(emp.semi_monthly ?? 0);
          return acc;
        },
        {
          gross: 0, net: 0, late: 0, undertime: 0, absent: 0, overtime: 0,
          sssEmp: 0, sssEr: 0, pagibigEmp: 0, pagibigEr: 0,
          philEmp: 0, philEr: 0, wtax: 0, basic: 0,
        }
      );
  

      const existingTotal = await tx.totalPayroll.findFirst({
        where: {
          PayCycle: payrollPeriod,
          cycle_category: cycleCategory,
        },
      });
  
      let totalPayrollRecord;
  
      if (!existingTotal) {
        // First company saving — create the totalPayroll row
        totalPayrollRecord = await tx.totalPayroll.create({
          data: {
            PayCycle: payrollPeriod,
            cycle_category: cycleCategory,
            payroll_period: payCycle,
            status: "IN_PROGRESS",
            selected_payroll_date: {
              start_date: rawSelectedPayrollDate.start_date,
              end_date: rawSelectedPayrollDate.end_date,
            },
            Total_GrossPay:                    companyTotals.gross,
            Total_NetPay:                      companyTotals.net,
            Total_Late:                        companyTotals.late,
            Total_Absent:                      companyTotals.absent,
            Total_OverTimePay:                 companyTotals.overtime,
            Total_SSSContributionEmployee:     companyTotals.sssEmp,
            Total_SSSContributionEmployer:     companyTotals.sssEr,
            Total_PagibigContributionEmployee: companyTotals.pagibigEmp,
            Total_PagibigContributionEmployer: companyTotals.pagibigEr,
            Total_PhilhealthContributionEmployee: companyTotals.philEmp,
            Total_PhilhealthContributionEmployer: companyTotals.philEr,
            total_wtax:                        companyTotals.wtax,
            total_basic_salary:                companyTotals.basic,
            Total_Undertime:                   companyTotals.undertime,
            createdAt: nowPH(),
          },
        });
      } else {
        // Subsequent company — accumulate totals into the existing row
        totalPayrollRecord = await tx.totalPayroll.update({
          where: { id: existingTotal.id },
          data: {
            Total_GrossPay:                    { increment: companyTotals.gross },
            Total_NetPay:                      { increment: companyTotals.net },
            Total_Late:                        { increment: companyTotals.late },
            Total_Absent:                      { increment: companyTotals.absent },
            Total_OverTimePay:                 { increment: companyTotals.overtime },
            Total_SSSContributionEmployee:     { increment: companyTotals.sssEmp },
            Total_SSSContributionEmployer:     { increment: companyTotals.sssEr },
            Total_PagibigContributionEmployee: { increment: companyTotals.pagibigEmp },
            Total_PagibigContributionEmployer: { increment: companyTotals.pagibigEr },
            Total_PhilhealthContributionEmployee: { increment: companyTotals.philEmp },
            Total_PhilhealthContributionEmployer: { increment: companyTotals.philEr },
            total_wtax:                        { increment: companyTotals.wtax },
            total_basic_salary:                { increment: companyTotals.basic },
            Total_Undertime:                   { increment: companyTotals.undertime },
          },
        });
      }
  
      // ── 2️⃣ Create totalPayrollByCompany for this company ───────────────────
      await tx.totalPayrollByCompany.create({
        data: {
          total_payroll_id: totalPayrollRecord.id,
          company_id: companyId,
          PayCycle: payrollPeriod,
          cycle_category: cycleCategory,
          payroll_period: payCycle,
          selected_payroll_date: {
            start_date: rawSelectedPayrollDate.start_date,
            end_date: rawSelectedPayrollDate.end_date,
          },
          Total_GrossPay:                    companyTotals.gross,
          Total_NetPay:                      companyTotals.net,
          Total_Late:                        companyTotals.late,
          Total_Absent:                      companyTotals.absent,
          Total_OverTimePay:                 companyTotals.overtime,
          Total_SSSContributionEmployee:     companyTotals.sssEmp,
          Total_SSSContributionEmployer:     companyTotals.sssEr,
          Total_PagibigContributionEmployee: companyTotals.pagibigEmp,
          Total_PagibigContributionEmployer: companyTotals.pagibigEr,
          Total_PhilhealthContributionEmployee: companyTotals.philEmp,
          Total_PhilhealthContributionEmployer: companyTotals.philEr,
          total_wtax:                        companyTotals.wtax,
          total_basic_salary:                companyTotals.basic,
          Total_Undertime:                   companyTotals.undertime,
          createdAt: nowPH(),
        },
      });
  
      // ── 3️⃣ Employee archives (this company only) ───────────────────────────
      const archivePayload = computed.map((emp) => {
        const empLoans = loanByEmp[emp.EmpCodeId] ?? {};
        return {
          PayCode:                   emp.PayCode,
          Late:                      emp.late_count,
          undertime:                 emp.undertime,
          Absent:                    emp.absence,
          cycle_category:            emp.CycleCategory,
          payroll_period:            emp.PayrollPeriod,
          Overtime:                  emp.overtime,
          Grosspay:                  emp.gross_pay,
          w_tax:                     emp.wtax,
          Netpay:                    Number(emp.net_pay),
          Basic_salary:              Number(emp.semi_monthly),
          SSS_employee_share:        emp.sss_contrib_employee,
          SSS_employer_share:        emp.sss_contrib_employer,
          Pagibig_employee_share:    emp.pagibig_contrib_employee,
          Pagibig_employer_share:    emp.pagibig_contrib_employer,
          philhealth_employee_share: emp.philhealth_contrib_employee,
          philhealth_employer_share: emp.philhealth_contrib_employer,
          fch_loan:                  loanDeduct(empLoans.FCH_LOAN),
          sss_loan:                  loanDeduct(empLoans.SSS_LOAN),
          pagibig_loan:              loanDeduct(empLoans.PAGIBIG_LOAN),
          rfc_loan:                  loanDeduct(empLoans.RFC_LOAN),
          ar_e:                      loanDeduct(empLoans.ARE_LOAN),
          isNewEmployee:             emp.EmpCode.isNewEmployee,
          EmpCodeId:                 emp.EmpCodeId,
          totalPayrollId:            totalPayrollRecord.id,
          total_deductions:          emp.total_deductions,
        };
      });


      console.log("Arcvhive: ", archivePayload)
  
      await tx.employeePayrollArchive.createMany({
        data: archivePayload,
        skipDuplicates: true,
      });
  
      // ── Loan ledger entries ─────────────────────────────────────────────────
      const transaction_date = nowPH();
      for (const emp of computed) {
        const empLoans = loanByEmp[emp.EmpCodeId];
        if (!empLoans) continue;
        for (const loanType of Object.keys(empLoans)) {
          const loan = empLoans[loanType];
          if (loan.alreadyDeducted) continue;
          await tx.loan_ledger.create({
            data: {
              loan_id:          loan.loan_id,
              EmpCodeId:        emp.EmpCodeId,
              transaction_date,
              payroll_cycle:    payrollCycle,
              transaction_type: "PAYROLL_DEDUCT",
              debit_amount:     0,
              credit_amount:    loan.amount,
              remarks:          "Loan Credited to Payroll",
              payment_status:   "PAID",
            },
          });
        }
      }

      const disbursingEmployees = await tx.employee.findMany({
        where: { EmpCode: { in: empCodes }, Disbursing: true },
        select: { EmpCode: true },
      });
  
      if (disbursingEmployees.length !== 0) {
        const disbursingEmpCodes = disbursingEmployees.map((e) => e.EmpCode);
        const disburseArchives = await tx.employeePayrollArchive.findMany({
          where: { EmpCodeId: { in: disbursingEmpCodes }, totalPayrollId: totalPayrollRecord.id },
          select: { id: true, Netpay: true, EmpCodeId: true },
        });
  
        const totalDisburseAmount = disburseArchives.reduce(
          (sum, emp) => sum + Number(emp.Netpay ?? 0), 0
        );
  
        const mainDisburse = await tx.main_disburse.create({
          data: {
            typeDisburse:   "PAYROLL",
            payrollPeriod:  payrollPeriod,
            payrollCycle:   cycleCategory,
            createdAt:      nowPH(),
            totalDisburse:  totalDisburseAmount,
          },
        });
  
        await tx.emp_disburse.createMany({
          data: disburseArchives.map((archive) => ({
            empArchiveId:    archive.id,
            mainDisburseId:  mainDisburse.mainDisburseID,
          })),
        });
      }


      await prisma.payrollProcessingLog.create({
        data: {
          PayCode: payrollPeriod,
          PayrollPeriod: payCycle,
          CycleCategory: cycleCategory,
          action: logs_action_type.SAVE_FINAL_PAYROLL,
          userId:approvedBy,
          companyCode:companyId,
        }
      });

  
   
      await tx.employeeSummary.updateMany({
        where: {
          AND: [
            {
              status: "FOR_APPROVER",
              CycleCategory: cycle,
            },
            
            {
              OR:[

                {
                  EmpCode: {
                    BranchCode: { CompanyCode: { CompanyCode: companyId } }
                  },
                },

                {
                  AND: [
                    {
                      EmpCode: {
                        isAlien: true,
                        secondaryBranch:{
                          company_id: companyId
                        }
                      },
                    },
                  ]
                }

              ]
            }
          ]
        },
        data: { status: "DONE" },
      });
  

     await tx.employee.updateMany({
    where: {
      AND: [
        {
          isNewEmployee: true,
        }, 

        {

          OR: [
            {
              BranchCode: {
                CompanyCode: {
                  is: {
                    CompanyCycle: cycle,
                    CompanyCode: companyId,
                  },
                },
              },
            },
            {
              AND: [
                {
                    isAlien: true,
                    secondaryBranch:{
                      company_id: companyId
                  },
                },
              ]
            }
          ]
        }
      ]

   
    },


    data: {
      isNewEmployee: false,
    },
  });
  

      const remainingForApprover = await tx.employeeSummary.findFirst({
        where: {
          status: {
            in: ["PENDING", "FOR_CHECKER", "FOR_APPROVER"]
          },
          CycleCategory: cycle,
        },
      });
  
      if (!remainingForApprover) {
        await tx.totalPayroll.update({
          where: { id: totalPayrollRecord.id },
          data: { status: "COMPLETED" },
        });
      }
  
      return archivePayload.length;
  
    }).then((count) => {
      io.emit("payroll:calendarUpdate");
      return count;
    });
  }
  






  export async function reCheckPayroll(company_id:string){
   
    const data = await prisma.employeeSummary.updateMany({
       where: { 
        AND:[
          {
            status: "FOR_CHECKER",
          },
          {
            OR: [
              { 
              EmpCode:{
                BranchCode:{
                  company_id:company_id,
                }
              }
              },
              {
                EmpCode:{
                  secondaryBranch:{
                    company_id: company_id
                  }
                }
              }
            ]
          }
        ]
       
       },
      data: { status: "PENDING" },
    });

    io.emit("payroll:changed");
  
    return data;
}


export async function reCheckPayrollToChecker(company_id:string,approvedBy:number){

  const computed = await displayCompletePayroll(["FOR_APPROVER"]);
  if (!computed || computed.length === 0) return 0;

  const paycode = computed[0].PayCode;
  const payrollperiod = computed[0].PayrollPeriod;
  const cycle = computed[0].CycleCategory;

  await prisma.payrollProcessingLog.create({
    data: {
      PayCode: paycode,
      PayrollPeriod: payrollperiod,
      CycleCategory: cycle,
      action: logs_action_type.REOPEN_TO_CHECKER,
      userId:approvedBy,
      companyCode:company_id,
    }
  });

   
  const data = await prisma.employeeSummary.updateMany({
    where: { 
      AND:[
        {
          status: "FOR_APPROVER",
        },
        {
          OR: [
            { 
            EmpCode:{
              BranchCode:{
                company_id:company_id,
              }
            }
            },
            {
              EmpCode:{
                secondaryBranch:{
                  company_id: company_id
                }
              }
            }
          ]
        }
      ]
     
     },
    data: { status: "FOR_CHECKER" },
  });


 


  io.emit("payroll:changed");

  return data;
}

  


export async function SaveToApproverPayroll(company_id:string,approvedBy:number){
  const computed = await displayCompletePayroll(["FOR_CHECKER"]);
  if (!computed || computed.length === 0) return 0;

  const paycode = computed[0].PayCode;
  const payrollperiod = computed[0].PayrollPeriod;
  const cycle = computed[0].CycleCategory;

  if (!paycode || !payrollperiod || !cycle) {
    throw new Error("Invalid payroll data for logging");
  }

  await prisma.payrollProcessingLog.create({
    data: {
      PayCode: paycode,
      PayrollPeriod: payrollperiod,
      CycleCategory: cycle,
      action: logs_action_type.SAVE_TO_APPROVER,
      userId:approvedBy,
      companyCode:company_id,
    }
  });

   
  const data = await prisma.employeeSummary.updateMany({
    where: {
      AND: [
        {
          status: "FOR_CHECKER",
        },
        {
          OR: [
            {
              EmpCode:{
                BranchCode:{
                  company_id:company_id,
                }
                } 
            },
            {
              AND: [
                {
                  EmpCode: {
                    isAlien: true,
                    secondaryBranch:{
                      company_id: company_id
                    }
                  },
                },
              ],
            }
          ]
        }
       
      ]
           
     },
    data: { status: "FOR_APPROVER" },
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


  type GetTotalPayrollParams = {
    page?: number
    pageSize?: number
    search?: string
    payCycle?: string
  }
  
  export async function getTotalPayrollService({
    page = 1,
    pageSize = 10,
    search,
    payCycle,
  }: GetTotalPayrollParams) {
    const skip = (page - 1) * pageSize
  
    const where: any = {}
  
    // Search (partial match)
    if (search) {
      where.PayCycle = {
        contains: search
      }
    }
  
    // Exact filter
    if (payCycle) {
      where.PayCycle = payCycle
    }
  
    const [data, total] = await Promise.all([
      prisma.totalPayroll.findMany({
        where,
        orderBy: {
          PayCycle: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.totalPayroll.count({ where }),
    ])
  
    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }

  type GetEmployeeArchivedParams = {
    page?: number
    pageSize?: number
    search?: string
    totalPayrollId: number
    selectedCompany?: string
    selectedBranch?: string
  }

  export async function getEmployeeArchivedService(params: GetEmployeeArchivedParams) {

    const { page = 1, pageSize = 10 } = params;
  
    const skip = (page - 1) * pageSize;
  
    const where = buildEmployeeArchivedWhere(params);
  
    const [data, total] = await Promise.all([
      prisma.employeePayrollArchive.findMany({
        where,
        include: {
          EmpCode: {
            select: {
              Firstname: true,
              Middlename: true,
              Lastname: true,
              BranchCodeId: true,
            }
          }
        },
        orderBy: {
          EmpCode: { Lastname: "asc" }
        },
        skip,
        take: pageSize
      }),
      prisma.employeePayrollArchive.count({ where })
    ]);
  
    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  function buildEmployeeArchivedWhere({
    totalPayrollId,
    selectedCompany,
    selectedBranch,
    search
  }: {
    totalPayrollId: number
    selectedCompany?: string
    selectedBranch?: string
    search?: string
  }) {
  
    const where: any = {
      totalPayrollId,
    };
  
    if (selectedCompany || selectedBranch) {
      where.EmpCode = {
        BranchCode: {
          ...(selectedCompany && { company_id: selectedCompany }),
          ...(selectedBranch && { branchCode: selectedBranch }),
        },
      };
    }
  
    if (search && search.trim() !== "") {
      where.OR = [
        { EmpCodeId: { contains: search } },
        { EmpCode: { Firstname: { contains: search } } },
        { EmpCode: { Lastname: { contains: search } } },
      ];
    }
  
    return where;
  }


  export async function printEmployeeArchivedService(params: GetEmployeeArchivedParams) {

    const where = buildEmployeeArchivedWhere(params);
    const data = await prisma.employeePayrollArchive.findMany({
      where,
      include: {
        EmpCode: {
          select: {
            Firstname: true,
            Middlename: true,
            Lastname: true,
            BranchCodeId: true
          }
        }
      },
      orderBy: {
        EmpCode: { Lastname: "asc" }
      }
    });
    return data;
  }
  















  //XYRYL CODE ***********************************************************************

export async function displayBankAdminBDO(){
  try{
    const data = await prisma.bankAccountAdmin.findMany({
      where:{
        bank_name:"BDO"
      }
    });
    return data;
  }
  catch(error){
    console.error("Error occured",error);
  }
}


  export async function ViewEmployeeBankAccounts({PayCode,cycle_category,company_id}: EmployeeBankAccountsParams) {
    try {
      const employeeList = await prisma.employeePayrollArchive.findMany({
        where: {
          PayCode,
          cycle_category,
          EmpCode: {
            BranchCode:{
              company_id:company_id,
            },
            Disbursing: {
              not: true,
            },
          },
        },
        select: {
          id:true,
          PayCode: true,
          cycle_category: true,
          Netpay: true,
          EmpCodeId:true,
          EmpCode: {
            
            select: {
              Firstname: true,
              Lastname: true,
              BranchCodeId:true,
              Disbursing:true,
              employeepayroll:{
                select:{
                  bank_account:true,
                }
              },
              BranchCode: {
                select: {
                  company_id: true,
                },
              },
            },
            
          },
          
        },
        orderBy:{
          EmpCode:{
            Lastname:"asc",
          }
        }
      });
  

      const normalized: PayrollRow[] = employeeList.map((row) => ({

        id:row.id,
        PayCode: row.PayCode,
        cycle_category: row.cycle_category,
        Netpay: row.Netpay?.toNumber() ?? 0,
        BranchCodeId:row.EmpCode.BranchCodeId,
        EmpCodeId:row.EmpCodeId,
        EmpCode: {
          Firstname: row.EmpCode.Firstname,
          Lastname: row.EmpCode.Lastname,
          BranchCode: row.EmpCode.BranchCode,
          bank_account: row.EmpCode.employeepayroll?.bank_account,
        
        },
      }));
  
     // const grouped = groupByCompany(normalized);
  
      return normalized;
    } catch (error) {
      console.error("Error occured", error);
      throw error;
    }
  }






//// KIM PAYROLL REPORT
type PayrollDate = {
  start_date: string
  end_date: string
}

export async function getPayrollArchiveReportService(
  payrollId: number,
  company_id: string
) {
  try {

    const totalPayroll = await prisma.totalPayroll.findUnique({
      where:{
        id: payrollId
      }
    });

    const companyDetails = await prisma.company_details.findUnique({
      where:{
        CompanyCode: company_id
      }
    });

    if (!companyDetails) {
      throw {
        code: "COMPANY_NOT_FOUND",  
        status: 409,
        message: "Error bonus not found"
      }
    }

    if (!totalPayroll) {
      throw {
        code: "PAYROLL_NOT_FOUND",  
        status: 409,
        message: "Error bonus not found"
      }
    }

    const payrollDate = totalPayroll?.selected_payroll_date as PayrollDate;

    const endDate = payrollDate?.end_date
      ? new Date(payrollDate.end_date)
      : undefined;
    

    const employees = await prisma.employee.findMany({
      where: {
        AND: [
          {
            EmployeeStatus: {
              not: "Resigned"
            } 
            ,
            EmployementDate: {
              lte: endDate
            },
          },
          {
            OR: [
                {
                  BranchCode: {
                      company_id: company_id
                  }
               },
               {
                isAlien: true,
                secondaryBranch:{
                  company_id: company_id
                }
               }
            ]
          }
        ]
     
      },
      include: {
        BranchCode: true,
        archive_employee_payroll: {
          where: {
            totalPayrollId: payrollId
          }
        },
        employeepayroll: {
          select:{
            basic_salary: true
          }
        },
        secondaryBranch: true,
        specialLeaves: true
      },
      orderBy: [
        { bod_member: "desc" },
        { BranchCode: { position: "asc" } },
        { Lastname: "asc" }
      ]
    });

    // Normalize payroll values
    const rows = employees.map(emp => {
      const payroll = emp.archive_employee_payroll[0];
      let reason: string | null = null;
      let leaveInfo = null;
    
      const payrollStart = new Date(payrollDate.start_date);
      const payrollEnd = new Date(payrollDate.end_date);
    
      if ((payroll?.Netpay ?? 0) === 0) {
    
        const leave = emp.specialLeaves?.find(l => {
          const leaveStart =
          l.status === "Expected"
            ? l.expectedStart
              ? new Date(l.expectedStart)
              : null
            : l.start
              ? new Date(l.start)
              : null;
        const leaveEnd =
          l.status === "Expected"
            ? l.expectedEnd
              ? new Date(l.expectedEnd)
              : null
            : l.end
              ? new Date(l.end)
              : null;
        
        if (!leaveStart || !leaveEnd) return false;
        
        return leaveStart <= payrollEnd && leaveEnd >= payrollStart;
        });
    
        if (leave) {
    
          const leaveStart =
            leave.status === "Expected"
              ? leave.expectedStart
              : leave.start;
    
          const leaveEnd =
            leave.status === "Expected"
              ? leave.expectedEnd
              : leave.end;
    
          reason = "ON_LEAVE";

          if (leaveStart && leaveEnd) {
    
            leaveInfo = {
              type: leave.leaveName,
              start:   new Date(leaveStart).toLocaleDateString(),
              end:  new Date(leaveEnd).toLocaleDateString(),
              status: leave.status
            };
          }
        }
      }
    
      return {
        empCode: emp.EmpCode,
        name: `${emp.Lastname}, ${emp.Firstname}`,
        board: emp.bod_member,
        branch: emp.BranchCode?.branchCode ?? null,
        department: emp.Department ?? null,
        basic: emp.employeepayroll?.basic_salary ?? 0,
        halfBasic: payroll?.Basic_salary ?? 0,
        overtime: payroll?.Overtime ?? 0,
        late: payroll?.Late ?? 0,
        undertime: payroll?.undertime ?? 0,
        absences: payroll?.Absent ?? 0,
        total: payroll?.Grosspay ?? 0,
        pagIbigEmployeer: payroll?.Pagibig_employer_share ?? 0,
        sssEmployeer: payroll?.SSS_employer_share ?? 0,
        philhealthEmployeer: payroll?.philhealth_employer_share ?? 0,
        reason,
        leaveInfo,
        secondBranch: emp.isAlien ? emp.secondaryBranch?.company_id : ""
      };
    });


    // Board Employees (bod1 / bod2)
    const boardEmployees = rows.filter(
      r => r.board === "bod2" 
    );

    // Main Holding Employees
    const holdingEmployees = rows.filter(
      r =>
        (!r.board || r.board === "") 
             &&
      (r.department !== "M2" && (r.branch === "EMB-MAIN"))
               ||
         (r.branch === "ASS")
               ||
      (r.secondBranch === company_id)
    );

      // Mancom Employees 

      const mancomEmployees = rows.filter(
        r => r.board === "Mancom"
      )

    // 3️⃣ Branch Employees
    const branchEmployees = rows.filter(
      r =>
      (  (!r.board || r.board === "")
                  &&
        (r.branch !== "EMB-MAIN" &&  r.branch !== "ASS")
                   ||   
     (r.department === "M2" && (r.branch === "EMB-MAIN"))
          
    )
             &&
    (r.secondBranch === '')
    );

    type BranchGroup = Record<string, typeof branchEmployees>;

    const branchGroups = branchEmployees.reduce<BranchGroup>((acc, emp) => {
    
      const branchKey = emp.branch ?? "UNKNOWN";
    
      acc[branchKey] ??= [];
      acc[branchKey].push(emp);
    
      return acc;
    
    }, {});


    const summaries = {
      company: companyDetails.CompanyName,
      PayCycle: totalPayroll.PayCycle
    }
    return {
      summaries,
      boardEmployees,
      mancomEmployees,
      holdingEmployees,
      branchGroups
    };

  } catch (error) {
    console.error("Error occurred", error);
    throw error;
  }
}


export async function getAvailableCompanyCyclesService(statuses:("PENDING" | "FOR_CHECKER" | "FOR_APPROVER")[]) {
  try {
    const data = await prisma.employeeSummary.findMany({
      where: {
        status: {
          in: statuses,
        },

        EmpCode: {
          isNot:{
            isAlien: true
          }
        }
      },
      select: {
        CycleCategory: true,
        EmpCode: {
          select: {
            BranchCode: {
              select: {
                company_id: true,
              },
            },
          },
        },
      },
      orderBy:{
        CycleCategory: "asc"
      }
    });

    const map = new Map<string, { company_id: string; cycle: string }>();

    for (const row of data) {
      const company = row.EmpCode?.BranchCode?.company_id;
      const cycle = row.CycleCategory;

      if (!company || !cycle) continue;

      const key = `${company}_${cycle}`;

      if (!map.has(key)) {
        map.set(key, {
          company_id: company,
          cycle,
        });
      }
    }

    return Array.from(map.values());

  } catch (error) {
    console.error("Error fetching company cycles:", error);
    throw error;
  }
}



