import { LeaveName, LeaveStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { displayCompletePayroll } from "../payroll_archive/payroll_archive.service";
import { parsePayCycleToDate } from "./variance.helper";
import { MathRound } from "../../utils/toFixed";
import { isSecondCutoff } from "../prepare_payroll/prepare_payroll.computation";
import { empty } from "@prisma/client/runtime/library";
import { PayrollCycle, SaveVarianceOverrideParams, UserAccount, VarianceArchiveProps } from "./variance.types";

export async function fetchVariance(company_id: string, cycle: "10-25-Cycle" | "15-30-Cycle", userAcc: string) {
  try {

    let pre_computed: any[] = [];

    if (userAcc === "PAYROLL_CHECKER") {
      pre_computed = (await displayCompletePayroll(["PENDING"])) ?? [];
    }

    if (userAcc === "FINANCIAL_CHECKER") {
      pre_computed = (await displayCompletePayroll(["FOR_CHECKER"])) ?? [];
    }

    if (userAcc === "FINANCE_APPROVER") {
      pre_computed = (await displayCompletePayroll(["FOR_APPROVER"])) ?? [];
    }


    const data = await prisma.totalPayrollByCompany.findMany({
      where: {
        company_id: company_id,
        cycle_category: cycle,
      },
      select: {
        PayCycle: true,
        total_basic_salary: true,
        Total_SSSContributionEmployee: true,
        Total_SSSContributionEmployer: true,
        Total_PhilhealthContributionEmployee: true,
        Total_PhilhealthContributionEmployer: true,
        Total_PagibigContributionEmployee: true,
        Total_PagibigContributionEmployer: true,
        total_wtax: true,
      },
      orderBy: {
        id: "desc",
      },
      take: 2,
    });

    //const pre_computed = await displayCompletePayroll(["PENDING"]);

    const computed = (pre_computed ?? []).filter((e) => {
      const isRegularCompany =
        e.company_id === company_id && e.EmpCode?.isAlien === false;

      const isAlienSecondaryCompany =
        e.EmpCode?.isAlien === true &&
        e.EmpCode?.secondaryBranch?.company_id === company_id;

      return isRegularCompany || isAlienSecondaryCompany;
    });

    const PayCode = computed[0].PayCode;

    const currentBasicPay = computed.reduce((total, employee) => {
      return total + Number(employee.semi_monthly ?? 0);
    }, 0);

    const currentSSSEmployee = computed.reduce((total, employee) => {
      return total + Number(employee.sss_contrib_employee ?? 0)
    }, 0)

    const currentSSSEmployer = computed.reduce((total, employee) => {
      return total + Number(employee.sss_contrib_employer ?? 0);
    }, 0);

    const currentPhilEmployee = computed.reduce((total, employee) => {
      return total + Number(employee.philhealth_contrib_employee ?? 0);
    }, 0);

    const currentPhilEmployer = computed.reduce((total, employee) => {
      return total + Number(employee.philhealth_contrib_employer ?? 0);
    }, 0);

    const currentPagibigEmployee = computed.reduce((total, employee) => {
      return total + Number(employee.pagibig_contrib_employee ?? 0);
    }, 0);

    const currentPagibigEmployer = computed.reduce((total, employee) => {
      return total + Number(employee.pagibig_contrib_employer ?? 0);
    }, 0);

    const currentWtax = computed.reduce((total, employee) => {
      return total + Number(employee.wtax ?? 0);
    }, 0);


    const recentPrev = data[0];
    const olderPrev = data[1];


    if (isSecondCutoff(PayCode)) {
      return {
        current: {
          paycode: PayCode,
          basic_pay: currentBasicPay,
          sss_employee: currentSSSEmployee,
          sss_employer: currentSSSEmployer,
          phil_employee: MathRound(currentPhilEmployee),
          phil_employer: MathRound(currentPhilEmployer),
          pagibig_employee: currentPagibigEmployee,
          pagibig_employer: currentPagibigEmployer,
          wtax: currentWtax,
        },
        recent_prev: {
          paycode: recentPrev?.PayCycle,
          basic_pay: Number(recentPrev?.total_basic_salary ?? 0),
          sss_employee: 0,
          sss_employer: 0,
          phil_employee: 0,
          phil_employer: 0,
          pagibig_employee: Number(recentPrev?.Total_PagibigContributionEmployee ?? 0),
          pagibig_employer: Number(recentPrev?.Total_PagibigContributionEmployer ?? 0),
          wtax: Number(recentPrev?.total_wtax ?? 0),
        },
        older_prev: {
          paycode: olderPrev?.PayCycle,
          basic_pay: 0,
          sss_employee: 0,
          sss_employer: 0,
          phil_employee: 0,
          phil_employer: 0,
          pagibig_employee: Number(olderPrev?.Total_PagibigContributionEmployee ?? 0),
          pagibig_employer: Number(olderPrev?.Total_PagibigContributionEmployer ?? 0),
          wtax: Number(olderPrev?.total_wtax ?? 0),
        },
        variance: {
          paycode: "VARIANCE",
          basic_pay_variance: currentBasicPay - Number(recentPrev?.total_basic_salary),
          sss_employee: currentSSSEmployee,
          sss_employer: currentSSSEmployer,
          phil_employee: MathRound(currentPhilEmployee),
          phil_employer: MathRound(currentPhilEmployer),
          pagibig_employee: currentPagibigEmployee - Number(olderPrev?.Total_PagibigContributionEmployee ?? 0),
          pagibig_employer: currentPagibigEmployer - Number(olderPrev?.Total_PagibigContributionEmployer ?? 0),
          wtax: currentWtax - Number(olderPrev?.total_wtax ?? 0),
        }
      }
    }
    else {
      return {
        current: {
          paycode: PayCode,
          basic_pay: currentBasicPay,
          sss_employee: currentSSSEmployee,
          sss_employer: currentSSSEmployer,
          phil_employee: MathRound(currentPhilEmployee),
          phil_employer: MathRound(currentPhilEmployer),
        },
        recent_prev: {
          paycode: recentPrev?.PayCycle,
          basic_pay: Number(recentPrev?.total_basic_salary ?? 0),
          sss_employee: 0,
          sss_employer: 0,
          phil_employee: 0,
          phil_employer: 0,
        },
        older_prev: {
          paycode: olderPrev?.PayCycle,
          basic_pay: 0,
          sss_employee: Number(olderPrev?.Total_SSSContributionEmployee ?? 0),
          sss_employer: Number(olderPrev?.Total_SSSContributionEmployer ?? 0),
          phil_employee: Number(olderPrev?.Total_PhilhealthContributionEmployee ?? 0),
          phil_employer: Number(olderPrev?.Total_PhilhealthContributionEmployer ?? 0),
        },
        variance: {
          paycode: "VARIANCE",
          basic_pay_variance: currentBasicPay - Number(recentPrev?.total_basic_salary),
          sss_employee_variance: currentSSSEmployee - Number(olderPrev?.Total_SSSContributionEmployee),
          sss_employer_variance: currentSSSEmployer - Number(olderPrev?.Total_SSSContributionEmployer),
          phil_employee_variance: MathRound(currentPhilEmployee - Number(olderPrev?.Total_PhilhealthContributionEmployee)),
          phil_employer_variance: MathRound(currentPhilEmployer - Number(olderPrev?.Total_PhilhealthContributionEmployer)),
        }
      };
    }


  } catch (error) {
    console.error(`error occurred in service ${error}`);
    throw error;
  }
}





















//EMPLOYEE VARIANCE 
export async function FetchEmployeeVariance(company_id: string, cycle: "10-25-Cycle" | "15-30-Cycle", userAcc: string) {
  try {
    const payrolls = await prisma.totalPayrollByCompany.findMany({
      where: {
        company_id,
        cycle_category: cycle,
      },
      select: {
        PayCycle: true,
      },
      orderBy: {
        id: "desc",
      },
      take: 2,
    });

    const latestPayroll = payrolls[0];
    const secondLatestPayroll = payrolls[1];

    if (!latestPayroll?.PayCycle || !secondLatestPayroll?.PayCycle) {
      return {
        Probationary: {
          paycycles: [],
          employees: [],
        },
      };
    }



    let pre_computed: any[] = [];

    if (userAcc === "PAYROLL_CHECKER") {
      pre_computed = (await displayCompletePayroll(["PENDING"])) ?? [];
    }

    if (userAcc === "FINANCIAL_CHECKER") {
      pre_computed = (await displayCompletePayroll(["FOR_CHECKER"])) ?? [];
    }

    if (userAcc === "FINANCE_APPROVER") {
      pre_computed = (await displayCompletePayroll(["FOR_APPROVER"])) ?? [];
    }

    //const allComputed = await displayCompletePayroll(["PENDING"]);

    const computed = (pre_computed ?? []).filter((employee) => {
      const isRegularCompany =
        employee.company_id === company_id &&
        employee.EmpCode?.isAlien === false;

      const isAlienSecondaryCompany =
        employee.EmpCode?.isAlien === true &&
        employee.EmpCode?.secondaryBranch?.company_id === company_id;

      return isRegularCompany || isAlienSecondaryCompany;
    });

    if (computed.length === 0) {
      return {
        Probationary: {
          paycycles: [latestPayroll.PayCycle, secondLatestPayroll.PayCycle],
          employees: [],
        },
      };
    }

    const computedEmpCodes = computed.map((employee) => employee.EmpCodeId?.trim())
      .filter((empCode): empCode is string => Boolean(empCode));


    const getPaycode = computed[0]?.PayCode?.trim();




    const archiveEmployees1 = await prisma.employeePayrollArchive.findMany({
      where: {
        PayCode: latestPayroll.PayCycle,
        cycle_category: cycle,
        payrollBranch: {
          company_id,
        },
      },
      select: {
        EmpCodeId: true,
        PayCode: true,
        Basic_salary: true,
      },
    });

    const archiveEmployees2 = await prisma.employeePayrollArchive.findMany({
      where: {
        PayCode: secondLatestPayroll.PayCycle,
        cycle_category: cycle,
        payrollBranch: {
          company_id,
        },
      },
      select: {
        EmpCodeId: true,
        PayCode: true,
        philhealth_employee_share: true,
        philhealth_employer_share: true,
        SSS_employee_share: true,
        SSS_employer_share: true,
        Pagibig_employee_share: true,
        Pagibig_employer_share: true,
        w_tax: true,
      },
    });



    const archiveBasicMap = new Map(
      archiveEmployees1.map((employee) => [
        employee.EmpCodeId.trim(),
        employee,
      ])
    );

    const archiveContributionMap = new Map(
      archiveEmployees2.map((employee) => [
        employee.EmpCodeId.trim(),
        employee,
      ])
    );

    const currentComputedMap = new Map(
      computed.map((employee) => [
        employee.EmpCodeId.trim(),
        employee,
      ])
    );

    const allVarianceEmpCodes = new Set<string>([
      ...computedEmpCodes,
      ...archiveEmployees1.map((employee) =>
        employee.EmpCodeId.trim()
      ),
      ...archiveEmployees2.map((employee) =>
        employee.EmpCodeId.trim()
      ),
    ]);

    const employeeInfoRecords = await prisma.employee.findMany({
      where: {
        EmpCode: {
          in: [...allVarianceEmpCodes],
        },
      },
      select: {
        EmpCode: true,
        Lastname: true,
        Firstname: true,
        EmploymentStatus: true,
        EmployeeStatus: true,
        Taxable: true,
      },
    });

    const employeeInfoMap = new Map(
      employeeInfoRecords.map((employee) => [
        employee.EmpCode.trim(),
        employee,
      ])
    );


    const toCentavos = (
      value: number | string | null | undefined
    ): number => {
      const numericValue = Number(value ?? 0);

      if (!Number.isFinite(numericValue)) {
        return 0;
      }

      return Math.round(numericValue * 100);
    };

    const calculateMoneyVariance = (
      currentValue: number | string | null | undefined,
      previousValue: number | string | null | undefined
    ): number => {
      const currentCentavos = toCentavos(currentValue);
      const previousCentavos = toCentavos(previousValue);

      return (currentCentavos - previousCentavos) / 100;
    };

    const toVarianceEmployee = (empCode: string) => {
      const current = currentComputedMap.get(empCode);
      const basicArchive = archiveBasicMap.get(empCode);
      const contributionArchive = archiveContributionMap.get(empCode);
      const info = employeeInfoMap.get(empCode);

      const currentBasic = Number(current?.semi_monthly ?? 0);
      const previousBasic = Number(
        basicArchive?.Basic_salary ?? 0
      );

      const currentSSSEmployee = Number(
        current?.sss_contrib_employee ?? 0
      );
      const previousSSSEmployee = Number(
        contributionArchive?.SSS_employee_share ?? 0
      );

      const currentSSSEmployer = Number(
        current?.sss_contrib_employer ?? 0
      );
      const previousSSSEmployer = Number(
        contributionArchive?.SSS_employer_share ?? 0
      );

      const currentPhilEmployee = Number(
        current?.philhealth_contrib_employee ?? 0
      );
      const previousPhilEmployee = Number(
        contributionArchive?.philhealth_employee_share ?? 0
      );


      const currentPhilEmployer = Number(
        current?.philhealth_contrib_employer ?? 0
      );
      const previousPhilEmployer = Number(
        contributionArchive?.philhealth_employer_share ?? 0
      );

      const currentPagibigEmployee = Number(
        current?.pagibig_contrib_employee ?? 0
      );
      const previousPagibigEmployee = Number(
        contributionArchive?.Pagibig_employee_share ?? 0
      );

      const currentPagibigEmployer = Number(
        current?.pagibig_contrib_employer ?? 0
      );
      const previousPagibigEmployer = Number(
        contributionArchive?.Pagibig_employer_share ?? 0
      );
      const currentEmployeeWTax = Number(
        current?.wtax ?? 0
      );
      const previousEmployeeWTax = Number(
        contributionArchive?.w_tax ?? 0
      );

      const secondCutoff = isSecondCutoff(getPaycode);

      return {
        EmpCode: empCode,
        Lastname:
          current?.EmpCode?.Lastname ??
          info?.Lastname ??
          null,
        Firstname:
          current?.EmpCode?.Firstname ??
          info?.Firstname ??
          null,
        EmploymentStatus:
          current?.EmpCode?.EmploymentStatus ??
          info?.EmploymentStatus ??
          null,
        EmployeeStatus:
          current?.EmpCode?.EmployeeStatus ??
          info?.EmployeeStatus ??
          null,
        Taxable:
          current?.EmpCode?.Taxable ??
          info?.Taxable ??
          null,

        current_basic: currentBasic,
        previous_basic: previousBasic,
        basic_variance: MathRound(currentBasic - previousBasic),



        current_sss_employee: currentSSSEmployee,
        previous_sss_employee: previousSSSEmployee,
        sss_employee_variance: secondCutoff ? 0 : MathRound(currentSSSEmployee - previousSSSEmployee),
        //sss_employee_variance:  MathRound(currentSSSEmployee - previousSSSEmployee),

        current_sss_employer: currentSSSEmployer,
        previous_sss_employer: previousSSSEmployer,
        sss_employer_variance: secondCutoff ? 0 : MathRound(currentSSSEmployer - previousSSSEmployer),
        //sss_employer_variance: MathRound(currentSSSEmployer - previousSSSEmployer),

        current_phil_employee: currentPhilEmployee,
        previous_phil_employee: previousPhilEmployee,
        phil_employee_variance: secondCutoff ? 0 : MathRound(currentPhilEmployee - previousPhilEmployee),
        //phil_employee_variance: MathRound(currentPhilEmployee - previousPhilEmployee),


        current_phil_employer: currentPhilEmployer,
        previous_phil_employer: previousPhilEmployer,
        phil_employer_variance: secondCutoff ? 0 : MathRound(currentPhilEmployer - previousPhilEmployer),
        //phil_employer_variance: MathRound(currentPhilEmployer - previousPhilEmployer),

        current_pagibig_employee: currentPagibigEmployee,
        previous_pagibig_employee: previousPagibigEmployee,
        pagibig_employee_variance: MathRound(currentPagibigEmployee - previousPagibigEmployee),

        current_pagibig_employer: currentPagibigEmployer,
        previous_pagibig_employer: previousPagibigEmployer,
        pagibig_employer_variance: MathRound(currentPagibigEmployer - previousPagibigEmployer),

        // current_wtax: currentEmployeeWTax,
        // previous_wtax: previousEmployeeWTax,
        // wtax_variance: (currentEmployeeWTax - previousEmployeeWTax),
        wtax_variance: calculateMoneyVariance(
          currentEmployeeWTax,
          previousEmployeeWTax
        ),

        isCurrentPayroll: Boolean(current),
        isArchiveBasic: Boolean(basicArchive),
        isArchiveContribution: Boolean(contributionArchive),
      };
    };

    const hasVariance = (
      employee: ReturnType<typeof toVarianceEmployee>
    ) => {
      return (
        employee.basic_variance !== 0 ||
        employee.sss_employee_variance !== 0 ||
        employee.sss_employer_variance !== 0 ||
        employee.phil_employee_variance !== 0 ||
        employee.phil_employer_variance !== 0 ||
        employee.pagibig_employee_variance !== 0 ||
        employee.wtax_variance !== 0 ||
        employee.pagibig_employer_variance !== 0
      );
    };

    const allEmployeesWithVariance = [...allVarianceEmpCodes]
      .map(toVarianceEmployee)
      .filter(hasVariance);



    //probationary
    const probationaryEmployees = allEmployeesWithVariance.filter(
      (employee) => {
        const isProbationary =
          employee.EmploymentStatus === "Probationary";
        const isResigned = employee.EmployeeStatus === "Resigned";


        const hasLatestOrSecondLatestPayroll =
          !employee.isArchiveBasic ||
          !employee.isArchiveContribution;

        return (
          isProbationary &&
          hasLatestOrSecondLatestPayroll && !isResigned
        );
      }
    );


    //wtax






    //resigned
    const resignedEmployees = allEmployeesWithVariance.filter((employee) => {
      const isResigned = employee.EmployeeStatus === "Resigned";

      const hasLatestOrSecondLatestPayroll =
        employee.isArchiveBasic ||
        employee.isArchiveContribution;

      return (
        isResigned &&
        hasLatestOrSecondLatestPayroll
      );
    }
    );





    //back to work with special leave 
    const specialLeaveRecords =
      await prisma.specialLeaves.findMany({
        where: {
          empCodeId: {
            in: allEmployeesWithVariance.map((employee) =>
              employee.EmpCode.trim()
            ),
          },
          status: {
            in: [
              LeaveStatus.Completed,
              LeaveStatus.Active,
            ],
          },
        },
        select: {
          empCodeId: true,
          leaveName: true,
          status: true,
          start: true,
          end: true,
        },
      });

    const specialLeaveMap = new Map(
      specialLeaveRecords.map((leave) => [
        leave.empCodeId.trim(),
        leave,
      ])
    );

    const backToWorkWithSpecialLeave = allEmployeesWithVariance.filter((employee) => {
      const empCode = employee.EmpCode.trim();

      const doesNotExistInLatestOrSecondLatest =
        !employee.isArchiveBasic ||
        !employee.isArchiveContribution;

      const isNowPresentInCurrentPayroll =
        employee.isCurrentPayroll;

      const hasSpecialLeave =
        specialLeaveMap.has(empCode);

      return (
        doesNotExistInLatestOrSecondLatest &&
        isNowPresentInCurrentPayroll &&
        hasSpecialLeave
      );
    })
      .map((employee) => {
        const leave = specialLeaveMap.get(
          employee.EmpCode.trim()
        );

        return {
          ...employee,
          leaveName: leave?.leaveName ?? null,
        };
      });


    //back to work with no special leave 

    const backToWorkWithoutSpecialeave = allEmployeesWithVariance.filter((employee) => {
      const empCode = employee.EmpCode.trim();
      const isProbationary =
        employee.EmploymentStatus === "Probationary";

      const doesNotExistInLatestOrSecondLatest =
        !employee.isArchiveBasic ||
        !employee.isArchiveContribution;

      const isNowPresentInCurrentPayroll = employee.isCurrentPayroll;

      const hasSpecialLeave = specialLeaveMap.has(empCode);

      return (
        doesNotExistInLatestOrSecondLatest &&
        isNowPresentInCurrentPayroll && !hasSpecialLeave && !isProbationary

      );
    })
      .map((employee) => {

        return {
          ...employee,

        };
      });


    // missing in the current but with archive

    const missingIntheCurrentWithSpecialLeave = allEmployeesWithVariance.filter((employee) => {
      const empCode = employee.EmpCode.trim();

      const isResigned = employee.EmployeeStatus === "Resigned";


      const doesExistInLatestOrSecondLatest =
        employee.isArchiveBasic ||
        employee.isArchiveContribution;

      const isNowNotInCurrentPayroll =
        !employee.isCurrentPayroll;

      const hasSpecialLeave =
        specialLeaveMap.has(empCode);

      return (
        !isResigned &&
        doesExistInLatestOrSecondLatest &&
        isNowNotInCurrentPayroll &&
        hasSpecialLeave
      );
    }).map((employee) => {
      const leave = specialLeaveMap.get(
        employee.EmpCode.trim()
      );

      return {
        ...employee,
        leaveName: leave?.leaveName ?? null,
      };
    });


    // const basicVarianceTotal = allEmployeesWithVariance.reduce(
    //   (sum, employee) => sum + employee.basic_variance,
    //   0
    // );


    // missing in the current without speciaw leave 
    const missingIntheCurrentWithoutSpecialLeave = allEmployeesWithVariance.filter((employee) => {
      const empCode = employee.EmpCode.trim();
      const isResigned = employee.EmployeeStatus === "Resigned";


      const doesExistInLatestOrSecondLatest =
        employee.isArchiveBasic ||
        employee.isArchiveContribution;

      const isNowNotInCurrentPayroll =
        !employee.isCurrentPayroll;

      const hasSpecialLeave =
        specialLeaveMap.has(empCode);

      return (
        doesExistInLatestOrSecondLatest &&
        !isResigned &&
        isNowNotInCurrentPayroll &&
        !hasSpecialLeave
      );
    })
      .map((employee) => {


        return {
          ...employee,
        };
      });




    //exclude 


    const ExcludeInTax = new Set<string>([


      ...backToWorkWithoutSpecialeave.map(
        (employee) => employee.EmpCode.trim()
      ),

      ...backToWorkWithSpecialLeave.map(
        (employee) => employee.EmpCode.trim()
      ),

      ...missingIntheCurrentWithSpecialLeave.map(
        (employee) => employee.EmpCode.trim()
      ),
      ...resignedEmployees.map(
        (employee) => employee.EmpCode.trim()
      ),

      ...missingIntheCurrentWithoutSpecialLeave.map(
        (employee) => employee.EmpCode.trim()
      ),
    ]);

    const wtaxAdjustment = allEmployeesWithVariance.filter(
      (employee) => {
        const empCode = employee.EmpCode.trim();
        const isTaxable = employee.Taxable === true;

        const hasWtaxVariance = toCentavos(employee.wtax_variance) !== 0;


        const isExcluded = ExcludeInTax.has(empCode);

        return isTaxable && hasWtaxVariance && !isExcluded;
      }
    );

    const excludedFromSalaryAdjustment = new Set<string>([

      ...probationaryEmployees.map(
        (employee) => employee.EmpCode.trim()
      ),

      ...backToWorkWithoutSpecialeave.map(
        (employee) => employee.EmpCode.trim()
      ),

      ...backToWorkWithSpecialLeave.map(
        (employee) => employee.EmpCode.trim()
      ),

      ...missingIntheCurrentWithSpecialLeave.map(
        (employee) => employee.EmpCode.trim()
      ),
      ...resignedEmployees.map(
        (employee) => employee.EmpCode.trim()
      ),
      ...wtaxAdjustment.map(
        (employee) => employee.EmpCode.trim()
      ),
      ...missingIntheCurrentWithoutSpecialLeave.map(
        (employee) => employee.EmpCode.trim()
      ),
    ]);





    // salary adjustment: 

    const salaryHistoryRecords =
      await prisma.employeeSalaryHistory.findMany({
        where: {
          EmpCodeId: {
            in: allEmployeesWithVariance.map((employee) =>
              employee.EmpCode.trim()
            ),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const latestSalaryHistoryMap = new Map<
      string,
      (typeof salaryHistoryRecords)[number]
    >();

    for (const history of salaryHistoryRecords) {
      const empCode = history.EmpCodeId.trim();

      if (!latestSalaryHistoryMap.has(empCode)) {
        latestSalaryHistoryMap.set(empCode, history);
      }
    }

    /*
     * Only employees with a basic salary variance
     * can appear in salary adjustment.
     */
    const salaryAdjustmentEmployees =
      allEmployeesWithVariance.filter((employee) => {
        const empCode = employee.EmpCode.trim();

        if (excludedFromSalaryAdjustment.has(empCode)) {
          return false;
        }

        if (employee.basic_variance === 0) {
          return false;
        }

        return latestSalaryHistoryMap.has(empCode);
      });

    const salaryAdjustment = {
      increase: salaryAdjustmentEmployees
        .filter((employee) => {
          const empCode = employee.EmpCode.trim();

          if (excludedFromSalaryAdjustment.has(empCode)) {
            return false;
          }

          const history = latestSalaryHistoryMap.get(empCode);

          if (!history) {
            return false;
          }

          const oldSalary = Number(history.old_salary);
          const newSalary = Number(history.new_salary);

          return newSalary > oldSalary;
        })
        .map((employee) => {
          const history = latestSalaryHistoryMap.get(
            employee.EmpCode.trim()
          );

          if (!history) {
            return null;
          }

          const oldSalary = Number(history.old_salary);
          const newSalary = Number(history.new_salary);

          return {
            ...employee,
            old_salary: oldSalary,
            new_salary: newSalary,
            salary_variance: calculateMoneyVariance(
              newSalary,
              oldSalary
            ),
            remarks: history.remarks ?? null,
          };
        })
        .filter(
          (
            employee
          ): employee is NonNullable<typeof employee> =>
            employee !== null
        ),

      decrease: salaryAdjustmentEmployees
        .filter((employee) => {
          const empCode = employee.EmpCode.trim();

          if (excludedFromSalaryAdjustment.has(empCode)) {
            return false;
          }

          const history =
            latestSalaryHistoryMap.get(empCode);

          if (!history) {
            return false;
          }

          const oldSalary = Number(history.old_salary);
          const newSalary = Number(history.new_salary);

          return newSalary < oldSalary;
        })
        .map((employee) => {
          const history = latestSalaryHistoryMap.get(
            employee.EmpCode.trim()
          );

          if (!history) {
            return null;
          }

          const oldSalary = Number(history.old_salary);
          const newSalary = Number(history.new_salary);

          return {
            ...employee,
            old_salary: oldSalary,
            new_salary: newSalary,
            salary_variance: calculateMoneyVariance(
              newSalary,
              oldSalary
            ),
            remarks: history.remarks ?? null,
          };
        })
        .filter(
          (
            employee
          ): employee is NonNullable<typeof employee> =>
            employee !== null
        ),
    };


    //other variance

    const categorizedEmployeeCodes = new Set<string>([
      ...probationaryEmployees.map(
        (employee) => employee.EmpCode.trim()
      ),

      ...backToWorkWithSpecialLeave.map(
        (employee) => employee.EmpCode.trim()
      ),

      ...backToWorkWithoutSpecialeave.map(
        (employee) => employee.EmpCode.trim()
      ),

      ...missingIntheCurrentWithSpecialLeave.map(
        (employee) => employee.EmpCode.trim()
      ),

      ...missingIntheCurrentWithoutSpecialLeave.map(
        (employee) => employee.EmpCode.trim()
      ),

      ...resignedEmployees.map(
        (employee) => employee.EmpCode.trim()
      ),

      ...salaryAdjustment.increase.map(
        (employee) => employee.EmpCode.trim()
      ),

      ...salaryAdjustment.decrease.map(
        (employee) => employee.EmpCode.trim()
      ),

      ...wtaxAdjustment.map(
        (employee) => employee.EmpCode.trim()
      ),
    ]);

    const otherVarianceEmployees = allEmployeesWithVariance.filter((employee) => {
      const empCode = employee.EmpCode.trim();
      return !categorizedEmployeeCodes.has(empCode);
    });



    //get variance 
    const employeeGroups = [
      probationaryEmployees,
      backToWorkWithSpecialLeave,
      backToWorkWithoutSpecialeave,
      missingIntheCurrentWithSpecialLeave,
      missingIntheCurrentWithoutSpecialLeave,
      resignedEmployees,
      salaryAdjustment.increase,
      salaryAdjustment.decrease,
      wtaxAdjustment,
      otherVarianceEmployees,
    ];



    // ========================================
    // CATEGORY OVERRIDE START
    // ========================================

    type VarianceEmployee =
      (typeof allEmployeesWithVariance)[number];

    type OverrideEmployee =
      VarianceEmployee & {
        old_salary?: number;
        new_salary?: number;
        salary_variance?: number;
        remarks?: string | null;
        leaveName?: string | null;
      };

    type VarianceCategoryKey =
      | "Probationary"
      | "back_to_work_with_specialleave"
      | "back_to_work_without_specialleave"
      | "missing_in_current_with_specialleave"
      | "missing_in_current_without_specialleave"
      | "resigned"
      | "wtax_adjustment"
      | "salary_adjustment_increase"
      | "salary_adjustment_decrease"
      | "others";


    const varianceOverrides =
      await prisma.employeeVarianceOverride.findMany({
        where: {
          company_id,
          PayCode: getPaycode,
          cycle,
        },
      });

    const customCategories =
      await prisma.employeeVarianceCategory.findMany({
        orderBy: {
          title: "asc",
        },
      });


    const categories: Record<string, OverrideEmployee[]> = {
      Probationary: [...probationaryEmployees],

      back_to_work_with_specialleave: [
        ...backToWorkWithSpecialLeave,
      ],

      back_to_work_without_specialleave: [
        ...backToWorkWithoutSpecialeave,
      ],

      missing_in_current_with_specialleave: [
        ...missingIntheCurrentWithSpecialLeave,
      ],

      missing_in_current_without_specialleave: [
        ...missingIntheCurrentWithoutSpecialLeave,
      ],

      resigned: [...resignedEmployees],

      wtax_adjustment: [...wtaxAdjustment],

      salary_adjustment_increase: [
        ...salaryAdjustment.increase,
      ],

      salary_adjustment_decrease: [
        ...salaryAdjustment.decrease,
      ],

      others: [...otherVarianceEmployees],
    };

    for (const customCategory of customCategories) {
      const categoryKey = `custom_${customCategory.id}`;

      categories[categoryKey] = [];
    }

    for (const override of varianceOverrides) {
      const empCode = override.EmpCode.trim();

      let employee: OverrideEmployee | undefined;

      /*
       * Find employee from his/her current category.
       */
      for (const employees of Object.values(categories)) {
        const index = employees.findIndex(
          (item) =>
            item.EmpCode.trim() === empCode
        );

        if (index === -1) {
          continue;
        }

        employee = employees[index];

        /*
         * Remove employee from original category.
         */
        employees.splice(index, 1);

        break;
      }

      if (!employee) {
        continue;
      }

      /*
       * Find destination category.
       */
      const targetCategory =
        categories[override.category];

      if (!targetCategory) {
        continue;
      }

      /*
       * Move the same employee object.
       * Values are not modified.
       */
      targetCategory.push(employee);
    }

    // ========================================
    // CATEGORY OVERRIDE END
    // ==============




    const totalsVariance = employeeGroups.flat().reduce(
      (acc, employee) => {
        acc.basic_variance += Number(employee.basic_variance ?? 0);
        acc.pagibig_employee_variance += Number(employee.pagibig_employee_variance ?? 0);
        acc.pagibig_employer_variance += Number(employee.pagibig_employer_variance ?? 0);
        acc.sss_employee_variance += Number(employee.sss_employee_variance ?? 0);
        acc.sss_employer_variance += Number(employee.sss_employer_variance ?? 0);
        acc.phil_employee_variance += Number(employee.phil_employee_variance ?? 0);
        acc.phil_employer_variance += Number(employee.phil_employer_variance ?? 0);
        acc.wtax_variance += Number(employee.wtax_variance ?? 0);

        return acc;
      },
      {
        basic_variance: 0,
        pagibig_employee_variance: 0,
        pagibig_employer_variance: 0,
        sss_employee_variance: 0,
        sss_employer_variance: 0,
        phil_employee_variance: 0,
        phil_employer_variance: 0,
        wtax_variance: 0,
      }
    );

    return {
      Probationary: {
        employees: categories.Probationary,
      },

      back_to_work_with_specialleave: {
        employees:
          categories.back_to_work_with_specialleave,
      },

      back_to_work_without_specialleave: {
        employees:
          categories.back_to_work_without_specialleave,
      },

      missing_in_current_with_specialleave: {
        employees:
          categories.missing_in_current_with_specialleave,
      },

      missing_in_current_without_specialleave: {
        employees:
          categories.missing_in_current_without_specialleave,
      },

      resigned: {
        employees: categories.resigned,
      },

      salary_adjustment: {
        increase:
          categories.salary_adjustment_increase,

        decrease:
          categories.salary_adjustment_decrease,
      },

      wtax_adjustment: {
        employees: categories.wtax_adjustment,
      },

      others: {
        employees: categories.others,
      },
      custom_categories: customCategories.map(
        (category) => {
          const key = `custom_${category.id}`;

          return {
            id: category.id,
            key,
            title: category.title,
            employees: categories[key] ?? [],
          };
        }
      ),

      totalsVariance,
    };


  } catch (error) {
    console.error(`error occurred in service ${error}`);
    throw error;
  }
}




export async function CompleteVariance(company_id: string, cycle: "10-25-Cycle" | "15-30-Cycle", userAcc: string) {
  try {

    let pre_computed: any[] = [];

    if (userAcc === "PAYROLL_CHECKER") {
      pre_computed = (await displayCompletePayroll(["PENDING"])) ?? [];
    }

    if (userAcc === "FINANCIAL_CHECKER") {
      pre_computed = (await displayCompletePayroll(["FOR_CHECKER"])) ?? [];
    }

    if (userAcc === "FINANCE_APPROVER") {
      pre_computed = (await displayCompletePayroll(["FOR_APPROVER"])) ?? [];
    }

    const computed = (pre_computed ?? []).filter((e) => {
      const isRegularCompany =
        e.company_id === company_id && e.EmpCode?.isAlien === false;

      const isAlienSecondaryCompany =
        e.EmpCode?.isAlien === true &&
        e.EmpCode?.secondaryBranch?.company_id === company_id;

      return isRegularCompany || isAlienSecondaryCompany;
    });

    const PayCode = computed[0].PayCode;


    const variance = await fetchVariance(
      company_id,
      cycle,
      userAcc
    );

    const employeeVariance = await FetchEmployeeVariance(
      company_id,
      cycle,
      userAcc
    );

    const final_basic_variance = MathRound(variance.variance.basic_pay_variance) - MathRound(employeeVariance?.totalsVariance?.basic_variance);
    const final_pagibig_employee_var = MathRound(variance.variance.pagibig_employee) - MathRound(employeeVariance?.totalsVariance?.pagibig_employee_variance);
    const final_pagibig_employer_var = MathRound(variance.variance.pagibig_employer) - MathRound(employeeVariance?.totalsVariance?.pagibig_employer_variance);
    const final_wtax_var = MathRound(variance.variance.wtax) - MathRound(employeeVariance?.totalsVariance?.wtax_variance);
    const final_SSS_EE_var = MathRound(variance.variance.sss_employee_variance) - MathRound(employeeVariance?.totalsVariance?.sss_employee_variance);
    const final_SSS_ER_var = MathRound(variance.variance.sss_employer_variance) - MathRound(employeeVariance?.totalsVariance?.sss_employer_variance);
    const final_Phil_EE_var = MathRound(variance.variance.phil_employee_variance) - MathRound(employeeVariance?.totalsVariance?.phil_employee_variance);
    const final_Phil_ER_var = MathRound(variance.variance.phil_employer_variance) - MathRound(employeeVariance?.totalsVariance?.phil_employer_variance);



    if (isSecondCutoff(PayCode)) {
      return {
        final_basic_variance,
        final_pagibig_employee_var,
        final_pagibig_employer_var,
        final_wtax_var,
        final_SSS_EE_var,
        final_SSS_ER_var,
        final_Phil_EE_var,
        final_Phil_ER_var
      };

    }
    else {
      return {
        final_basic_variance,
        final_SSS_EE_var,
        final_SSS_ER_var,
        final_Phil_EE_var,
        final_Phil_ER_var
      };
    }

  } catch (error) {
    console.error(`error occurred ${error}`);
    throw error;
  }
}









export async function saveVarianceOverride({ EmpCode, PayCode, company_id, cycle, category }: SaveVarianceOverrideParams) {
  return prisma.employeeVarianceOverride.upsert({
    where: {
      EmpCode_PayCode_company_id_cycle: {
        EmpCode,
        PayCode,
        company_id,
        cycle,
      },
    },

    update: {
      category,
    },

    create: {
      EmpCode,
      PayCode,
      company_id,
      cycle,
      category,
    },
  });
}







export async function saveFinalVariance(company_id: string, cycle: PayrollCycle, userAcc: UserAccount, paycode: string) {
  try {
    let pre_computed: Awaited<ReturnType<typeof displayCompletePayroll>> = [];

    if (userAcc === "PAYROLL_CHECKER") {
      pre_computed =
        (await displayCompletePayroll(["PENDING"])) ?? [];
    }

    if (userAcc === "FINANCIAL_CHECKER") {
      pre_computed =
        (await displayCompletePayroll(["FOR_CHECKER"])) ?? [];
    }

    if (userAcc === "FINANCE_APPROVER") {
      pre_computed =
        (await displayCompletePayroll(["FOR_APPROVER"])) ?? [];
    }

    const computed = pre_computed.filter((employee) => {
      const isRegularCompany =
        employee.company_id === company_id &&
        employee.EmpCode?.isAlien === false;

      const isAlienSecondaryCompany =
        employee.EmpCode?.isAlien === true &&
        employee.EmpCode?.secondaryBranch?.company_id ===
        company_id;

      return (
        isRegularCompany ||
        isAlienSecondaryCompany
      );
    });

    const variance = await fetchVariance(
      company_id,
      cycle,
      userAcc
    );

    const employeeVariance = await FetchEmployeeVariance(
      company_id,
      cycle,
      userAcc
    );

    const finalVariance = await CompleteVariance(
      company_id,
      cycle,
      userAcc
    );


    const result = await prisma.$transaction(
      async (tx) => {
        const mainArchive =
          await tx.varianceMainArchive.upsert({
            where: {
              paycode_cycle: {
                paycode,
                cycle,
              },
            },
            update: {},
            create: {
              paycode,
              cycle,
            },
          });

        const varianceArchive =
          await tx.varianceArchive.create({
            data: {
              company_id,
              main_archive_id: mainArchive.id,
              company_variance: variance,
              employee_variance: employeeVariance,
              final_variance: finalVariance,
            },
          });

        return {
          mainArchive,
          varianceArchive,
        };
      }
    );

    return result;
  } catch (error) {
    console.error("Error occured in service:", error);
    throw error;
  }
}










// VARIANCE ARCHIVE
export async function displayVarianceArchive({ page, limit, search }: VarianceArchiveProps) {

  try {

    const searchFilter = search
      ? {
        OR: [
          { paycode: { contains: search } },
          { cycle: { contains: search } },
        ],
      }
      : {};

    const finalWhere: Prisma.varianceMainArchiveWhereInput = {
      AND: [
        searchFilter,
      ],
    };



    const varianceMain = await prisma.varianceMainArchive.findMany({
      where: finalWhere,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        paycode: true,
        cycle: true,
      }
    })

    const normalized = varianceMain.map((emp) => {
      const paycode = emp.paycode ?? '';
      const cycle = emp.cycle ?? '';


      return {
        paycode: paycode,
        cycle: cycle,
      };
    });

    const total = await prisma.varianceMainArchive.count({ where: finalWhere });

    return {
      data: normalized,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  catch (error) {
    console.error("error occured", error);
  }

}