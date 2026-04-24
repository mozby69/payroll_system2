// services/auth.service.ts
import { prisma } from "../../config/prismaClient"
import bcrypt from "bcrypt";
import { monthMap } from "./editableLoan.utils";
import { overRideProps } from "./editableLoan.types"


export const saveOverrideLoan = async (data: overRideProps[]) => {
  if (!data || data.length === 0) {
    throw new Error("No override data provided");
  }

  return prisma.$transaction(async (tx) => {
    const results = [];

    for (const item of data) {

      // ✅ Get loan details first
      const loanDetail = await tx.loan_details.findFirst({
        where: {
          loan_id: item.loan_id,
          status: "Active",
          loan_type: item.loan_type,
        },
        select: {
          per_payroll_deduct: true,
        },
      });

      if (!loanDetail) {
        throw new Error(`Active loan not found for loan_id ${item.loan_id}`);
      }

      const computedCredit =
        Number(loanDetail.per_payroll_deduct) * 2;

      const record = await tx.over_ride_loan.create({
        data: {
          loan_id: item.loan_id,
          userId: item.master_id,
          credit_amount: computedCredit, 
          payroll_cycle: item.payroll_cycle,
          payroll_period: item.payroll_period,
        },
      });

      results.push(record);
    }

    return {
      success: true,
      count: results.length,
    };
  });
};

export const fetchLoanLedger = async (
  loanType: string,
  EmpCode: string,
  PayPeriod: string,
  PayCode: string
) => {

  const [monthStr, , , yearStr] = PayCode.split("-");

  const PayrollCycle = PayPeriod === "25-pay-cycle" ? "10" : "25";

  const PayCodeMonth = monthMap[monthStr];
  const PayCodeYear = Number(yearStr);

  return prisma.$transaction(async (tx) => {

    const loan_detail = await tx.loan_details.findFirst({
      where: {
        EmpCodeId: EmpCode,
        status: "Active",
        loan_type: loanType,
      },
      select: {
        loan_id: true,
      },
    });

    if (!loan_detail) {
      return {
        isPrevPaymentMissing: false,
        hasOverride: false, // ✅ added
        message: "No active loan",
        ledgers: [],
      };
    }

    const ledgers = await tx.loan_ledger.findMany({
      where: {
        loan_id: loan_detail.loan_id,
      },
      orderBy: {
        transaction_date: "asc",
      },
    });

    const latestLedger = ledgers.length
      ? ledgers[ledgers.length - 1]
      : null;

    let isPrevPaymentMissing = false;

    if (latestLedger) {
      const ledgerDate = latestLedger.transaction_date;
      const ledgerYear = ledgerDate.getFullYear();
      const ledgerMonth = ledgerDate.getMonth() + 1;

      const isSamePeriod =
        ledgerYear === PayCodeYear &&
        ledgerMonth === PayCodeMonth &&
        latestLedger.payroll_cycle === PayrollCycle;

      isPrevPaymentMissing = !isSamePeriod;
    }

    const existingOverride = await tx.over_ride_loan.findFirst({
      where: {
        loan_id: loan_detail.loan_id,
        payroll_period: PayCode,
        payroll_cycle: PayPeriod,
      },
      select: {
        over_id: true,
      },
    });

    console.log("DEBUG override check:", {
      loan_id: loan_detail.loan_id,
      payroll_period: PayCode,
      payroll_cycle: PayrollCycle,
      result: existingOverride,
    });
    const hasOverride = !!existingOverride;

    const formattedLedgers = ledgers.map((item) => {
      const isPaid = item.payment_status === "PAID";

      return {
        ...item,
        debit_amount: isPaid ? item.debit_amount : 0,
        payment_status: item.payment_status ?? "UNPAID",
      };
    });

    return {
      isPrevPaymentMissing,
      hasOverride, // ✅ return this
      loan_id: loan_detail.loan_id,
      ledgers: formattedLedgers,
    };
  });
};

export const verifyPasswordService = async (password: string) => {
  const users = await prisma.user.findMany({
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  const allowedRoles = ["ADMIN", "PAYROLL_ADMIN"];

  for (const user of users) {
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) continue;

    const hasAccess = user.roles.some((ur) =>
      allowedRoles.includes(ur.role.name)
    );

    if (hasAccess) {
      return {
        success: true,
        user_id: user.id, 
      };
    }
  }

  throw new Error("Invalid password or no permission");
};