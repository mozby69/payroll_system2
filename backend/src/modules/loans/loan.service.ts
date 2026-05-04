import { prisma } from "../../config/prismaClient";
import { getBodPhilhealth, getSSSContributions } from "../general/general.services";
import {  CYCLE_RULES, CycleCategory, DEFAULT_CYCLE_CATEGORY, LOAN_ACTION_TYPES, LoanActionType, loanProps, LoanResult, PayCyclePeriod, PayrollCycle, updateLoanProps } from "../loans/loan.types";
import { computePagibig, computePhilRateEmployee, computeSemiMonthlySalary, computeSSSContribution } from "../prepare_payroll/prepare_payroll.computation";
import { LoanLimitError } from "./loan.error";

export async function saveEmployeeLoan(data: loanProps){


  const sssTable = await getSSSContributions();

    // Phil health code ↓
  const bodPhil = await getBodPhilhealth();
  const phil = await prisma.payroll_Parameters.findFirst({ select: { SettingPercentage: true } });
    // Phil health code ↑


  let perPayroll: number = 0;

  if (data.loan_type !== "OTHERS") {

    const totalTerms = 
      data.term_unit === "YEARS" ? data.term_value * 12 : data.term_value;

    if (totalTerms <= 0) {
      throw new Error("Invalid loan terms");
    }

    if (data.loan_type === "ARE_LOAN") {

      const divisor =
        Number(data.deduct_allowance) +
        Number(data.deduct_first_pay) +
        Number(data.deduct_sec_pay);

      if (divisor <= 0) {
        throw new Error("At least one deduction option must be selected");
      }

      const rawPerPayroll =
        Number(data.principal) / totalTerms / divisor;

      perPayroll = Math.floor(rawPerPayroll * 100) / 100;

    } else {

      const divisor = data.deduct_allowance ? 3 : 2;

      const rawPerPayroll =
        Number(data.principal) / totalTerms / divisor;
      
      // New Update

      if(data.loan_type === "FCH_LOAN"){
        if (data.rounding_type === "Tens") {
          perPayroll = Math.round(rawPerPayroll / 10) * 10;
        } else {
          perPayroll = Math.ceil(rawPerPayroll);
        }
      }
      else{

        perPayroll = Math.round(rawPerPayroll * 100) / 100;
      }

      // New Update
      
    }

  } else {

    perPayroll = Number(0);
  }

  const startDate = new Date(data.start_date);

  return await prisma.$transaction(async (tx) =>{

      const existingLoan = await tx.loan_details.findMany({
        where:{
          EmpCodeId:data.empCode,
          status:"ACTIVE",
          loan_type: data.loan_type
        },
        select: {
          loan_id: true,
          EmpCodeId: true,
          rounding_types:true,
          principal: true,
          term_value: true,
          term_unit: true,
          start_date: true,
          deduct_allowance: true,
          per_payroll_deduct:true,
        },
        
    });
 

      const existingEmp = await tx.employee.findUnique({
        where:{
          EmpCode:data.empCode
        },
        select:{
          EmpCode:true,
          EmploymentStatus:true,
          isNewEmployee:true,
          bod_member:true,
          BranchCode:{
            select:{
              CompanyCode:{
                select:{
                  CompanyCycle: true
                }
              }
            }
          },
          employeepayroll:{
            select:{
              basic_salary:true
            }
          },
          pagibig_list:{
            select:{
              pagibig_id:true,
              pagibig_employee_share:true,
              pagibig_employer_share:true,
            }
          }
        }
      })

      const isNewProbi = existingEmp?.EmploymentStatus === "Probationary" && existingEmp?.isNewEmployee;
      const basicSalary =
        existingEmp?.employeepayroll?.basic_salary?.toNumber() ?? 0;
      

      if (basicSalary <= 0) { 
        throw new Error("Enter Employee Basic Salary First.");
      }


      // Phil health code ↓
      const semiMonthly =  computeSemiMonthlySalary(basicSalary);
      const phil_percentage = phil?.SettingPercentage?.toNumber() ?? 0;
      const isBod = existingEmp?.bod_member?.trim().toLowerCase() === "bod1";

      const bodMap = new Map(
          bodPhil.map((b) => [
            b.EmpCodeId.trim().toUpperCase(),
            b.employee_share?.toNumber() ?? 0,
          ])
        );
        
      const normalizedId = data.empCode.trim().toUpperCase();
      const bodShare = bodMap.get(normalizedId) ?? 0;
      // Phil health code ↑

      // Pag ibig code ↓
      const rawPagibigEmployee = existingEmp?.pagibig_list[0]?.pagibig_employee_share?.toNumber() ?? 0;
      // Pag ibig code ↑

      const sssContribEmployee = Number(computeSSSContribution(basicSalary, sssTable,isNewProbi));
      
      const philhealthRateEmployee = computePhilRateEmployee(semiMonthly, phil_percentage,isBod,bodShare,isNewProbi);
      
      const pagibigEmployeeShare = computePagibig(rawPagibigEmployee);

      const totalGovernmentDeductions =
        sssContribEmployee +
        philhealthRateEmployee +
        pagibigEmployeeShare;

      const netPerPayroll =
        basicSalary - totalGovernmentDeductions;


      const totalExistingLoanDeduction = existingLoan.reduce(
        (sum, loan) => sum + Number(loan.per_payroll_deduct),
        0
      );

      const totalLoanDeductionWithNew =
        totalExistingLoanDeduction + perPayroll;

      const maxAllowedLoanDeduction = netPerPayroll * 0.5;

      const excessAmount =
       totalLoanDeductionWithNew - maxAllowedLoanDeduction;

    if (totalLoanDeductionWithNew > maxAllowedLoanDeduction && data.loan_type in ["PAGIBIG_LOAN", "SSS_LOAN", "FCH_LOAN", "RFC_LOAN", "ARE_LOAN"]) {
      throw new LoanLimitError({
        employee: {
          empCode: existingEmp?.EmpCode,
          employmentStatus: existingEmp?.EmploymentStatus,
        },
        salary: {
          netPerPayroll,
          maxAllowedLoanDeduction,
        },
        loans: {
          existingLoan,
          totalExistingLoanDeduction,
          newLoanDeduction: perPayroll,
          totalWithNewLoan: totalLoanDeductionWithNew,
          excessAmount,
        },
      });
    }

      const loan = await tx.loan_details.create({
        data: {
          EmpCodeId: data.empCode,
          loan_type: data.loan_type,
          principal: data.principal,
          term_value: data.term_value,
          rounding_types: data.rounding_type,
          start_deduction_cycle: data.start_deduction_cycle,
          term_unit: data.term_unit,
          start_date: startDate,
          deduct_allowance: data.deduct_allowance,
          deduct_first_pay:
          data.loan_type === "ARE_LOAN"
            ? data.deduct_first_pay
            : data.loan_type === "OTHERS"
              ? false
              : true,
          deduct_second_pay: data.loan_type === "ARE_LOAN" 
            ? data.deduct_sec_pay 
            : data.loan_type === "OTHERS"
                ? false
                : true,
          per_payroll_deduct: perPayroll,
          cycle_category:existingEmp?.BranchCode?.CompanyCode?.CompanyCycle,
          others_types: data.others_type,
          status: "ACTIVE",

        },
      });


      await tx.loan_ledger.create({
        data: {
          loan_id: loan.loan_id,
          EmpCodeId: data.empCode,
          transaction_date: startDate,
          transaction_type: "PAYROLL_DEDUCT",
          debit_amount: data.principal,
          credit_amount: 0,
          remarks: `Loan created`,
          payment_status: "NEW",
        },
      });

      return loan;
  });
}

