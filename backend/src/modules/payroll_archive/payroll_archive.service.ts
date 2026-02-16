import { prisma } from "../../config/prismaClient";
import { computeAbsent, computeGrossPay, computeLate, computeOvertime, computePagibig, computePhilRate, computeSemiMonthlySalary, computeSSSContribution, computeSSSContributionEmployer, computeWHTx } from "../prepare_payroll/prepare_payroll.computation";
import { nowPH } from "../../utils/timezone";
import { io } from "../../server";
import { PayrollDateRange } from "../api/api.types";
import { isPayrollDateRange } from "./payroll_archive.helper";
import { convertPayrollLabelToPeriod } from "./payroll_archive.types";
import { Console } from "console";


export async function employeeProbationary(){

  try{
    const computed = await displayCompletePayroll(["PENDING"]);
    if (!computed || computed.length === 0) return 0;
    const payCycle = computed[0].PayCode;

    const data1 = await prisma.employee.findMany({
      where:{
        EmploymentStatus:"Probationary",
        EmployeeStatus:"Active"
      }
    })

    return {data1,payCycle};
    
  }


  catch(error){
    console.log('error occured',error);
  }

}


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
              EmploymentStatus:true,
              isNewEmployee:true,
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



// loans fetch and query here ↓

    const empCodes = employeeList.map(e => e.EmpCodeId);
    const payrollPeriod = employeeList[0].PayCode;
    const currentPayrollPeriod = convertPayrollLabelToPeriod(payrollPeriod)
    const payCycle = employeeList[0].PayrollPeriod;

    const [payYear, payMonth] = currentPayrollPeriod.split("-").map(Number);
    const payrollCycle = payCycle.split("-")[0];

    console.log("=== PAYROLL CONTEXT ===");
    console.log(empCodes)
    console.log({
      payrollPeriod,
      payYear,
      payMonth,
      payrollCycle,
    });


    const loans = await prisma.loan_details.findMany({
      where: {
        EmpCodeId: { in: empCodes },
        status: "ACTIVE",
        loan_type: {
          in: ["FCH_LOAN", "SSS_LOAN", "PAGIBIG_LOAN", "RFC_LOAN"],
        },
      },
      select: {
        loan_id: true,
        EmpCodeId: true,
        loan_type: true,
        per_payroll_deduct: true,
      },
    });

    console.log("=== ACTIVE LOANS ===");
    console.table(
      loans.map(l => ({
        loan_id: l.loan_id,
        emp: l.EmpCodeId,
        type: l.loan_type,
        amount: Number(l.per_payroll_deduct),
      }))
    );


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

    console.log("=== LATEST LEDGER PER LOAN ===");
    for (const [loanId, ledger] of latestLedger.entries()) {
      console.log({
        loan_id: loanId,
        transaction_date: ledger.transaction_date,
        payroll_cycle: ledger.payroll_cycle,
      });
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
      
      console.log("=== LOAN CHECK ===");
      console.log({
        loan_id: loan.loan_id,
        emp: loan.EmpCodeId,
        type: loan.loan_type,
        amount: Number(loan.per_payroll_deduct),
        ledger_date: ledger?.transaction_date,
        ledger_cycle: ledger?.payroll_cycle,
        alreadyDeducted,
      });
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


      const normalized = employeeList.map((emp) => {
        const basicSalary = Number(emp.EmpCode.employeepayroll?.basic_salary ?? 0);
        const totalLateCount = emp.LateCount ? Number(emp.LateCount): 0;
        const totalAbsent = emp.TotalAbsentHours ? Number(emp.TotalAbsentHours) : 0;
        const phil_percentage = phil?.SettingPercentage?.toNumber() ?? 0;
        const rawPagibigEmployee = emp.EmpCode.pagibig_list[0]?.pagibig_employee_share?.toNumber() ?? 0;
        const rawPagibigEmployer = emp.EmpCode.pagibig_list[0]?.pagibig_employer_share?.toNumber() ?? 0;
        const Paycodes = emp.PayCode;
        const isNewProbi = emp.EmpCode.EmploymentStatus === "Probationary" && emp.EmpCode.isNewEmployee;

        const absent = computeAbsent(totalAbsent,basicSalary);
        const lateCount = computeLate(totalLateCount,basicSalary);
        const semiMonthly =  computeSemiMonthlySalary(basicSalary);
        const sssContribEmployee = Number(computeSSSContribution(basicSalary, sssTable,isNewProbi,Paycodes));
        const sssContribEmployer = computeSSSContributionEmployer(basicSalary, sssTable,isNewProbi,Paycodes,);
        const philhealthRate = computePhilRate(semiMonthly, phil_percentage,isNewProbi,Paycodes);
        const pagibigEmployeeShare = computePagibig(rawPagibigEmployee,Paycodes);
        const pagibigEmployerShare = computePagibig(rawPagibigEmployer,Paycodes)
        const complete_contrib = Number(computeSSSContribution(basicSalary, sssTable,isNewProbi))
                                +  computePhilRate(semiMonthly, phil_percentage,isNewProbi)
                                + pagibigEmployeeShare;
    
        // Loan Code ↓

        const loans = loanByEmp[emp.EmpCodeId] ?? {};
        const fch_loan = loanDeduct(loans.FCH_LOAN);
        const sss_loan = loanDeduct(loans.SSS_LOAN);
        const pagibig_loan = loanDeduct(loans.PAGIBIG_LOAN);
        const rfc_loan = loanDeduct(loans.RFC_LOAN);
        // Loan Code ↑

        const totalLoanDeduction = fch_loan + sss_loan + pagibig_loan + rfc_loan;


        const overTime = computeOvertime(basicSalary, {
          regular: emp.RegularAtt,
          overtime: emp.OvertimeAtt,
          nightShift: emp.NightShiftAtt,
          nightShiftOt: emp.NightShiftOtAtt,
        });
    
        const grossPay = computeGrossPay(overTime,semiMonthly,lateCount,absent);
        const netPay = grossPay - (sssContribEmployee + pagibigEmployeeShare + philhealthRate +totalLoanDeduction);
        const TaxList = computeWHTx(basicSalary,complete_contrib,tax_list,Paycodes);
   
        return {
          ...emp,
          semi_monthly:semiMonthly.toFixed(2),
          overtime:overTime,
          late_count:lateCount,
          absence:absent,
          gross_pay:grossPay,

          // Loan Code ↓
          fch_loan,
          sss_loan,
          pagibig_loan,
          rfc_loan,
          // Loan Code ↑

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
    
  
    return await prisma.$transaction(async (tx) => {
      const computed = await displayCompletePayroll(["FOR_APPROVAL"]);

  
    if (!computed || computed.length === 0) return 0;
    
    const empCodes = computed.map(e => e.EmpCodeId);
    const payrollPeriod = computed[0].PayCode;
    const currentPayrollPeriod = convertPayrollLabelToPeriod(payrollPeriod)
    const payCycle = computed[0].PayrollPeriod;

    const [payYear, payMonth] = currentPayrollPeriod.split("-").map(Number);
    const payrollCycle = payCycle.split("-")[0];

    const cycleCategory = computed[0].CycleCategory;
    const rawSelectedPayrollDate = computed[0]?.selected_payroll_date;
    
    const loans = await tx.loan_details.findMany({
      where: {
        EmpCodeId: { in: empCodes },
        status: "ACTIVE",
        loan_type: { in: ["FCH_LOAN", "SSS_LOAN", "PAGIBIG_LOAN", "RFC_LOAN"] },
      },
      select: {
        loan_id: true,
        EmpCodeId: true,
        loan_type: true,
        per_payroll_deduct: true,
      },
    });

    const loanIds = loans.map((l) => l.loan_id);

    const ledgers = await tx.loan_ledger.findMany({
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
        loan_id: loan.loan_id,
        amount: Number(loan.per_payroll_deduct),
        alreadyDeducted,
      };
    }

    const loanDeduct = (loan?: {
      amount: number;
      alreadyDeducted: boolean;
    }) => (loan && !loan.alreadyDeducted ? loan.amount : 0);

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
      // ================= 1️⃣ CREATE TOTAL PAYROLL =================
      const total = await tx.totalPayroll.create({
        data: {
          PayCycle: payrollPeriod,
          cycle_category: cycleCategory,
          payroll_period: payCycle,
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
      
      const archivePayload = computed.map((emp) => {
        const empLoans = loanByEmp[emp.EmpCodeId] ?? {};
      
        return {
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
          
      
          // Loan Code ↓
          fch_loan: loanDeduct(empLoans.FCH_LOAN),
          sss_loan: loanDeduct(empLoans.SSS_LOAN),
          pagibig_loan: loanDeduct(empLoans.PAGIBIG_LOAN),
          rfc_loan: loanDeduct(empLoans.RFC_LOAN),
          // Loan Code ↑

          isNewEmployee:emp.EmpCode.isNewEmployee,
          EmpCodeId: emp.EmpCodeId,
          totalPayrollId: total.id,
        };
      });
      


  
      await tx.employeePayrollArchive.createMany({
        data: archivePayload,
        skipDuplicates: true,
      });

            // Loan Code ↓

            const transaction_date = nowPH();

            for (const emp of computed) {
              const empLoans = loanByEmp[emp.EmpCodeId];
              if (!empLoans) continue;
      
              for (const loanType of Object.keys(empLoans)) {
                const loan = empLoans[loanType];
                if (loan.alreadyDeducted) continue;
      
                await tx.loan_ledger.create({
                  data: {
                    loan_id: loan.loan_id,
                    EmpCodeId: emp.EmpCodeId,
                    transaction_date,
                    payroll_cycle: payrollCycle,
                    transaction_type: "PAYROLL_DEDUCT",
                    debit_amount: 0,
                    credit_amount: loan.amount,
                    remarks: "Loan Credited to Payroll",
                    payment_status: "PAID",
                  },
                });
              }
            }
            
          // Loan Code ↑ 
  
      // ================= 3️⃣ UPDATE SUMMARY =================
      await tx.employeeSummary.updateMany({
        where: { status: "FOR_APPROVAL" },
        data: { status: "DONE" },
      });

      await tx.employee.updateMany({
        where: { isNewEmployee: true },
        data: { isNewEmployee:false  },
      });
  
      return archivePayload.length;
    }).then((count) => {
      io.emit("payroll:calendarUpdate");
      return count;
    });
  }
  






  export async function reCheckPayroll(){
   
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
          PayCycle: "asc",
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
  }

  export async function getEmployeeArchivedService({
    page = 1,
    pageSize = 10,
    search,
    totalPayrollId
  } : GetEmployeeArchivedParams) {
      const skip = (page - 1) * pageSize
      const where: any = {
        totalPayrollId, 
      }

      if (search && search.trim() !== "") {
        where.OR = [
          {
            EmpCodeId: {
              contains: search,
            },
          },
          {
            EmpCode: {
              Firstname: {
                contains: search,
              },
            },
          },
          {
            EmpCode: {
              Lastname: {
                contains: search,
              },
            },
          },
        ]
      }
      
      const [data, total] = await Promise.all([
        prisma.employeePayrollArchive.findMany({
          where,
          include: {
            EmpCode:{
              select: {
                Firstname: true,
                Middlename: true,
                Lastname: true,
                BranchCodeId: true 
              }
            }
          },
          orderBy: {
            EmpCode: {
              Lastname: "asc"
            }
          },
          skip,
          take: pageSize
        }),
        prisma.employeePayrollArchive.count({
          where
        })
      ])
      
      return {
        data,
        meta: {
          total,
          page,
          pageSize,
          totalPage: Math.ceil(total / pageSize)
        }
      }

  }
  
