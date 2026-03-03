import { AuditAction, AuditModule } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { calculateBonusAmount, calculateBonusAmountWithLeave, countEligibleMonthsWithHalfRule, getBonusStartAndEndDate, getTenureInYears } from "./bonus.utils";
import { getLastDayOfMonthFromPeriod } from "../../helper/dateHelper";
import { createAuditLog } from "../audit/audit.service";
import { formatDateToMMDDYY } from "../../utils/formatDateToMMDDYY";
//Bonus Rules
export async function createBonusRuleService(data) {
    return prisma.bonusRule.create({ data });
}
export async function updateBonusRuleService(id, data) {
    const rule = await prisma.bonusRule.findUnique({ where: { id } });
    if (!rule)
        throw new Error("Bonus rule not found");
    // const used = await prisma.employeeBonus.findFirst({
    //   where: { bonusRuleId: id }
    // })
    // if (used) {
    //     const newRule = await prisma.bonusRule.create({
    //       data: {
    //         ...rule,
    //         ...data,
    //         id: undefined,
    //         version: rule.version + 1,
    //         parentRuleId: rule.id,
    //         isActive: true,
    //         createdAt: new Date()
    //       }
    //     })
    //     await prisma.bonusRule.update({
    //       where: {id: rule.id},
    //       data: {isActive: false}
    //     })
    //     await prisma.bonusRuleCompany.updateMany({
    //       where: {bonusRuleId: rule.id},
    //       data: {
    //         bonusRuleId: newRule.id
    //       }
    //     }
    //   )     
    //   return newRule
    // }
    return prisma.bonusRule.update({
        where: { id },
        data
    });
}
export async function getAllBonusRulesService() {
    return prisma.bonusRule.findMany({
        where: {
            isActive: true
        },
        include: {
            companyRule: {
                select: {
                    companyCode: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });
}
export async function deleteBonusRulesService(id) {
    const rule = await prisma.bonusRule.findUnique({ where: { id } });
    if (!rule)
        throw new Error("BONUS_RULE_NOT_FOUND");
    const used = await prisma.employeeBonus.findFirst({
        where: { bonusRuleId: id }
    });
    if (used) {
        return prisma.bonusRule.update({
            where: { id },
            data: {
                isActive: false,
                deletedAt: new Date()
            }
        });
    }
    return prisma.bonusRule.delete({
        where: { id }
    });
}
// Company Rules 
export async function createBonusRuleCompanyServices(data) {
    const rule = await prisma.bonusRule.findUnique({
        where: {
            id: data.bonusRuleId
        }
    });
    if (!rule)
        throw new Error("BONUS_RULE_NOT_FOUND");
    const company = await prisma.company_details.findMany({
        where: {
            CompanyCode: data.companyCode,
        }
    });
    if (company.length === 0)
        throw new Error("COMPANY_NOT_FOUND");
    const duplicate = await prisma.bonusRuleCompany.findMany({
        where: {
            companyCode: data.companyCode,
            bonusRuleId: data.bonusRuleId
        }
    });
    if (duplicate.length !== 0)
        throw new Error("RULES_DUPLICATION");
    return prisma.bonusRuleCompany.create({ data });
}
export async function deleteBonusRuleCompanyServices(id) {
    const rule = await prisma.bonusRuleCompany.findUnique({
        where: {
            id
        }
    });
    if (!rule)
        throw new Error("BONUS_RULE_NOT_FOUND");
    return prisma.bonusRuleCompany.delete({
        where: { id }
    });
}
export async function getBonusCompanyRuleServices(bonusRuleId) {
    const rule = await prisma.bonusRule.findUnique({
        where: {
            id: bonusRuleId
        },
    });
    if (!rule)
        throw new Error("BONUS_RULE_NOT_FOUND");
    return await prisma.bonusRuleCompany.findMany({
        where: {
            bonusRuleId
        }, select: {
            id: true,
            bonusRuleId: true,
            companyCode: true,
            companyDetails: true
        },
    });
}
//GENERATE BONUS
export async function generateBonusForAllEmployees({ bonusRuleId, releasePeriod, companyCode, asOfDate, generateDate, }) {
    return prisma.$transaction(async (tx) => {
        const rule = await tx.bonusRule.findUnique({
            where: { id: bonusRuleId },
            include: {
                companyRule: true
            }
        });
        if (!rule) {
            throw new Error("Bonus rule not found");
        }
        const startAndEnd = getBonusStartAndEndDate(rule.eligibleMonth, rule.bonusType, asOfDate);
        const pendingChecker = await tx.employeeBonus.findMany({
            where: {
                status: "GENERATED"
            }
        });
        const blockingSummary = await tx.bonusSummary.findFirst({
            where: {
                bonusRuleId,
                releasePeriod,
                status: {
                    in: ["GENERATED", "PENDING", "RELEASED", "APPROVED"]
                }
            }
        });
        if (blockingSummary?.status === "RELEASED") {
            throw {
                code: "PENDING_BONUS",
                status: 409,
                message: "A bonus generation is already released."
            };
        }
        if (blockingSummary?.status === "APPROVED") {
            throw {
                code: "PENDING_BONUS",
                status: 409,
                message: "A bonus generation is already approved."
            };
        }
        if (pendingChecker.length > 0 || blockingSummary) {
            throw {
                code: "PENDING_BONUS",
                status: 409,
                message: "A bonus generation is already pending. Please complete or cancel the existing process before generating a new bonus."
            };
        }
        const companies = await tx.bonusRuleCompany.findMany({
            where: {
                bonusRuleId,
                ...(companyCode ? { companyCode } : {})
            }
        });
        if (companies.length === 0) {
            throw new Error("NO_COMPANY_ASSIGNED");
        }
        const companyCodes = companies.map(c => c.companyCode);
        const employees = await tx.employee.findMany({
            where: {
                AND: [
                    {
                        BranchCode: {
                            CompanyCode: {
                                CompanyCode: {
                                    in: companyCodes,
                                },
                            },
                        },
                    },
                    {
                        OR: [
                            { EmployeeStatus: "Active" },
                            { bod_member: "bod1" },
                            { bod_member: "bod2" },
                        ],
                    },
                ],
            },
            include: {
                employeepayroll: true,
                loan_details: {
                    where: {
                        status: "ACTIVE"
                    }
                }
            }
        });
        console.log(employees);
        const invalidEmployees = [];
        for (const emp of employees) {
            if (!emp.EmployementDate)
                continue;
            const tenure = getTenureInYears(emp.EmployementDate, asOfDate);
            if (tenure < rule.minTenureYear)
                continue;
            const payroll = emp.employeepayroll;
            if (!payroll || !payroll.basic_salary) {
                invalidEmployees.push({
                    empCode: emp.EmpCode,
                    name: emp.Firstname,
                    basicSalary: 0,
                    amount: 0
                });
                continue;
            }
            const basicSalary = Number(payroll.basic_salary);
            const amount = calculateBonusAmount(rule.formulaType, basicSalary);
            if (amount <= 0) {
                invalidEmployees.push({
                    empCode: emp.EmpCode,
                    name: emp.Firstname,
                    basicSalary,
                    amount
                });
            }
        }
        // if (invalidEmployees.length > 0) {
        //   throw new Error(
        //     JSON.stringify({
        //       code: "INVALID_BONUS_AMOUNT",
        //       invalidEmployees
        //     })
        //   )
        // }
        const bonusSummary = await tx.bonusSummary.create({
            data: {
                bonusRuleId,
                releasePeriod,
                asOfDate,
                generateDate,
                totalAmount: 0,
                totalEmployees: 0
            }
        });
        let totalEmployees = 0;
        let totalAmount = 0;
        const existingBonuses = await tx.employeeBonus.findMany({
            where: {
                bonusRuleId: rule.id,
                releasePeriod,
                bonusSummaryId: bonusSummary.id
            },
            select: {
                employeeCode: true
            }
        });
        const existingEmployeeCodes = new Set(existingBonuses.map(b => b.employeeCode));
        const bonusStart = new Date(startAndEnd.bonusStart);
        const bonusEnd = new Date(startAndEnd.bonusEnd);
        const employeesWithLeave = await tx.employee.findMany({
            where: {
                specialLeaves: {
                    some: {
                        OR: [
                            // Normal leave (Active, etc.)
                            {
                                status: { not: "Expected" },
                                start: { not: null, lte: bonusEnd },
                                end: { not: null, gte: bonusStart }
                            },
                            // Expected leave
                            {
                                status: "Expected",
                                expectedStart: { not: null, lte: bonusEnd },
                                expectedEnd: { not: null, gte: bonusStart }
                            }
                        ]
                    }
                }
            },
            include: {
                specialLeaves: {
                    where: {
                        OR: [
                            {
                                status: { not: "Expected" },
                                start: { not: null, lte: bonusEnd },
                                end: { not: null, gte: bonusStart }
                            },
                            {
                                status: "Expected",
                                expectedStart: { not: null, lte: bonusEnd },
                                expectedEnd: { not: null, gte: bonusStart }
                            }
                        ]
                    }
                }
            }
        });
        const leaveMap = new Map(employeesWithLeave.map(emp => [
            emp.EmpCode,
            emp.specialLeaves
        ]));
        const rows = [];
        let remarks = "";
        let hasLeave = false;
        for (const emp of employees) {
            if (!emp.EmployementDate)
                continue;
            const tenure = getTenureInYears(emp.EmployementDate, asOfDate);
            if (tenure < rule.minTenureYear)
                continue;
            const payroll = emp.employeepayroll;
            if (!payroll?.basic_salary)
                continue;
            if (existingEmployeeCodes.has(emp.EmpCode))
                continue;
            const employeeLeaves = leaveMap.get(emp.EmpCode);
            let amount = 0;
            if (employeeLeaves && employeeLeaves.length > 0) {
                employeeLeaves.forEach(leave => {
                    if (!leave.start && !leave.expectedStart)
                        return;
                    if (!leave.end && !leave.expectedEnd)
                        return;
                    const leaveStart = leave.status === "Expected" && leave.expectedStart
                        ? new Date(leave.expectedStart)
                        : leave.start
                            ? new Date(leave.start)
                            : null;
                    const leaveEnd = leave.status === "Expected" && leave.expectedEnd
                        ? new Date(leave.expectedEnd)
                        : leave.end
                            ? new Date(leave.end)
                            : null;
                    const eligibleMonth = countEligibleMonthsWithHalfRule(bonusStart, bonusEnd, leaveStart, leaveEnd);
                    hasLeave = true;
                    const res = calculateBonusAmountWithLeave(rule.bonusType, eligibleMonth, Number(payroll.basic_salary));
                    amount = res.amount;
                    remarks = `${leave.leaveName} LEAVE (START: ${formatDateToMMDDYY(leaveStart)}) BACK TO WORK - ${formatDateToMMDDYY(leaveEnd)} = (${Number(payroll.basic_salary) / 2} X ${eligibleMonth} / ${res.count})`;
                });
            }
            else {
                amount = calculateBonusAmount(rule.formulaType, Number(payroll.basic_salary));
                remarks = "";
                hasLeave = false;
            }
            // Find matching active loans
            const matchingLoans = emp.loan_details.filter(loan => loan.status === "ACTIVE" &&
                loan.others_types === rule.code);
            // Compute total principal
            const totalPrincipal = matchingLoans.reduce((sum, loan) => sum + Number(loan.principal), 0);
            // Deduct from bonus
            let finalAmount = amount - totalPrincipal;
            // Prevent negative bonus
            if (finalAmount < 0) {
                finalAmount = 0;
            }
            if (amount <= 0)
                continue;
            rows.push({
                employeeCode: emp.EmpCode,
                bonusRuleId: rule.id,
                amount: amount,
                bonusSummaryId: bonusSummary.id,
                generatedForMonth: rule.eligibleMonth,
                loanDeduction: totalPrincipal,
                netAmount: finalAmount,
                releasePeriod,
                status: "GENERATED",
                hasLeave,
                remarks
            });
            totalEmployees++;
            totalAmount += amount;
        }
        if (rows.length > 0) {
            await tx.employeeBonus.createMany({
                data: rows,
                skipDuplicates: true
            });
        }
        await tx.bonusSummary.update({
            where: { id: bonusSummary.id },
            data: {
                totalEmployees,
                totalAmount
            }
        });
        return { success: true };
    });
}
export async function getEmployeeBonusService() {
    const rows = await prisma.employeeBonus.findMany({
        where: {
            status: "GENERATED"
        },
        select: {
            employeeCode: true,
            amount: true,
            bonusRuleId: true,
            releasePeriod: true,
            bonusRule: {
                select: {
                    code: true,
                    name: true,
                    bonusType: true,
                    minTenureYear: true,
                }
            },
            employee: {
                select: {
                    Firstname: true,
                    Middlename: true,
                    Lastname: true,
                    EmployementDate: true,
                    EmploymentStatus: true,
                    employeepayroll: {
                        select: {
                            basic_salary: true
                        }
                    }
                }
            }
        },
        orderBy: {
            employee: {
                Firstname: "desc"
            }
        }
    });
    return rows.map(row => ({
        ...row,
        tenureMonths: row.employee?.EmployementDate
            ? getTenureInYears(row.employee.EmployementDate, getLastDayOfMonthFromPeriod(row.releasePeriod))
            : 0
    }));
}
export async function getEmployeeBonusServiceBySummaryIdService(bonusSummaryId) {
    return await prisma.employeeBonus.findMany({
        where: {
            bonusSummaryId: bonusSummaryId
        },
        select: {
            employeeCode: true,
            amount: true,
            bonusRuleId: true,
            releasePeriod: true,
            bonusRule: {
                select: {
                    code: true,
                    name: true,
                    bonusType: true,
                    minTenureYear: true,
                }
            },
            employee: {
                select: {
                    Firstname: true,
                    Middlename: true,
                    Lastname: true,
                    EmployementDate: true,
                    EmploymentStatus: true,
                }
            }
        }
    });
}
export async function resetBonusService() {
    return prisma.$transaction(async (tx) => {
        const summaries = await tx.bonusSummary.findMany({
            where: {
                status: "GENERATED"
            },
            select: {
                id: true
            }
        });
        if (summaries.length === 0) {
            return {
                success: false,
                message: "No generated bonus to reset"
            };
        }
        const summaryIds = summaries.map(s => s.id);
        await tx.employeeBonus.updateMany({
            where: {
                bonusSummaryId: { in: summaryIds },
                status: "GENERATED"
            },
            data: {
                status: "RESET",
                resetAt: new Date()
            }
        });
        await tx.bonusSummary.updateMany({
            where: {
                id: { in: summaryIds }
            },
            data: {
                status: "RESET",
                resetAt: new Date()
            }
        });
        return {
            success: true,
            message: "Bonus successfully reset",
            affectedSummaries: summaryIds.length
        };
    });
}
export async function submitBonusSerive() {
    return prisma.$transaction(async (tx) => {
        const summaries = await tx.bonusSummary.findMany({
            where: {
                status: "GENERATED"
            },
            select: {
                id: true
            }
        });
        if (summaries.length === 0) {
            return {
                success: false,
                message: "No generated bonus to submit"
            };
        }
        const summaryIds = summaries.map(s => s.id);
        await tx.bonusSummary.updateMany({
            where: {
                id: { in: summaryIds }
            },
            data: {
                status: "PENDING",
                createdAt: new Date()
            }
        });
        const update = await tx.employeeBonus.updateMany({
            where: {
                bonusSummaryId: { in: summaryIds }
            },
            data: {
                status: "PENDING",
                generatedAt: new Date()
            }
        });
        return {
            updated: update.count,
            message: "Bonus summaries successfully submitted.",
            summaryIds
        };
    });
}
export async function getBonusSummaryService() {
    return await prisma.bonusSummary.findMany({
        where: {
            status: {
                notIn: ["RESET", "GENERATED"]
            }
        },
        include: {
            bonusRule: {
                select: {
                    code: true,
                    name: true,
                    companyRule: {
                        select: {
                            companyCode: true
                        }
                    }
                }
            }
        },
        orderBy: {
            id: "desc"
        }
    });
}
export async function approveBonusService(bonusSummaryId, approvedBy) {
    return prisma.$transaction(async (tx) => {
        const summary = await tx.bonusSummary.findUnique({
            where: { id: bonusSummaryId }
        });
        if (!summary) {
            throw new Error("Bonus summary not found.");
        }
        if (summary.status === "APPROVED") {
            throw new Error("Bonus already released.");
        }
        if (summary.status !== "PENDING") {
            throw new Error("Released bonus cannot be modified.");
        }
        await tx.bonusSummary.update({
            where: { id: bonusSummaryId },
            data: {
                status: "APPROVED",
                approvedDate: new Date(),
                approvedById: approvedBy
            }
        });
        const updated = await tx.employeeBonus.updateMany({
            where: {
                bonusSummaryId,
                status: { not: "APPROVED" }
            },
            data: {
                status: "APPROVED"
            }
        });
        await createAuditLog(tx, {
            module: AuditModule.BONUS,
            action: AuditAction.APPROVE,
            referenceId: bonusSummaryId,
            performedById: approvedBy,
            description: "Approved bonus summary",
            metadata: {
                previousStatus: "PENDING",
                newStatus: "APPROVED"
            }
        });
        return {
            message: "Bonus approved successfully",
            updatedEmployees: updated.count,
            bonusSummaryId
        };
    });
}
export async function rejectBonusService(bonusSummaryId, releasedBy) {
    return prisma.$transaction(async (tx) => {
        const summary = await tx.bonusSummary.update({
            where: {
                id: bonusSummaryId
            },
            data: {
                status: "CANCELLED",
                updatedAt: new Date(),
                rejectedById: releasedBy
            }
        });
        await tx.employeeBonus.updateMany({
            where: {
                bonusSummaryId: bonusSummaryId
            },
            data: {
                status: "CANCELLED"
            }
        });
        return {
            message: "Bonus summary has been successfully cancelled.",
            summary,
        };
    });
}
export async function releaseBonusService(bonusSummaryId, releasedBy) {
    return prisma.$transaction(async (tx) => {
        const summary = await tx.bonusSummary.findUnique({
            where: { id: bonusSummaryId },
            include: {
                bonusRule: {
                    select: {
                        id: true,
                        code: true,
                        name: true
                    },
                },
            },
        });
        if (!summary) {
            throw new Error("Bonus summary not found");
        }
        const loanSummary = await tx.bonusSummary.findUnique({
            where: { id: bonusSummaryId },
            include: {
                employeeBonuses: {
                    where: {
                        employee: {
                            loan_details: {
                                some: {
                                    status: "ACTIVE",
                                    others_types: summary.bonusRule.code,
                                    principal: { not: 0 },
                                },
                            },
                        },
                    },
                    include: {
                        employee: {
                            include: {
                                loan_details: {
                                    where: {
                                        status: "ACTIVE",
                                        others_types: summary.bonusRule.code,
                                        principal: { not: 0 },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!loanSummary) {
            throw new Error("Bonus summary not found");
        }
        const allLoanDetails = loanSummary.employeeBonuses.flatMap(b => b.employee?.loan_details ?? []);
        const loanIds = allLoanDetails.map(l => l.loan_id);
        await tx.loan_details.updateMany({
            where: {
                loan_id: {
                    in: loanIds
                }
            },
            data: {
                status: "CLOSED"
            }
        });
        await tx.loan_ledger.createMany({
            data: allLoanDetails.map(loan => ({
                loan_id: loan.loan_id,
                EmpCodeId: loan.EmpCodeId,
                transaction_date: new Date(),
                transaction_type: "PAYROLL_DEDUCT",
                debit_amount: 0,
                credit_amount: Number(loan.principal),
                remarks: `Loan deducted from  ${summary.bonusRule.name}`,
                payment_status: "PAID"
            }))
        });
        await tx.bonusSummary.update({
            where: {
                id: bonusSummaryId
            },
            data: {
                status: "RELEASED"
            }
        });
        await tx.employeeBonus.updateMany({
            where: {
                bonusSummaryId
            },
            data: {
                status: "RELEASED"
            }
        });
        return {
            message: "Employees with active loans retrieved successfully",
            updatedEmployees: loanIds,
            bonusSummaryId,
        };
    });
}
export async function getEmployeesByBonusSummarySerive(companyCode, id) {
    return await prisma.$transaction(async (tx) => {
        const summary = await tx.bonusSummary.findFirst({
            include: {
                bonusRule: {
                    select: { code: true, name: true, bonusType: true, }
                }
            },
            where: id
                ? { id }
                : { status: "GENERATED" }
        });
        if (!summary) {
            return {
                summary: null,
                companies: [],
                employees: [],
            };
        }
        const allowedCompanies = await tx.bonusRuleCompany.findMany({
            where: {
                bonusRuleId: summary.bonusRuleId,
            },
            select: { companyCode: true },
            orderBy: {
                companyCode: "asc"
            }
        });
        const companyCodes = allowedCompanies.map(c => c.companyCode);
        if (companyCodes.length === 0) {
            return {
                summary,
                companies: [],
                employees: [],
            };
        }
        const selectedCompanyCode = companyCode ?? allowedCompanies[0].companyCode;
        const test = await prisma.$transaction(async (tx) => {
            return await reconcileEmployeePayrollBonus(tx, selectedCompanyCode, summary);
        });
        console.log("test: ", test);
        const employees = await tx.employee.findMany({
            where: {
                AND: [
                    {
                        BranchCode: {
                            CompanyCode: {
                                CompanyCode: selectedCompanyCode
                            },
                        },
                    },
                    {
                        OR: [
                            { EmployeeStatus: "Active" },
                            { bod_member: "bod1" },
                            { bod_member: "bod2" },
                        ],
                    },
                ],
            },
            include: {
                employeepayroll: true,
                employee_bonues: {
                    where: { bonusSummaryId: summary.id },
                },
                BranchCode: {
                    select: {
                        CompanyCode: {
                            select: {
                                CompanyCode: true,
                            },
                        },
                    },
                },
                loan_details: {
                    where: {
                        status: "ACTIVE",
                        others_types: summary.bonusRule.code,
                    },
                },
            },
            orderBy: { Lastname: "asc" },
        });
        const result = employees.map(emp => {
            const bonus = emp.employee_bonues[0];
            return {
                employeeCode: emp.EmpCode,
                companyCode: emp.BranchCode?.CompanyCode?.CompanyCode,
                fullName: `${emp.Lastname}, ${emp.Firstname}`,
                employementDate: emp.EmployementDate,
                tenureYears: emp.EmployementDate
                    ? getTenureInYears(emp.EmployementDate, getLastDayOfMonthFromPeriod(summary.releasePeriod))
                    : 0,
                basicSalary: emp.employeepayroll?.basic_salary ?? 0,
                bonusAmount: bonus?.amount ?? 0,
                bonusStatus: bonus?.status ?? "NOT_GENERATED",
                bonusId: bonus?.id ?? null,
                fchLoan: bonus?.loanDeduction ?? 0,
                netAmount: bonus?.netAmount ?? 0,
                hasLeave: bonus?.hasLeave ?? false,
                remarks: bonus?.remarks ?? null,
                notes: bonus?.notes ?? null,
            };
        });
        return {
            summary,
            companies: allowedCompanies,
            employees: result,
        };
    });
}
export async function updateBonusService(id, bonusAmount, performedById) {
    return prisma.$transaction(async (tx) => {
        const existing = await tx.employeeBonus.findUnique({
            where: { id }
        });
        if (!existing) {
            throw new Error("Bonus not found");
        }
        const loanDeduction = existing.loanDeduction?.toNumber() ?? 0;
        const netAmount = bonusAmount - loanDeduction;
        const updated = await tx.employeeBonus.update({
            where: { id },
            data: {
                amount: bonusAmount,
                netAmount,
                updatedAt: new Date() // also fix field name if typo
            }
        });
        await tx.auditLog.create({
            data: {
                module: "BONUS",
                action: "UPDATE",
                referenceId: id,
                referenceCode: existing.employeeCode ?? null,
                description: `Updated bonus amount from ${existing.amount} to ${bonusAmount}`,
                metadata: {
                    oldAmount: existing.amount,
                    newAmount: bonusAmount,
                    loanDeduction,
                    netAmount
                },
                performedById,
            }
        });
        return updated;
    });
}
export async function checkPayrollService() {
    const totalResult = await prisma.employeePayrollArchive.aggregate({
        _sum: { Basic_salary: true },
        where: {
            EmpCode: {
                BranchCode: {
                    company_id: "EMB",
                },
            },
        },
    });
    const employees = await prisma.employeePayrollArchive.findMany({
        where: {
            EmpCode: {
                BranchCode: {
                    company_id: "EMB",
                },
            },
        },
        select: {
            Basic_salary: true,
            EmpCode: {
                select: {
                    Lastname: true,
                },
            },
        },
        orderBy: {
            EmpCode: {
                Lastname: "asc"
            }
        }
    });
    return {
        totalBasicSalary: totalResult._sum.Basic_salary ?? 0,
        employees,
    };
}
export async function getEmployeesWithVarianceService(companyCodes) {
    const [archiveData, currentData] = await prisma.$transaction([
        // Archive salaries
        prisma.employeePayrollArchive.findMany({
            where: {
                EmpCode: {
                    BranchCode: {
                        company_id: companyCodes,
                    },
                },
            },
            select: {
                EmpCodeId: true,
                Basic_salary: true,
            },
        }),
        // Current salaries
        prisma.employee.findMany({
            where: {
                BranchCode: {
                    CompanyCode: {
                        CompanyCode: companyCodes,
                    },
                },
                OR: [
                    { EmployeeStatus: "Active" },
                    { bod_member: { in: ["bod1", "bod2"] } },
                ],
            },
            select: {
                EmpCode: true,
                employeepayroll: {
                    select: {
                        basic_salary: true
                    }
                },
                Lastname: true,
                Firstname: true,
            },
        }),
    ]);
    // Convert archive to map for fast lookup
    const archiveMap = new Map();
    archiveData.forEach(a => {
        archiveMap.set(a.EmpCodeId, Number(a.Basic_salary || 0));
    });
    const employeesWithVariance = currentData
        .map(emp => {
        const archiveSalary = archiveMap.get(emp.EmpCode) ?? 0;
        const currentSalary = Number(emp.employeepayroll?.basic_salary || 0);
        const variance = currentSalary - archiveSalary;
        return {
            EmpCode: emp.EmpCode,
            name: `${emp.Lastname ?? ""}, ${emp.Firstname ?? ""}`,
            archiveSalary,
            currentSalary,
            variance,
        };
    })
        .filter(emp => emp.variance !== 0);
    return employeesWithVariance;
}
export async function reconcileEmployeePayrollBonus(tx, selectedCompanyCode, summary) {
    // 1️⃣ Employees
    const employees = await tx.employee.findMany({
        where: {
            AND: [
                {
                    BranchCode: {
                        CompanyCode: {
                            CompanyCode: selectedCompanyCode,
                        },
                    },
                },
                {
                    OR: [
                        { EmployeeStatus: "Active" },
                        { EmployeeStatus: "Probationary" },
                        { bod_member: "bod1" },
                        { bod_member: "bod2" },
                    ],
                },
            ],
        },
        select: {
            EmpCode: true,
            Firstname: true,
            Lastname: true,
        },
    });
    // 2️⃣ Payroll Archive
    const payrollArchive = await tx.employeePayrollArchive.findMany({
        where: {
            EmpCode: {
                BranchCode: {
                    company_id: selectedCompanyCode,
                },
            },
        },
        select: {
            EmpCodeId: true,
        },
    });
    // 3️⃣ Bonus Records (this summary only)
    const bonusRecords = await tx.employeeBonus.findMany({
        where: {
            bonusSummaryId: summary.id,
        },
        select: {
            employeeCode: true,
            amount: true, // important
        },
    });
    // =============================
    // Build Sets
    // =============================
    const archiveSet = new Set(payrollArchive.map(p => p.EmpCodeId));
    const bonusSet = new Set(bonusRecords.map(b => b.employeeCode));
    // =============================
    // 🎯 CORE VARIANCE LOGIC
    // =============================
    const varianceEmployees = employees
        .filter(emp => bonusSet.has(emp.EmpCode) && // has bonus (even zero)
        !archiveSet.has(emp.EmpCode) // but no payroll archive
    )
        .map(emp => ({
        EmpCode: emp.EmpCode,
        name: `${emp.Lastname ?? ""}, ${emp.Firstname ?? ""}`,
    }));
    return {
        totalEmployees: employees.length,
        varianceCount: varianceEmployees.length,
        varianceEmployees,
    };
}