type LoanFilterParams = {
  search?: string;
  department?: string[];
  company?: string[];
  status?: string[];
  loanStatus?: string[];
};

const buildWhere = (filters: LoanFilterParams) => {
    const AND: any[] = [];

    if (filters.search) {
      AND.push({
        OR: [
          {
            EmpCodeId: {
              contains: filters.search,
            },
          },
          {
            EmpCode: {
              AND: [
                { Firstname: { not: null } },
                { Firstname: { contains: filters.search } },
              ],
            },
          },
          {
            EmpCode: {
              AND: [
                { Middlename: { not: null } },
                { Middlename: { contains: filters.search } },
              ],
            },
          },
          {
            EmpCode: {
              AND: [
                { Lastname: { not: null } },
                { Lastname: { contains: filters.search } },
              ],
            },
          },
        ],
      });
    }




    if (filters.department?.length) {
      AND.push({
        EmpCode: {
          Department: { in: filters.department },
        },
      });
    }


    if (filters.status?.length) {
      AND.push({
        EmpCode: {
          EmploymentStatus: { in: filters.status },
        },
      });
    }


    if (filters.company?.length) {
      AND.push({
        EmpCode: {
          BranchCode: {
            CompanyCode: {
              CompanyCode: { in: filters.company },
            },
          },
        },
      });
    }

    if (filters.loanStatus?.length) {
      AND.push({
        status: { in: filters.loanStatus },
      });
    }

    return AND.length ? { AND } : {};
  };



