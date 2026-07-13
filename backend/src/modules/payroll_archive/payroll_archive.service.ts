import { prisma } from "../../config/prismaClient";
import { computeAbsent, computeGrossPay, computeLate, computeOvertime, computePagibig, computePhilRateEmployee, computePhilRateEmployer, computeSemiMonthlySalary, computeSSSContribution, computeSSSContributionEmployer, computeWHTx, isSecondCutoff } from "../prepare_payroll/prepare_payroll.computation";
import { nowPH } from "../../utils/timezone";
import { io } from "../../server";
import { PayrollDateRange } from "../api/api.types";
import { groupByCompany, isEmploymentWithinPaycode, isPayrollDateRange } from "./payroll_archive.helper";
import { convertPayrollLabelToPeriod, EmployeeBankAccountsParams, PayrollRow } from "./payroll_archive.types";
import { Console } from "console";
import { getBodPhilhealth, getOfficerAllowance, getSSSContributions, getTaxTable } from "../general/general.services";
import { logs_action_type } from "@prisma/client";
import nodemailer from "nodemailer";
import { EmployeeArchivedType, generatePayslipPDF, SendPayslipType } from "../print/print.service";
import { Decimal } from "@prisma/client/runtime/library";
import { sendSmsToGateway } from "../api/api.services";
import { WtaxFetchData } from "../statutory_deductions/statutory.service";


  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });



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


    // Special Leave Condition 
    const summary = await prisma.employeeSummary.findFirst({
      where: {
        EmpCode:{
          BranchCode:{
             company_id
          }
        }
      },
      select: { selected_payroll_date: true },
      orderBy:{
        PayCode: "desc"
      }
    });

    const payrollDate = summary?.selected_payroll_date as PayrollDate | null;

    const cutoffStart = new Date(payrollDate?.start_date as string);
    const cutoffEnd = new Date(payrollDate?.end_date as string);
    
 // END Special Leave Condition 

      const sssTable = await getSSSContributions();
      const phil = await prisma.payroll_Parameters.findFirst({ select: { SettingPercentage: true } });
      const bodPhil = await getBodPhilhealth();
      const tax_list = await getTaxTable();
      const oa = await getOfficerAllowance();
      

      const baseFilter = {
        EmpCode: {
            employeepayroll:{
            include_payroll: true,
            },
            BranchCode: {
              company_id: company_id,
            },
            isAlien: false,
          },
        }

        const statusCondition = {
          OR: [
            // ✅ Active
            {
              EmpCode: {
                EmployeeStatus: {
                  notIn: ["Resigned", "Inactive", "Terminate"],
                },
              },
            },
        
            // ✅ BOD
            {
              EmpCode: {
                bod_member: {
                  in: ["bod1", "bod2"],
                },
              },
            },
        
            // ✅ Special Leave (WITH company safety)
            {
              AND: [
                {
                  EmpCode: {
                    EmployeeStatus: "Inactive",
                  },
                },
                {
                  EmpCode: {
                    OR: [
                      {
                        isAlien: false,
                        BranchCode: { company_id },
                      },
                      {
                        isAlien: true,
                        secondaryBranch: { company_id },
                      },
                    ],
                  },
                },
                {
                  EmpCode: {
                    specialLeaves: {
                      some: {
                        OR: [
                          {
                            AND: [
                              { start: { not: null } },
                              { end: { not: null } },
                              { start: { lte: cutoffEnd } },
                              { end: { gte: cutoffStart } },
                            ],
                          },
                          {
                            AND: [
                              { expectedStart: { not: null } },
                              { expectedEnd: { not: null } },
                              { expectedStart: { lte: cutoffEnd } },
                              { expectedEnd: { gte: cutoffStart } },
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            },
          ],
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
                    statusCondition,
                  ],
                },
        
                // ALIEN
                {
                  AND: [
                    {
                      EmpCode: {
                        isAlien: true,
                        secondaryBranch:{
                          company_id: company_id,
                        }
                      },
                    },
                   statusCondition
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
          SummaryTableOverride: true,
          EmpCode:{
            select:{
              Firstname:true,
              Lastname:true,
              EmploymentStatus:true,
              EmployeeStatus:true,
              isNewEmployee:true,
              bod_member:true,
              Taxable:true,
              isAlien: true,
              BranchCodeId: true,
              EmployementDate:true,
              isSixDaysWork:true,
              WithAtm:true,
              Disbursing:true,
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

          
    // New Update loans fetch and query here ↓

    const empCodes = employeeList.map(e => e.EmpCodeId);
    const payrollPeriod = employeeList[0].PayCode;
    const currentPayrollPeriod = convertPayrollLabelToPeriod(payrollPeriod);
    const payCycle = employeeList[0].PayrollPeriod;

    const [payYear, payMonth] = currentPayrollPeriod.split("-").map(Number);
    const payrollCycle = payCycle.split("-")[0];

    const firstPayCycles = ["10", "15"];
    const secondPayCycles = ["25", "30"];

    // ✅ FETCH LOANS
    const loans = await prisma.loan_details.findMany({
      where: {
        EmpCodeId: { in: empCodes },
        status: "ACTIVE",
        loan_type: {
          in: ["FCH_LOAN", "SSS_LOAN", "PAGIBIG_LOAN", "RFC_LOAN", "ARE_LOAN"],
        },
        start_date: {
          lte: new Date(payYear, payMonth, 0),
        }
      },
      select: {
        loan_id: true,
        EmpCodeId: true,
        loan_type: true,
        per_payroll_deduct: true,
        principal: true, 
        others_types: true,
        deduct_first_pay: true,
        deduct_second_pay: true,
        start_deduction_cycle:true,
      },
    });



    const loanIds = loans.map(l => l.loan_id);

    // ✅ TOTAL PAID PER LOAN
    const paymentSums = await prisma.loan_ledger.groupBy({
      by: ["loan_id"],
      where: {
        loan_id: { in: loanIds },
      },
      _sum: {
        credit_amount: true,
      },
    });

    const paymentMap = new Map<number, number>();

    for (const p of paymentSums) {
      paymentMap.set(
        p.loan_id,
        Number(p._sum.credit_amount ?? 0)
      );
    }

    // ✅ FETCH OVERRIDES
    const overridesLoan = await prisma.over_ride_loan.findMany({
      where: {
        loan_id: { in: loanIds },
        payroll_period: payrollPeriod,
        payroll_cycle: payCycle,
      },
    });

    // ✅ MAP OVERRIDES
    const overrideMapLoan = new Map<number, any>();
    for (const o of overridesLoan) {
      overrideMapLoan.set(o.loan_id, o);
    }

    const ledgers = await prisma.loan_ledger.findMany({
      where: { loan_id: { in: loanIds } },
      orderBy: {
        transaction_date: "desc",
      },
      distinct: ["loan_id"],
    });

    const latestLedger = new Map<number, any>();
    for (const l of ledgers) {
      latestLedger.set(l.loan_id, l);
    }

    
    // ✅ FINAL STRUCTURE
    const loanByEmp: Record<string, any> = {};

    
    const filteredLoans = loans.filter((loan) => {
      const ledger = latestLedger.get(loan.loan_id);

      const isNewLoan =
        ledger?.payment_status === "NEW" &&
        ledger?.transaction_type === "PAYROLL_DEDUCT";

      const startCycle = String(loan.start_deduction_cycle ?? "");
      const currentCycle = String(payrollCycle);



      if (!isNewLoan) return true;

      if (startCycle && currentCycle !== startCycle) {
        return false;
      }

      return true;
    });
        
    for (const loan of filteredLoans) {
      const ledger = latestLedger.get(loan.loan_id);
      const overrideloan = overrideMapLoan.get(loan.loan_id);

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

      let key = loan.loan_type;

      if (
        loan.others_types === "Calamity" &&
        (loan.loan_type === "SSS_LOAN" || loan.loan_type === "PAGIBIG_LOAN")
      ) {
        if (loan.loan_type === "SSS_LOAN") key = "SSS_Cal";
        if (loan.loan_type === "PAGIBIG_LOAN") key = "Pag_IBIG_Cal";
      }

      if (!loanByEmp[loan.EmpCodeId][key]) {
        loanByEmp[loan.EmpCodeId][key] = {
          amount: 0,
          alreadyDeducted: false,
          isOverridden: false, // optional
        };
      }

      const isFirstPay = firstPayCycles.includes(payrollCycle);
      const isSecondPay = secondPayCycles.includes(payrollCycle);

      let shouldDeduct = false;

      if (loan.deduct_first_pay && loan.deduct_second_pay) {
        shouldDeduct = true;
      } else if (loan.deduct_first_pay && !loan.deduct_second_pay) {
        shouldDeduct = isFirstPay;
      } else if (!loan.deduct_first_pay && loan.deduct_second_pay) {
        shouldDeduct = isSecondPay;
      } else {
        shouldDeduct = false;
      }

      // ✅ APPLY OVERRIDE LOGIC
      let amountToUse = Number(loan.per_payroll_deduct);

      if (overrideloan && overrideloan.credit_amount != null) {
        amountToUse = Number(overrideloan.credit_amount);
        loanByEmp[loan.EmpCodeId][key].isOverridden = true;
      }

      // ✅ COMPUTE REMAINING BALANCE
      const totalPaid = Number(paymentMap.get(loan.loan_id) ?? 0);

      const remainingBalance =
        Number(loan.principal) - totalPaid;

      // ✅ DEDUCT ONLY REMAINING BALANCE
      const finalDeduction =
        remainingBalance < amountToUse
          ? remainingBalance
          : amountToUse;

      if (
        !alreadyDeducted &&
        shouldDeduct &&
        remainingBalance > 0
      ) {
        loanByEmp[loan.EmpCodeId][key].amount += finalDeduction;
      }
      loanByEmp[loan.EmpCodeId][key].alreadyDeducted =
        loanByEmp[loan.EmpCodeId][key].alreadyDeducted || alreadyDeducted;
    }

    // ✅ FINAL HELPER
    const loanDeduct = (loan?: { amount: number; alreadyDeducted: boolean }) =>
      loan && !loan.alreadyDeducted ? loan.amount : 0;

    // New Update loans fetch and query here ↑





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
  

      const oaMap = new Map(
          oa.map((o) => [
            o.EmpCodeId.trim().toUpperCase(),
            {
              basicSalary: Number(o.basic_salary),
              paidEveryCutoff: o.paid_every_cutoff,
            },
          ])
        );


    const taxLookup: Record<string, number> = {};

      await Promise.all(
        employeeList.map(async (emp) => {
          const s1 = await WtaxFetchData({
            empcode: emp.EmpCodeId,
            month: payMonth,
            year: payYear,
          });

          taxLookup[emp.EmpCodeId] = s1?.j5 ?? 0;
        })
      );

      const normalized = employeeList.map((emp) => {
        const override = emp.SummaryTableOverride?.[0]; 

        const basicSalary = Number(emp.EmpCode.employeepayroll?.basic_salary ?? 0);
        //const totalLateCount = emp.LateCount ? Number(emp.LateCount): 0;
        const totalLateCount = override?.LateCount ?? (emp.LateCount ? Number(emp.LateCount) : 0);
        //const totalUndertimeCount = emp.TotalUndertime ? Number(emp.TotalUndertime): 0;
        const totalUndertimeCount = override?.TotalUndertime ?? (emp.TotalUndertime ? Number(emp.TotalUndertime) : 0);
        //const totalAbsent = emp.TotalAbsentHours ? Number(emp.TotalAbsentHours) : 0;
        const totalAbsent = override?.TotalAbsentHours !== null && override?.TotalAbsentHours !== undefined
          ? Number(override.TotalAbsentHours)
          : emp.TotalAbsentHours
          ? Number(emp.TotalAbsentHours)
          : 0;
        const phil_percentage = phil?.SettingPercentage?.toNumber() ?? 0;
        const rawPagibigEmployee = emp.EmpCode.pagibig_list[0]?.pagibig_employee_share?.toNumber() ?? 0;
        const rawPagibigEmployer = emp.EmpCode.pagibig_list[0]?.pagibig_employer_share?.toNumber() ?? 0;
        const Paycodes = emp.PayCode;
        const employmentDate = emp.EmpCode.EmployementDate? new Date(emp.EmpCode.EmployementDate): null;
        const isWithinPaycode = isEmploymentWithinPaycode(employmentDate,Paycodes);
        const isSixDaysWork = emp.EmpCode.isSixDaysWork;

        const isNewProbi = emp.EmpCode.EmploymentStatus === "Probationary" && isWithinPaycode;
        //const isNewProbi = emp.EmpCode.EmploymentStatus === "Probationary" && emp.EmpCode.isNewEmployee;

        const isBod = emp.EmpCode.bod_member?.trim().toLowerCase() === "bod1";
        const isTaxable = emp.EmpCode.Taxable;
        const empId = emp.EmpCodeId.trim().toUpperCase();
        //const officerAllowance = isSecondCutoff(emp.PayCode) ? 0 : oaMap.get(empId) ?? 0;

        const officerAllowanceData = oaMap.get(empId);

        const officerAllowance = officerAllowanceData?.paidEveryCutoff ? officerAllowanceData.basicSalary: isSecondCutoff(emp.PayCode)
        ? 0 : officerAllowanceData?.basicSalary ?? 0;

        const isDisbursing = emp.EmpCode.Disbursing === true;
        const hasNoAtm = emp.EmpCode.WithAtm === false;
   

        const bodMap = new Map(
          bodPhil.map((b) => [
            b.EmpCodeId.trim().toUpperCase(),
            b.employee_share?.toNumber() ?? 0,
          ])
        );
        
        const normalizedId = emp.EmpCodeId.trim().toUpperCase();
        const bodShare = bodMap.get(normalizedId) ?? 0;
        


     

        const absent = computeAbsent(totalAbsent,basicSalary,isSixDaysWork);
        const lateCount = computeLate(totalLateCount,basicSalary,isSixDaysWork);
        const undertimeCount = computeLate(totalUndertimeCount,basicSalary,isSixDaysWork);
        const semiMonthly =  computeSemiMonthlySalary(basicSalary);
   
        const sssContribEmployee = Number(computeSSSContribution(basicSalary, sssTable,isNewProbi,Paycodes));
        const sssContribEmployer = computeSSSContributionEmployer(basicSalary, sssTable,isNewProbi,Paycodes);
        const philhealthRateEmployee = computePhilRateEmployee(semiMonthly, phil_percentage,isBod,bodShare,isNewProbi,Paycodes);
        const philhealthRateEmployer = computePhilRateEmployer(basicSalary, phil_percentage,isBod,bodShare,isNewProbi,Paycodes);
        const pagibigEmployeeShare = computePagibig(rawPagibigEmployee,Paycodes);
        const pagibigEmployerShare = computePagibig(rawPagibigEmployer,Paycodes);
        const complete_contrib = Number(computeSSSContribution(basicSalary, sssTable,isNewProbi))
                                +  computePhilRateEmployee(semiMonthly, phil_percentage,isNewProbi)
                                + pagibigEmployeeShare;

        const finalPhilhealthEmployee = override?.philhealth_employee !== null &&
        override?.philhealth_employee !== undefined &&
        Number(override.philhealth_employee) > 0
          ? Number(override.philhealth_employee)
          : Number(philhealthRateEmployee ?? 0);

        const finalPhilhealthEmployer = override?.philhealth_employer !== null &&
          override?.philhealth_employer !== undefined &&
          Number(override.philhealth_employer) > 0
            ? Number(override.philhealth_employer)
            : Number(philhealthRateEmployer ?? 0);


    
        // Loan Code ↓
        const loans = loanByEmp[emp.EmpCodeId] ?? {};
        const fch_loan = loanDeduct(loans.FCH_LOAN);
        const sss_loan = loanDeduct(loans.SSS_LOAN);
        const pagibig_loan = loanDeduct(loans.PAGIBIG_LOAN);
        const rfc_loan = loanDeduct(loans.RFC_LOAN);
    
        const calamity_loan =
                      loanDeduct(loans.Pag_IBIG_Cal) +
                      loanDeduct(loans.SSS_Cal);
        const pag_ibig_cal = loanDeduct(loans.Pag_IBIG_Cal);
        const sss_cal = loanDeduct(loans.SSS_Cal);
        // Loan Code ↑


        //const totalLoanDeduction = fch_loan + sss_loan + pagibig_loan + rfc_loan + are_loan + calamity_loan;


        const overTime = computeOvertime(basicSalary, {
          regular: emp.RegularAtt,
          overtime: emp.OvertimeAtt,
          nightShift: emp.NightShiftAtt,
          nightShiftOt: emp.NightShiftOtAtt,
        },
          isSixDaysWork);

        const computedOvertime = overTime;
        
        const finalOvertime = override?.TotalOvertime !== undefined && override?.TotalOvertime !== null
        ? Number(override.TotalOvertime)
        : computedOvertime
        ? Number(computedOvertime)
        : 0;

        //const computedWtax  = computeWHTx(basicSalary,complete_contrib,tax_list,isTaxable,Paycodes);


         const computedWtax = taxLookup[emp.EmpCodeId] ?? 0;

         const employeeTax = computeWHTx(computedWtax, emp.EmpCode.Taxable,Paycodes);
     



 
        const finalWtax = override?.final_wtax !== undefined && override?.final_wtax !== null
        ? Number(override.final_wtax)
        : employeeTax
        ? Number(employeeTax)
        : 0;
        
        // const key = `${emp.PayCode}_${emp.EmpCodeId}_${emp.PayrollPeriod}`;
        // const overrideValue = overrideMap.get(key);
    
        // const finalWtax = overrideValue ?? computedWtax;

        // const semi_monthly_modified = override?.gross_pay_edit instanceof Decimal ? override.gross_pay_edit.toNumber()
        // : override?.gross_pay_edit ?? (semiMonthly ? Number(semiMonthly) : 0);


        //const basic_salary = override?.basic_salary && override?.basic_salary !== null ? Number(override.basic_salary): semiMonthly;
          const basic_salary = override?.basic_salary_edited && override?.basic_salary !== null ? Number(override.basic_salary): semiMonthly;

        const computedGrossPay = computeGrossPay(
          finalOvertime,
          basic_salary,
          lateCount,
          undertimeCount,
          absent
        );

        //const grossPay = override?.gross_edited && override?.gross_pay_edit !== null ? Number(override.gross_pay_edit): computedGrossPay;

        const are_loan_temp = loanDeduct(loans.ARE_LOAN);
        const totalLoanDeduction = fch_loan + sss_loan + pagibig_loan + rfc_loan + are_loan_temp + calamity_loan;
        const netPay = computedGrossPay - (sssContribEmployee + pagibigEmployeeShare + finalPhilhealthEmployee + totalLoanDeduction + finalWtax);

        const are_loan = isDisbursing ? are_loan_temp + netPay : are_loan_temp;

        const finalNetPay = isDisbursing ? 0 : netPay;

        const forDisburse = isDisbursing ? netPay : 0;

    
        const companyId = emp.EmpCode.BranchCode?.company_id;

        const totalDeductions = totalLoanDeduction + finalWtax + sssContribEmployee + pagibigEmployeeShare + finalPhilhealthEmployee;

   
      
        return {
          ...emp,
          semi_monthly:basic_salary.toFixed(2),
          overtime:finalOvertime,
          late_count:lateCount,
          undertime:undertimeCount,
          absence:absent,
          gross_pay:computedGrossPay,

          // Loan Code ↓
          fch_loan,
          sss_loan,
          pagibig_loan,
          rfc_loan,
          are_loan,
          calamity_loan,
          pag_ibig_cal,
          sss_cal,
          // Loan Code ↑

          sss_contrib_employee:sssContribEmployee,
          sss_contrib_employer:sssContribEmployer,
          philhealth_contrib_employee:finalPhilhealthEmployee,
          philhealth_contrib_employer:finalPhilhealthEmployer,
          pagibig_contrib_employee:pagibigEmployeeShare,
          pagibig_contrib_employer:pagibigEmployerShare,
          net_pay:finalNetPay,
          wtax: finalWtax,          
          computedWtax: computedWtax,
          company_id:companyId,
          total_deductions:totalDeductions,
          officers_allowance: officerAllowance,
          disburse_amount:forDisburse,
        };
 

      });



      return normalized;
    
    }
    catch(error){
      console.error("error occurred",error);
    }


  }







  









  export async function saveComputedPayroll(company_id:string) {

    const pendingPayroll = await prisma.employeeSummary.findFirst({
      where:{
        status:{
          in: ["FOR_CHECKER","FOR_APPROVER"],
        },
        EmpCode:{
          BranchCode:{
            company_id:company_id,
          },
          isAlien:false,
        }
      }
    })

    if (pendingPayroll) {
    throw new Error("PENDING_PAYROLL");
    }
   
    const result = await prisma.employeeSummary.updateMany({
      where: {
        OR:[
          {
            status: "PENDING",
            EmpCode:{
             BranchCode:{
               company_id:company_id,
             },
             isAlien: false,
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
        (e.company_id === companyId && e.EmpCode?.isAlien === false)
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
  
      const firstPayCycles = ["10", "15"];
      const secondPayCycles = ["25", "30"];

      const currentPayrollPeriod = convertPayrollLabelToPeriod(payrollPeriod);
      const [payYear, payMonth]  = currentPayrollPeriod.split("-").map(Number);
  
      const rawSelectedPayrollDate = computed[0]?.selected_payroll_date;
      if (!rawSelectedPayrollDate || !isPayrollDateRange(rawSelectedPayrollDate)) {
        throw new Error("Invalid selected_payroll_date");
      }
  
      // New ── Loans ───────────────────────────────────────────────────────────────

      const loans = await tx.loan_details.findMany({
        where: {
          EmpCodeId: { in: empCodes },
          status: "ACTIVE",
          loan_type: { in: ["FCH_LOAN", "SSS_LOAN", "PAGIBIG_LOAN", "RFC_LOAN", "ARE_LOAN"] },
          start_date: {
            lte: new Date(payYear, payMonth, 0),
          }
        },
        select: {
          loan_id: true,
          EmpCodeId: true,
          loan_type: true,
          per_payroll_deduct: true,
          others_types: true,
          principal: true,
          deduct_first_pay: true,
          deduct_second_pay: true,
          start_deduction_cycle:true,
        },
      });

      const loanIds = loans.map((l) => l.loan_id);

      // ✅ TOTAL PAID PER LOAN
      const paymentSums = await tx.loan_ledger.groupBy({
        by: ["loan_id"],
        where: {
          loan_id: { in: loanIds },
        },
        _sum: {
          credit_amount: true,
        },
      });

      const paymentMap = new Map<number, number>();

      for (const p of paymentSums) {
        paymentMap.set(
          p.loan_id,
          Number(p._sum.credit_amount ?? 0)
        );
      }

      // ✅ FETCH OVERRIDES (FIXED: use payrollCycle not payCycle)
      const overridesLoan = await tx.over_ride_loan.findMany({
        where: {
          loan_id: { in: loanIds },
          payroll_period: payrollPeriod,
          payroll_cycle: payCycle, // ✅ FIXED
        },
      });

      // ✅ MAP OVERRIDES
      const overrideMap = new Map<number, any>();
      for (const o of overridesLoan) {
        overrideMap.set(o.loan_id, o);
      }

      const ledgers = await prisma.loan_ledger.findMany({
        where: { loan_id: { in: loanIds } },
        orderBy: {
          transaction_date: "desc",
        },
        distinct: ["loan_id"],
      });

      const latestLedger = new Map<number, any>();
      for (const l of ledgers) {
        latestLedger.set(l.loan_id, l);
      }

      
      // ✅ FINAL STRUCTURE
      const loanByEmp: Record<string, any> = {};

      
      const filteredLoans = loans.filter((loan) => {
        const ledger = latestLedger.get(loan.loan_id);

        const isNewLoan =
          ledger?.payment_status === "NEW" &&
          ledger?.transaction_type === "PAYROLL_DEDUCT";

        const startCycle = String(loan.start_deduction_cycle ?? "");
        const currentCycle = String(payrollCycle);



        if (!isNewLoan) return true;

        if (startCycle && currentCycle !== startCycle) {
          return false;
        }

        return true;
      });

      for (const loan of filteredLoans) {
        const ledger = latestLedger.get(loan.loan_id);
        const override = overrideMap.get(loan.loan_id);

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

        // 🔹 HANDLE KEY (Calamity mapping)
        let key = loan.loan_type;

        if (
          loan.others_types === "Calamity" &&
          (loan.loan_type === "SSS_LOAN" || loan.loan_type === "PAGIBIG_LOAN")
        ) {
          if (loan.loan_type === "SSS_LOAN") key = "SSS_Cal";
          if (loan.loan_type === "PAGIBIG_LOAN") key = "Pag_IBIG_Cal";
        }

        const isFirstPay = firstPayCycles.includes(payrollCycle);
        const isSecondPay = secondPayCycles.includes(payrollCycle);

        let shouldDeduct = false;

        if (loan.deduct_first_pay && loan.deduct_second_pay) {
          shouldDeduct = true;
        } else if (loan.deduct_first_pay && !loan.deduct_second_pay) {
          shouldDeduct = isFirstPay;
        } else if (!loan.deduct_first_pay && loan.deduct_second_pay) {
          shouldDeduct = isSecondPay;
        } else {
          shouldDeduct = false;
        }

        // ✅ APPLY OVERRIDE
        // let amountToUse = Number(loan.per_payroll_deduct);

        // if (override && override.credit_amount != null) {
        //   amountToUse = Number(override.credit_amount);
        // }

        // if (!loanByEmp[loan.EmpCodeId][key]) {
        //   loanByEmp[loan.EmpCodeId][key] = {
        //     loan_id: loan.loan_id,
        //     amount: 0,
        //     alreadyDeducted: false,
        //     isOverridden: false,
        //   };
        // }

        // if (!alreadyDeducted && shouldDeduct) {
        //   loanByEmp[loan.EmpCodeId][key].amount += amountToUse;
        // }


        // ✅ APPLY OVERRIDE
        let amountToUse = Number(loan.per_payroll_deduct);

        if (override && override.credit_amount != null) {
          amountToUse = Number(override.credit_amount);
        }

        if (!loanByEmp[loan.EmpCodeId][key]) {
          loanByEmp[loan.EmpCodeId][key] = {
            loan_id: loan.loan_id,
            amount: 0,
            alreadyDeducted: false,
            isOverridden: false,
          };
        }

        // ✅ COMPUTE REMAINING BALANCE
        const totalPaid = Number(paymentMap.get(loan.loan_id) ?? 0);

        const remainingBalance =
          Number(loan.principal) - totalPaid;

        // ✅ USE ONLY REMAINING BALANCE
        const finalDeduction =
          remainingBalance < amountToUse
            ? remainingBalance
            : amountToUse;

        if (
          !alreadyDeducted &&
          shouldDeduct &&
          remainingBalance > 0
        ) {
          loanByEmp[loan.EmpCodeId][key].amount += finalDeduction;
        }

        if (override) {
          loanByEmp[loan.EmpCodeId][key].isOverridden = true;
        }

        loanByEmp[loan.EmpCodeId][key].alreadyDeducted =
          loanByEmp[loan.EmpCodeId][key].alreadyDeducted || alreadyDeducted;
      }

      // ✅ FINAL HELPER
      const loanDeduct = (loan?: { amount: number; alreadyDeducted: boolean }) =>
        loan && !loan.alreadyDeducted ? loan.amount : 0;

  // New ── Loans ───────────────────────────────────────────────────────────────
  
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
          sss_calamity_loan:         loanDeduct(empLoans.SSS_Cal),
          pagibig_calamity_loan:     loanDeduct(empLoans.Pag_IBIG_Cal),      
          isNewEmployee:             emp.EmpCode.isNewEmployee,
          EmpCodeId:                 emp.EmpCodeId,
          totalPayrollId:            totalPayrollRecord.id,
          total_deductions:          emp.total_deductions,
          PayrollBranchId:           emp.EmpCode.isAlien
                                         ? emp.EmpCode.secondaryBranch?.branchCode ?? null
                                         : emp.EmpCode.BranchCodeId ?? null,
          officers_allowance: emp.officers_allowance,
          disburse_amount: emp.disburse_amount,
        };
      });


  
  
      await tx.employeePayrollArchive.createMany({
        data: archivePayload,
        skipDuplicates: true,
      });

   
  

      
  // Loan New  ── Loan ledger entries ─────────────────────────────────────────────────
      const transaction_date = nowPH();

      for (const emp of computed) {
        const empLoans = loanByEmp[emp.EmpCodeId];
        if (!empLoans) continue;

        const processedLoanIds = new Set<number>();

        for (const loanType of Object.keys(empLoans)) {
          const loan = empLoans[loanType];

          if (loan.alreadyDeducted) continue;
          if (!loan.amount || loan.amount <= 0) continue;

          if (processedLoanIds.has(loan.loan_id)) continue;
          processedLoanIds.add(loan.loan_id);

          // ✅ GET TOTAL PAID
          const paymentAgg = await tx.loan_ledger.aggregate({
            where: {
              loan_id: loan.loan_id,
            },
            _sum: {
              credit_amount: true,
            },
          });

          // ✅ GET LOAN PRINCIPAL
          const loanDetail = await tx.loan_details.findUnique({
            where: {
              loan_id: loan.loan_id,
            },
            select: {
              principal: true,
            },
          });

          const totalPaid = Number(
            paymentAgg._sum.credit_amount ?? 0
          );

          const principal = Number(
            loanDetail?.principal ?? 0
          );

          // remaining BEFORE this payroll
          const remainingBeforePayment =
            principal - totalPaid;

          // remaining AFTER this payroll
          const remainingAfterPayment =
            remainingBeforePayment - Number(loan.amount);

          // ✅ DETERMINE STATUS
          const paymentStatus =
            remainingAfterPayment <= 0
              ? "COMPLETED"
              : "PAID";

          // ✅ CASE: OVERRIDE EXISTS
          if (loan.isOverridden) {

            // 🔴 1. Create SKIPPED ledger (for missed previous)
            await tx.loan_ledger.create({
              data: {
                loan_id:          loan.loan_id,
                EmpCodeId:        emp.EmpCodeId,
                transaction_date,
                payroll_cycle:    payrollCycle,
                transaction_type: "LOAN_SKIPPED",
                debit_amount:     0,
                credit_amount:    0,
                remarks:          "Previous payment skipped (override applied)",
                payment_status:   "SKIPPED",
              },
            });

            // 🟢 2. Create ACTUAL PAYMENT ledger
            await tx.loan_ledger.create({
              data: {
                loan_id:          loan.loan_id,
                EmpCodeId:        emp.EmpCodeId,
                transaction_date,
                payroll_cycle:    payrollCycle,
                transaction_type: "PAYROLL_DEDUCT",
                debit_amount:     0,
                credit_amount:    loan.amount,
                remarks:          "Override payment applied",
                payment_status: paymentStatus,
              },
            });

            if (remainingAfterPayment <= 0) {
              await tx.loan_details.update({
                where: {
                  loan_id: loan.loan_id,
                },
                data: {
                  status: "COMPLETED",
                },
              });
            }

          } else {
            // ✅ NORMAL FLOW
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
                payment_status: paymentStatus,
              },
            });

            if (remainingAfterPayment <= 0) {
                await tx.loan_details.update({
                  where: {
                    loan_id: loan.loan_id,
                  },
                  data: {
                    status: "COMPLETED",
                  },
                });
              }
          }
        }
      }

  // Loan New  ── Loan ledger entries ─────────────────────────────────────────────────


      const disbursingEmployees = await tx.employee.findMany({
        where: { EmpCode: { in: empCodes }, Disbursing: true },
        select: { EmpCode: true },
      });
  
      if (disbursingEmployees.length !== 0) {
        const disbursingEmpCodes = disbursingEmployees.map((e) => e.EmpCode);
        const disburseArchives = await tx.employeePayrollArchive.findMany({
          where: { EmpCodeId: { in: disbursingEmpCodes }, totalPayrollId: totalPayrollRecord.id },
          select: { id: true, disburse_amount: true, EmpCodeId: true },
        });
  
        const totalDisburseAmount = disburseArchives.reduce(
          (sum, emp) => sum + Number(emp.disburse_amount ?? 0), 0
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


      //start save employee with tax only
      const taxableEmployees = computed.filter(
        (emp) => emp.EmpCode?.Taxable
      );

         for (const emp of taxableEmployees) {
        const existing = await tx.taxArchive.findFirst({
          where: {
            PayCode: payrollPeriod,
            EmpCodeId: emp.EmpCodeId,
          },
        });

        if (!existing) {
          await tx.taxArchive.create({
            data: {
              PayCode: payrollPeriod,
              payroll_period: payCycle,
              cycle_category: cycleCategory,
              Grosspay: emp.gross_pay,
              EmpCodeId: emp.EmpCodeId,
            },
          });
        }

        if(isSecondCutoff(payrollPeriod)){


       let taxPeriod = await tx.taxPeriod.findUnique({
        where: {
          month_year: {
            month: payMonth,
            year: payYear,
          },
        },
      });

      if (!taxPeriod) {
        taxPeriod = await tx.taxPeriod.create({
          data: {
            month: payMonth,
            year: payYear,
          },
        });
      }


        const wtax = await WtaxFetchData({
          empcode: emp.EmpCodeId,
          month: payMonth,
          year: payYear,
        });
        const taxAmounts = wtax?.j5;

        await tx.monthlyTaxPayment.upsert({
          where: {
            EmpCodeId_taxPeriodId: {
              EmpCodeId: emp.EmpCodeId,
              taxPeriodId: taxPeriod.id,
            },
          },
          update: {
            taxAmount: Number(taxAmounts ?? 0),
            col1: {
              a2: wtax?.a2 ?? 0,
              basic_salary: wtax?.basic_salary ?? 0,
              b2: wtax?.b2 ?? 0,
              c2: wtax?.c2 ?? 0,
              d2: wtax?.d2 ?? 0,
              e2: wtax?.e2 ?? 0,
              f2: wtax?.f2 ?? 0,
              g2: wtax?.g2 ?? 0,
              h2: wtax?.h2 ?? 0,
            },
            col2: {
              philhealth_contrib: wtax?.philhealth_contrib ?? 0,
              b3: wtax?.b3 ?? 0,
              c3: wtax?.c3 ?? 0,
              h3: wtax?.h3 ?? 0,
              i3: wtax?.i3 ?? 0,
              j3: wtax?.j3 ?? 0,
              k3: wtax?.k3 ?? 0,
              l3: wtax?.l3 ?? 0,
            },
            col3: {
              sss_employe_contrib: wtax?.sss_employe_contrib ?? 0,
              b4: wtax?.b4 ?? 0,
              c3: wtax?.c3 ?? 0,
              j4: wtax?.j4 ?? 0,
              c4: wtax?.c4 ?? 0,
            },
            col4: {
              pagibig_contrib: wtax?.pagibig_contrib ?? 0,
              b5: wtax?.b5 ?? 0,
              c5: wtax?.c5 ?? 0,
              j5: wtax?.j5 ?? 0,
            },
            month_list: wtax?.month_list ?? {},
          },
          create: {
            EmpCodeId: emp.EmpCodeId,
            taxAmount: Number(taxAmounts ?? 0),
            taxPeriodId: taxPeriod.id,
            col1: {
              a2: wtax?.a2 ?? 0,
              basic_salary: wtax?.basic_salary ?? 0,
              b2: wtax?.b2 ?? 0,
              c2: wtax?.c2 ?? 0,
              d2: wtax?.d2 ?? 0,
              e2: wtax?.e2 ?? 0,
              f2: wtax?.f2 ?? 0,
              g2: wtax?.g2 ?? 0,
              h2: wtax?.h2 ?? 0,
            },
            col2: {
              philhealth_contrib: wtax?.philhealth_contrib ?? 0,
              b3: wtax?.b3 ?? 0,
              c3: wtax?.c3 ?? 0,
              h3: wtax?.h3 ?? 0,
              i3: wtax?.i3 ?? 0,
              j3: wtax?.j3 ?? 0,
              k3: wtax?.k3 ?? 0,
              l3: wtax?.l3 ?? 0,
            },
            col3: {
              sss_employe_contrib: wtax?.sss_employe_contrib ?? 0,
              b4: wtax?.b4 ?? 0,
              c3: wtax?.c3 ?? 0,
              j4: wtax?.j4 ?? 0,
              c4: wtax?.c4 ?? 0,
            },
            col4: {
              pagibig_contrib: wtax?.pagibig_contrib ?? 0,
              b5: wtax?.b5 ?? 0,
              c5: wtax?.c5 ?? 0,
              j5: wtax?.j5 ?? 0,
            },
            month_list: wtax?.month_list ?? {},
          },
        });
      }
    }

      //end save employee with tax only

  
   
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
                    BranchCode: { CompanyCode: { CompanyCode: companyId } },
                    isAlien: false,
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
          PayCode:payrollPeriod,
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
      status: "FOR_CHECKER",

      EmpCode: {
          OR: [
            {
              isAlien: false,
              BranchCode: {
                company_id:company_id,
              },
            },
            {
              isAlien: true,
              secondaryBranch: {
                company_id,
              },
            },
          ],
        },
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
      status: "FOR_APPROVER",

      EmpCode: {
          OR: [
            {
              isAlien: false,
              BranchCode: {
                company_id:company_id,
              },
            },
            {
              isAlien: true,
              secondaryBranch: {
                company_id,
              },
            },
          ],
        },
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


const alert = await prisma.alertConfiguration.findUnique({
  where: {
    id: 1
  }
})

  try {

    if(alert?.isEmail && alert.email){
      await transporter.sendMail({
        from: `"Payroll System" <${process.env.EMAIL_USER}>`,
        to: `${alert.email}`,
        subject: `Pending Payroll Approval for ${company_id} (${paycode})`,
        html: `
          <p>Dear Approver,</p>
  
          <p>You have a pending payroll that requires your approval.</p>
  
          <p>Please log in to the Payroll System and process the approval at your earliest convenience.</p>
  
          <br />
  
          <p>Regards,</p>
          <p><strong>Payroll Department</strong></p>
        `,
      });

      console.log("Approval email sent.");
    }
  

    if(alert?.isSms && alert.phoneNumber){
      await sendSmsToGateway(
        `${alert.phoneNumber}`,
        `Pending Payroll Approval for ${company_id} (${paycode})`
      )
    }
  
  } catch (error) {
    console.error(
      "Failed to send approval email:",
      error
    );
  }


   

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
              isAlien: true,
              employeepayroll:{
                select:{
                  gmail_account:true,
                },
              },
              BranchCode:{
                select:{
                  CompanyCode:{
                      select:{
                        CompanyName: true
                      }
                  }
                }
              },
                secondaryBranch:{
                select:{
                  CompanyCode:{
                      select:{
                        CompanyName: true
                      }
                  }
                }
              }
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
        OR: [
          // Regular employee
          {
            isAlien: false,
            BranchCode: {
              ...(selectedCompany && { company_id: selectedCompany }),
              ...(selectedBranch && { branchCode: selectedBranch }),
            },
          },
    
          // Alien employee
          {
            isAlien: true,
            secondaryBranch: {
              ...(selectedCompany && { company_id: selectedCompany }),
              ...(selectedBranch && { branchCode: selectedBranch }),
            },
          },
        ],
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
            BranchCodeId: true,
            isAlien: true,
            BranchCode:{
              select:{
                CompanyCode: {
                  select:{
                    CompanyName: true
                  }
                }
              }
            },
            secondaryBranch:{
              select:{
                CompanyCode: {
                  select:{
                    CompanyName: true
                  }
                }
              }
            }
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
          OR:[
            {
              EmpCode:{
                BranchCode:{
                  company_id:company_id,
                },
                Disbursing:{
                  not:true,
                },
              },
            },
            {
              EmpCode:{
                isAlien:true,
                secondaryBranch:{
                  company_id:company_id,
                },
                Disbursing:{
                  not:true,
                },
              },
            },
          ]
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
              isAlien:true,
              secondaryBranch:true,
              secondaryBranchId:true,
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
  
       const oa = await getOfficerAllowance();

     
      const oaMap = new Map(
          oa.map((o) => [
            o.EmpCodeId.trim().toUpperCase(),
            {
              basicSalary: Number(o.basic_salary),
              paidEveryCutoff: o.paid_every_cutoff,
            },
          ])
        );

      const normalized: PayrollRow[] = employeeList.map((row) => {

      const empId = row.EmpCodeId.trim().toUpperCase();



      const officerAllowanceData = oaMap.get(empId);

      const officerAllowance = officerAllowanceData?.paidEveryCutoff ? officerAllowanceData.basicSalary: isSecondCutoff(row.PayCode)
        ? 0 : officerAllowanceData?.basicSalary ?? 0;
        
      //const officerAllowance = isSecondCutoff(row.PayCode) ? 0 : oaMap.get(empId) ?? 0;
      const baseNetpay = row.Netpay?.toNumber() ?? 0;

      return {
        id: row.id,
        PayCode: row.PayCode,
        cycle_category: row.cycle_category,
        Netpay: baseNetpay + officerAllowance,
        BranchCodeId: row.EmpCode.isAlien ? row.EmpCode.secondaryBranchId : row.EmpCode.BranchCodeId,
        EmpCodeId: row.EmpCodeId,
        EmpCode: {
          Firstname: row.EmpCode.Firstname,
          Lastname: row.EmpCode.Lastname,
          BranchCode: row.EmpCode.BranchCode,
          bank_account: row.EmpCode.employeepayroll?.bank_account,
        },
      };
    });
  
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
        secondBranch: emp.isAlien ? emp.secondaryBranch?.company_id : "",
        secondBranchId: emp.isAlien ? emp.secondaryBranchId : ""
      };
    });


    // Board Employees (bod1 / bod2)
    const boardEmployees = rows.filter(
      r => r.board === "bod1" 
    );

    // Main Holding Employees
    const holdingEmployees = rows.filter(
      r =>
        (!r.board || r.board === "") 
             &&
      (r.department !== "M2" && (r.branch === "EMB-MAIN"))
               ||
      (r.secondBranch === company_id && r.secondBranchId === "EMB-MAIN")
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
             ||
    (r.secondBranch === company_id &&  r.branch === "ASS")
    );

    type BranchGroup = Record<string, typeof branchEmployees>;

    const branchGroups = branchEmployees.reduce<BranchGroup>((acc, emp) => {
    
      const branchKey =
      emp.branch === "ASS"
      ? emp.secondBranchId ?? "UNKNOWN"
      : emp.branch ?? "UNKNOWN";
    
      acc[branchKey] ??= [];
      acc[branchKey].push(emp);
    
      return acc;
    
    }, {});
    // ✅ Sort each group
    Object.keys(branchGroups).forEach((key) => {
      branchGroups[key].sort((a, b) =>
        (a.name ?? "").localeCompare(b.name ?? "")
      );
    });


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








// services/email.service.ts





export async function sendPayslipEmailService(employee: SendPayslipType) {

  const email = employee.EmpCode?.employeepayroll?.gmail_account;

  if (!email) {
    throw new Error("No email found");
  }

  
  const pdfBuffer = await generatePayslipPDF([employee]);


  await transporter.sendMail({
    from: `"Payroll System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Payslip",
    html: `
      <p>Dear ${employee.EmpCode.Firstname},</p>
      <p>Please find your payslip attached.</p>
      <p>Regards,<br/>Payroll Department</p>
    `,
    attachments: [
      {
        filename: `Payslip-${employee.EmpCodeId}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}






//send email per branch

export async function sendBulkPayslipService({totalPayrollId,selectedCompany,selectedBranch,search}: {
  totalPayrollId: number;
  selectedCompany?: string;
  selectedBranch?: string;
  search?: string;
  }) {

  const employees = await prisma.employeePayrollArchive.findMany({
    where: {
      totalPayrollId,
      ...(selectedBranch && {
        EmpCode: {
          BranchCodeId: selectedBranch,
        },
      }),
      ...(search && {
        OR: [
          { EmpCodeId: { contains: search } },
          { EmpCode: { Firstname: { contains: search } } },
          { EmpCode: { Lastname: { contains: search } } },
        ],
      }),
    },
    include: {
      EmpCode: {
        include: {
          employeepayroll: true,
        },
      },
    },
  });

  for (const emp of employees) {

    const email = emp.EmpCode?.employeepayroll?.gmail_account;

    if (!email) continue;

    try {
    
      await sendPayslipEmailService(emp as unknown as SendPayslipType);

    } catch (err) {
      console.error(`Failed for ${emp.EmpCodeId}`, err);
    }
  }
}