export const getAllLoans = async ({
  skip,
  take,
  search,
  department,
  company,
  status,
  loanStatus,
}: {
  skip: number;
  take: number;
  search?: string;
  department?: string[];
  company?: string[];
  status?: string[];
  loanStatus?: string[];
}) => {
  const loans = await prisma.loan_details.findMany({
    skip,
    take,
    where: buildWhere({ search, department, company, status, loanStatus }),
    orderBy: { loan_id: "desc" },
    select: {
      loan_id: true,
      principal: true,
      loan_type: true,
      term_value: true,
      term_unit: true,
      start_date: true,
      deduct_allowance: true,
      per_payroll_deduct: true,
      extended_term:true,
      status: true,
      others_types: true,
      EmpCode: {
        select: {
          Firstname: true,
          Middlename: true,
          Lastname: true,
        },
      },
    },
  });

  return loans.map((loan) => ({
    ...loan,
    fullname: [
      loan.EmpCode?.Firstname,
      loan.EmpCode?.Middlename,
      loan.EmpCode?.Lastname,
    ]
      .filter(Boolean)
      .join(" "),
  }));
};



export const countLoans = async (filters: LoanFilterParams) => {
  return prisma.loan_details.count({
    where: buildWhere(filters),
  });
};


export const getLoanWithLedger = async (loan_id: number) =>{
  const loan = await prisma.loan_details.findUnique({
    where: {loan_id},
    select:{
      loan_id: true,
      principal: true,
      start_date: true,
      per_payroll_deduct: true,
      term_value: true,
      term_unit: true,
      deduct_allowance: true,
      status: true,
      ledger:{
        where:{
          transaction_type:{
            not:"LOAN_UPDATED",
          }
        },
        orderBy: { transaction_date: "asc" },
        select:{
          loan_ledger_id: true,
          created_at:true,
          transaction_date: true,
          transaction_type: true,
          debit_amount: true,
          credit_amount: true,
          remarks: true,
          payment_status: true,
        },
      },
    },
  });
  if (!loan){
    throw new Error("Loan not Found");
  }
  const totalPaid = loan.ledger.reduce(
    (sum, l) => sum + Number(l.credit_amount),
    0
  );

  const remainingBalance = 
        Number(loan.principal) - totalPaid;

  const paidCount = loan.ledger.filter(
    (l) => Number(l.credit_amount) > 0
  ).length;


  return{
    ...loan,
    totalPaid,
    paidCount,
    remainingBalance,
  };
};

export const getEmpLoan = async (loan_id: number) => {
  const empLoan = await prisma.loan_details.findUnique({
    where: { loan_id },
    select: {
      loan_id: true,
      principal: true,
      loan_type: true,
      rounding_types:true,
      start_deduction_cycle:true,
      term_value: true,
      term_unit: true,
      start_date: true,
      deduct_allowance: true,
      deduct_first_pay:true,
      deduct_second_pay:true,
      per_payroll_deduct: true,
      status: true,
      ledger: {
        where: {
          transaction_type: { not: "LOAN_UPDATED" },
        },
        orderBy: { transaction_date: "asc" },
        select: {
          loan_ledger_id: true,
          transaction_date: true,
          transaction_type: true,
          payment_status: true,
          debit_amount: true,
          credit_amount: true,
          remarks: true,
        },
      },
    },
  });

  if (!empLoan) throw new Error("Loan not found");


  const ledger = empLoan.ledger.map(l => {
    const isDeduction = l.transaction_type === "PAYROLL_DEDUCT";
    const isPaid = isDeduction && l.payment_status === "PAID";
    const isCreated = isDeduction && l.payment_status === "NEW";
    const isSkipped = !isDeduction && l.payment_status === "SKIPPED";

    return {
      loan_ledger_id: l.loan_ledger_id,
      transaction_date: l.transaction_date.toISOString(),
      transaction_type: l.transaction_type,
      payment_status: l.payment_status,
      debit_amount: Number(l.debit_amount),
      credit_amount: Number(l.credit_amount),
      remarks: l.remarks,

      isDeduction,
      isPaid,
      isCreated,
      isSkipped
    };
  });

  const totalPaid = ledger.reduce(
    (sum, l) => sum + l.credit_amount,
    0
  );

  const remainingBalance = Math.max(
    Number(empLoan.principal) - totalPaid,
    0
  );

  const totalMonths =
    empLoan.term_unit === "YEARS"
      ? empLoan.term_value * 12
      : empLoan.term_value;

  let deductionsPerMonth: number;

    if (empLoan.loan_type === "ARE_LOAN") {

      const divisor =
        Number(empLoan.deduct_allowance) +
        Number(empLoan.deduct_first_pay) +
        Number(empLoan.deduct_second_pay);

      if (divisor <= 0) {
        throw new Error("At least one deduction option must be selected");
      }

      deductionsPerMonth = divisor; 

    } else {

      deductionsPerMonth = empLoan.deduct_allowance ? 3 : 2;

    }

  const totalExpectedDeductions =
      totalMonths * deductionsPerMonth;

  const usedDeductions = ledger.filter(l => l.isPaid).length;

  const remainingPayment =
    empLoan.status === "CLOSED"
      ? 0
      : Math.max(
          totalExpectedDeductions - usedDeductions,
          0
        );

  return {
    loan_id: empLoan.loan_id,
    principal: Number(empLoan.principal),
    loan_type: empLoan.loan_type,
    start_deduction_cycle: empLoan.start_deduction_cycle,
    rounding_types: empLoan.rounding_types,
    term_value: empLoan.term_value,
    term_unit: empLoan.term_unit,
    start_date: empLoan.start_date.toISOString(),
    deduct_allowance: empLoan.deduct_allowance,
    deduct_first_pay: empLoan.deduct_first_pay,
    deduct_sec_pay: empLoan.deduct_second_pay,
    per_payroll_deduct: Number(empLoan.per_payroll_deduct),
    status: empLoan.status,

    totalPaid,
    remainingBalance,
    totalExpectedDeductions,
    remainingPayment,

    ledger,
  };
};


export const updateEmployeeLoan = async (data: updateLoanProps) => {
  return prisma.$transaction(async (tx) => {
    const existingLoan = await tx.loan_details.findUnique({
      where: { loan_id: data.loan_id },
      select: {
        loan_id: true,
        rounding_types:true,
        start_deduction_cycle:true,
        EmpCodeId: true,
        principal: true,
        term_value: true,
        term_unit: true,
        start_date: true,
        deduct_allowance: true,
        deduct_first_pay:true,
        deduct_second_pay:true,
      },
    });


    console.log(data.deduct_first_pay, data.deduct_sec_pay)
    if (!existingLoan) {
      throw new Error("Loan not found");
    }

    const payments = await tx.loan_ledger.aggregate({
      where: { loan_id: data.loan_id },
      _sum: { credit_amount: true },
    });

    const totalPaid = Number(payments._sum.credit_amount ?? 0);
    const hasPayments = totalPaid > 0;

    if (hasPayments) {
      const structureChanged =
        Number(data.principal) !== Number(existingLoan.principal) ||
        data.term_value !== existingLoan.term_value ||
        data.term_unit !== existingLoan.term_unit ||
        data.start_date.getTime() !==
          new Date(existingLoan.start_date).getTime();

      if (structureChanged) {
        throw new Error(
          "Loan structure cannot be modified after payments have started"
        );
      }
    }

    const totalTerms =
      data.term_unit === "YEARS"
        ? data.term_value * 12
        : data.term_value;

    if (totalTerms <= 0) {
      throw new Error("Invalid loan terms");
    }

    const baseAmount = hasPayments
      ? Number(existingLoan.principal) - totalPaid
      : Number(data.principal);



    let deductionsPerMonth: number;

    if (data.loan_type === "ARE_LOAN") {

      const divisor =
        Number(data.deduct_allowance) +
        Number(data.deduct_first_pay) +
        Number(data.deduct_sec_pay);

      if (divisor <= 0) {
        throw new Error("At least one deduction option must be selected");
      }

      deductionsPerMonth = divisor; 

    } else {

      deductionsPerMonth = data.deduct_allowance ? 3 : 2;

    }


    let perPayroll: number = 0;

    const rawPerPayroll =
        Number(data.principal) / totalTerms / deductionsPerMonth;
        
    if(data.loan_type === "FCH_LOAN"){
        if (data.rounding_type === "Tens") {
          perPayroll = Math.round(rawPerPayroll / 10) * 10;
        } else {
          perPayroll = Math.ceil(rawPerPayroll);
        }
    }
    else{
      perPayroll = Math.round(rawPerPayroll * 100) / 100;
    }

    const updatedLoan = await tx.loan_details.update({
      where: { loan_id: data.loan_id },
      data: {
        loan_type: data.loan_type,
        rounding_types: data.rounding_type,
        start_deduction_cycle: data.start_deduction_cycle,
        deduct_allowance: data.deduct_allowance,
        deduct_first_pay: data.deduct_first_pay,
        deduct_second_pay: data.deduct_sec_pay,
        per_payroll_deduct: perPayroll,

        ...(hasPayments
          ? {}
          : {
              principal: data.principal,
              term_value: data.term_value,
              term_unit: data.term_unit,
              start_date: data.start_date,
            }),
      },
    });

    await tx.loan_ledger.create({
      data: {
        loan_id: data.loan_id,
        EmpCodeId: existingLoan.EmpCodeId,
        transaction_date: new Date(),
        transaction_type: "LOAN_UPDATED",
        debit_amount: 0,
        credit_amount: 0,
        remarks: hasPayments
          ? "Deduct allowance updated (future only)"
          : "Loan details updated",
        payment_status: "Normal",
      },
    });

    return updatedLoan;
  });
};


export const updateLoanStatus = async (loan_id:number,remarks:string) =>{
  if (!remarks || !remarks.trim()) {
      throw new Error("Remarks are required");
    }

  return prisma.$transaction(async (tx) => {
    const existingLoan = await tx.loan_details.findUnique({
      where: { loan_id },
      select: {
        EmpCodeId: true,
        status: true,
      },
    });

    if (!existingLoan) {
      throw new Error("Loan not found");
    }

    if (existingLoan.status === "CLOSED") {
      throw new Error("Loan is already CLOSED");
    }

  const updateLoan = await tx.loan_details.update({
      where:{
        loan_id:loan_id,
      },
      data:{
        status:"CLOSED",
      }
    });

  await tx.loan_ledger.create({
      data:{
        loan_id: loan_id,
        EmpCodeId: existingLoan.EmpCodeId,
        transaction_date: new Date(),
        transaction_type: "LOAN_CLOSED",
        debit_amount: 0,
        credit_amount: 0,
        remarks: remarks,
        payment_status: "CLOSED",
      }
    });
    return updateLoan;
  });
}














function getLastDayOfMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getNextPayroll(
  deduct_allowance: boolean,
  transactionDate: Date,
  payrollCycle: PayrollCycle,
  cycleCategory: CycleCategory
) {
  const year = transactionDate.getFullYear();
  const month = transactionDate.getMonth();

  const rule = CYCLE_RULES[cycleCategory];
  const { first, second } = rule;
  const third = "third" in rule ? rule.third : null;

  const lastDayOfMonth = getLastDayOfMonth(year, month);


  if (String(payrollCycle) === String(first)) {
    return {
      transaction_date: new Date(
        year,
        month,
        Math.min(second, lastDayOfMonth)
      ),
      payroll_cycle: String(second) as PayrollCycle,
    };
  }

  if (
    deduct_allowance &&
    third &&
    String(payrollCycle) === String(second)
  ) {
    return {
      transaction_date: new Date(
        year,
        month,
        Math.min(third, lastDayOfMonth)
      ),
      payroll_cycle: String(third) as PayrollCycle,
    };
  }


  return {
    transaction_date: new Date(year, month + 1, first),
    payroll_cycle: String(first) as PayrollCycle,
  };

}

export const insertLoanPayment = async (
  loan_id: number,
  actionType: LoanActionType
) => {
  return prisma.$transaction(async (tx) => {

    if (!LOAN_ACTION_TYPES.includes(actionType)) {
      throw new Error("Invalid transaction type");
    }

    const fetchLoan = await tx.loan_details.findUnique({
      where: { loan_id },
      select: {
        loan_id: true,
        start_date: true,
        EmpCodeId: true,
        status: true,
        principal: true,
        per_payroll_deduct: true,
        cycle_category: true,
        term_value: true,
        term_unit: true,
        deduct_allowance: true,
        extended_term: true,
        start_deduction_cycle: true,
      },
    });

    if (!fetchLoan) throw new Error("Loan not found");
    if (fetchLoan.status === "CLOSED")
      throw new Error("Loan is already CLOSED");

    const cycleCategory: CycleCategory =
      fetchLoan.cycle_category &&
      fetchLoan.cycle_category in CYCLE_RULES
        ? (fetchLoan.cycle_category as CycleCategory)
        : DEFAULT_CYCLE_CATEGORY;

    // ===============================
    // GET LAST VALID PAYROLL STEP
    // ===============================
    const latestValidLedger = await tx.loan_ledger.findFirst({
      where: {
        loan_id,
        payment_status: { in: ["PAID", "SKIPPED"] },
      },
      orderBy: { transaction_date: "desc" },
    });

    let transaction_date: Date;
    let payroll_cycle: PayrollCycle;

    const startCycle = String(fetchLoan.start_deduction_cycle ?? "");

    // ===============================
    // DETERMINE SCHEDULE
    // ===============================
    if (!latestValidLedger) {
      // 🔥 FIRST SCHEDULE (BASED ONLY ON start_date)

      const baseDate = fetchLoan.start_date;
      const year = baseDate.getFullYear();
      const month = baseDate.getMonth();
      const lastDay = getLastDayOfMonth(year, month);

      if (startCycle) {
        const cycleDay = Number(startCycle);

        transaction_date = new Date(
          year,
          month,
          Math.min(cycleDay, lastDay)
        );

        payroll_cycle = startCycle as PayrollCycle;
      } else {
        const rule = CYCLE_RULES[cycleCategory];

        transaction_date = new Date(year, month, rule.first);
        payroll_cycle = String(rule.first) as PayrollCycle;
      }

    } else {
      // ✅ NORMAL CONTINUATION

      const next = getNextPayroll(
        fetchLoan.deduct_allowance,
        latestValidLedger.transaction_date,
        latestValidLedger.payroll_cycle as PayrollCycle,
        cycleCategory
      );

      transaction_date = next.transaction_date;
      payroll_cycle = next.payroll_cycle;
    }

    // ===============================
    // PAYMENT CALCULATIONS
    // ===============================
    const paidLedgers = await tx.loan_ledger.findMany({
      where: {
        loan_id,
        transaction_type: "PAYROLL_DEDUCT",
        payment_status: "PAID",
      },
      select: { credit_amount: true },
    });

    const totalPaidSoFar = paidLedgers.reduce(
      (sum, l) => sum + Number(l.credit_amount),
      0
    );

    const totalMonths =
      fetchLoan.term_unit === "YEARS"
        ? fetchLoan.term_value * 12
        : fetchLoan.term_value;

    const deductionsPerMonth = fetchLoan.deduct_allowance ? 3 : 2;

    const totalExpectedDeductions =
      totalMonths * deductionsPerMonth;

    const isLastPayment =
      paidLedgers.length + 1 === totalExpectedDeductions;

    const remainingBalance =
      Number(fetchLoan.principal) - totalPaidSoFar;

    const creditAmount = isLastPayment
      ? remainingBalance
      : Number(fetchLoan.per_payroll_deduct);

    // ===============================
    // INSERT LEDGER
    // ===============================
    if (isLastPayment) {
      const closedLedger = await tx.loan_ledger.create({
        data: {
          loan_id,
          EmpCodeId: fetchLoan.EmpCodeId,
          transaction_date,
          payroll_cycle,
          transaction_type: "LOAN_CLOSED",
          debit_amount: 0,
          credit_amount: creditAmount,
          payment_status: "CLOSED",
        },
      });

      await tx.loan_details.update({
        where: { loan_id },
        data: { status: "CLOSED" },
      });

      return closedLedger;
    }

    if (actionType === "EARLY_PAY") {
      return tx.loan_ledger.create({
        data: {
          loan_id,
          EmpCodeId: fetchLoan.EmpCodeId,
          transaction_date,
          payroll_cycle,
          transaction_type: "PAYROLL_DEDUCT",
          debit_amount: 0,
          credit_amount: creditAmount,
          remarks: "Loan Credited to Payroll",
          payment_status: "PAID",
        },
      });
    }

    if (actionType === "SKIPPED") {
      const skippedLoan = await tx.loan_ledger.create({
        data: {
          loan_id,
          EmpCodeId: fetchLoan.EmpCodeId,
          transaction_date,
          payroll_cycle,
          transaction_type: "LOAN_SKIPPED",
          debit_amount: 0,
          credit_amount: 0,
          remarks: "Loan skipped term will be extended.",
          payment_status: "SKIPPED",
        },
      });

      await tx.loan_details.update({
        where: { loan_id },
        data: {
          extended_term: fetchLoan.extended_term.toNumber() + 0.5,
        },
      });

      return skippedLoan;
    }
  });
};


export const fetchLoanByEmpCode = async (payCyclePeriod: PayCyclePeriod): Promise<LoanResult> => {
  const [payrollYear, payrollMonth] = payCyclePeriod.payPeriod
    .split("-")
    .map(Number);

  const monthCycle = payCyclePeriod.payCycle.split("-")[0];

  return prisma.$transaction(async (tx) => {
    const activeLoans = await tx.loan_details.findMany({
      where: {
        EmpCodeId: payCyclePeriod.EmpCode,
        status: "ACTIVE",
        loan_type: {
          in: ["PAGIBIG_LOAN", "SSS_LOAN", "FCH_LOAN", "RFC_LOAN", "ARE_LOAN"],
        },
      },
      select: {
        loan_id: true,
        loan_type: true,
        principal: true,
        term_value: true,
        term_unit: true,
        start_date: true,
        per_payroll_deduct:true,
        deduct_allowance: true,
      },
    });


    const result: LoanResult = {
      FCH_LOAN: null,
      SSS_LOAN: null,
      PAGIBIG_LOAN: null,
      RFC_LOAN: null,
    };

    for (const loan of activeLoans) {
      const latestLedger = await tx.loan_ledger.findFirst({
        where: {
          loan_id: loan.loan_id,
        },
        orderBy: {
          transaction_date: "desc",
        },
      });

      let hasLedgerForCurrentCycle = false;

      if (latestLedger) {
        const ledgerDate = latestLedger.transaction_date;
        const ledgerYear = ledgerDate.getFullYear();
        const ledgerMonth = ledgerDate.getMonth() + 1;

        hasLedgerForCurrentCycle =
          ledgerYear === payrollYear &&
          ledgerMonth === payrollMonth &&
          latestLedger.payroll_cycle === monthCycle;
      }

      result[loan.loan_type as keyof LoanResult] = {
        ...loan,
        latestLedger,
        hasLedgerForCurrentCycle,
      };
    }

    return result;
  });
};


export const fetchBonusRule = async () =>{
    return prisma.bonusRule.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      select:{
        code:true,
        name:true,
        formulaType:true,
      },
      orderBy:{
        code:"asc"
      }

    })
}



export async function searchEmployees(keyword: string) {
  const employees = await prisma.employee.findMany({
    where: {
      OR: [
        { Firstname: { contains: keyword } },
        { Lastname: { contains: keyword } },
        { EmpCode: { contains: keyword } },
      ],
    },
    take: 10,
    select: {
      EmpCode: true,
      Firstname: true,
      Lastname: true,
      employeepayroll: {
        select: {
          basic_salary: true,
        }
      }
    },
  });

  return employees.map(emp => ({
    EmpCode: emp.EmpCode,
    Firstname: emp.Firstname,
    Lastname: emp.Lastname,
    basic_salary: emp.employeepayroll?.basic_salary ?? 0
  }));
}


export const getLoanSummary = async (
  month: string,
  cycle:string,
  period: string,
  companyCode?: string,
  loanType?:string
) => {

  const startDate = new Date(`${month}-01`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const loans = await prisma.loan_details.findMany({
    where: {
      loan_type: loanType || undefined,
      cycle_category: cycle || undefined,
      EmpCode: {
        BranchCode: {
          company_id: companyCode || undefined
        }
      },

      ledger: {
        some: {
          payroll_cycle: period,
          transaction_date: {
            gte: startDate,
            lt: endDate
          }
        }
      }
    },

    include: {
      EmpCode: {
        select: {
          Firstname: true,
          Lastname: true,
          BranchCode: {
            select: {
              company_id: true
            }
          }
        }
      },

      ledger: {
        where: {
          transaction_date: {
            lt: endDate
          }
        },
        select: {
          credit_amount: true,
          payroll_cycle: true,
          transaction_date: true
        }
      }
    }
  });

  return loans.map((loan) => {

    const totalPaid = Number(
      loan.ledger
        .filter((l) => {
          const txDate = new Date(l.transaction_date);

          if (txDate < startDate) return true;

          if (txDate >= startDate && txDate < endDate) {
            return (
              l.payroll_cycle !== null &&
              Number(l.payroll_cycle) <= Number(period)
            );
          }

          return false;
        })
        .reduce((sum, l) => sum + Number(l.credit_amount), 0)
        .toFixed(2)
    );

    const runningBalance = Number(
      (Number(loan.principal) - totalPaid).toFixed(2)
    );

    const endDateComputed = new Date(loan.start_date);
    endDateComputed.setMonth(
      endDateComputed.getMonth() +
      loan.term_value * (loan.term_unit === "YEARS" ? 12 : 1)
    );

    return {
      loan_id: loan.loan_id,
      name: `${loan.EmpCode?.Firstname} ${loan.EmpCode?.Lastname}`,
      loan_type: loan.loan_type,
      description: loan.others_types,
      principal: loan.principal,
      start: loan.start_date,
      end: endDateComputed,
      deduction: loan.per_payroll_deduct,
      total_deduction: totalPaid,
      running_balance: runningBalance
    };
  });
};


export const removeLoanLedger = async (
  loan_id: number,
  ledger_id: number,
  remarks: string
) => {
  return prisma.$transaction(async (tx) => {

    const ledger = await tx.loan_ledger.findUnique({
      where: { loan_ledger_id: ledger_id }
    });

    if (!ledger) {
      throw new Error("Ledger not found");
    }

    if (ledger.loan_id !== loan_id) {
      throw new Error("Ledger mismatch");
    }

    await tx.loan_ledger_logs.create({
      data: {
        loan_id: ledger.loan_id,
        ledger_id: ledger.loan_ledger_id,

        transaction_date: ledger.transaction_date,
        transaction_type: ledger.transaction_type,
        debit_amount: ledger.debit_amount,
        credit_amount: ledger.credit_amount,
        payment_status: ledger.payment_status,
        payroll_cycle: ledger.payroll_cycle,

        remarks,
        type: "LEDGER_DELETED"
      }
    });

    await tx.loan_ledger.delete({
      where: { loan_ledger_id: ledger_id }
    });

    return { success: true };

  });
};


export const updateLedgerTransactionDate = async (
  loan_id: number,
  ledger_id: number,
  transaction_date: Date,
  remarks: string
) => {
  return prisma.$transaction(async (tx) => {

    const ledger = await tx.loan_ledger.findUnique({
      where: { loan_ledger_id: ledger_id }
    });

    if (!ledger) {
      throw new Error("Ledger not found");
    }

    if (ledger.loan_id !== loan_id) {
      throw new Error("Ledger mismatch");
    }

    const updatedLedger = await tx.loan_ledger.update({
      where: { loan_ledger_id: ledger_id },
      data: {
        transaction_date
      }
    });

    await tx.loan_ledger_logs.create({
      data: {
        loan_id,
        remarks,
        type: "LEDGER_DATE_UPDATED"
      }
    });

    return updatedLedger;
  });
};