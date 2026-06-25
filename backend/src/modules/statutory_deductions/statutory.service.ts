import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prismaClient";
import { SaveWtaxMonthlyParams, StatutoryProps, WtaxListProps, WTaxTaxPeriodProps } from "./statutory.types";
import { fi } from "zod/v4/locales";
import { computePagibig, computePhilRateEmployee, computeSemiMonthlySalary, computeSSSContribution } from "../prepare_payroll/prepare_payroll.computation";
import { getBodPhilhealth, getSSSContributions, getTaxTable } from "../general/general.services";
import { MathRound } from "../../utils/toFixed";
import { match } from "assert";
import { filterArchiveByTaxPeriod, generateMonthlyTaxMap, MONTH_NAMES } from "./statutory.helper";









//SSS
export async function displaySSSContributions({ page, limit, search }: StatutoryProps) {

  try {

    const numericSearch = Number(search);

    const employeeWhere: Prisma.SSS_ContributionsWhereInput = {
      ...(search &&
        !isNaN(numericSearch) && {
        OR: [
          { start_range: numericSearch },
          { end_range: numericSearch },
        ],
      }),
    };

    const employeeList = await prisma.sSS_Contributions.findMany({
      where: employeeWhere,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        sss_contrib_id: true,
        start_range: true,
        end_range: true,
        employee_share: true,
        employer_share: true,
      }
    })

    const normalized = employeeList.map((emp) => {

      return {
        sss_contrib_id: emp.sss_contrib_id,
        start_range: emp.start_range,
        end_range: emp.end_range,
        employee_share: emp.employee_share,
        employer_share: emp.employer_share,
      };
    });

    const total = await prisma.sSS_Contributions.count({ where: employeeWhere });

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




export async function updateSSSContribution(id: number,
  data: {
    start_range: number;
    end_range: number;
    employee_share: number;
    employer_share: number;
  }) {
  return prisma.sSS_Contributions.update({
    where: { sss_contrib_id: id },
    data: {
      start_range: data.start_range,
      end_range: data.end_range,
      employee_share: data.employee_share,
      employer_share: data.employer_share,
    }
  })
}











// PAGIBIG 
export async function displayPagibigContributions({ page, limit, search }: StatutoryProps) {

  try {

    const searchFilter = search
      ? {
        OR: [
          { EmpCodeId: { contains: search } },
          { EmpCode: { Firstname: { contains: search } } },
          { EmpCode: { Lastname: { contains: search } } },
        ],
      }
      : {};

    const statusOverride = {
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
    };

    const finalWhere: Prisma.PagIbig_ListWhereInput = {
      AND: [
        searchFilter,
        statusOverride,
      ],
    };



    const employeeList = await prisma.pagIbig_List.findMany({
      where: finalWhere,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        pagibig_id: true,
        pagibig_employee_share: true,
        pagibig_employer_share: true,
        EmpCodeId: true,
        EmpCode: {
          select: {
            Firstname: true,
            Lastname: true,

          }
        }
      }
    })

    const normalized = employeeList.map((emp) => {
      const firstname = emp.EmpCode.Firstname ?? '';
      const lastname = emp.EmpCode.Lastname ?? '';
      const name = firstname + ' ' + lastname;

      return {
        pagibig_id: emp.pagibig_id,
        pagibig_employee_share: emp.pagibig_employee_share,
        pagibig_employer_share: emp.pagibig_employer_share,
        EmpCodeId: emp.EmpCodeId,
        Name: name,
      };
    });

    const total = await prisma.pagIbig_List.count({ where: finalWhere });

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


export async function updatePagibigContribution(id: number,
  data: {
    pagibig_employee_share: number;
    pagibig_employer_share: number;

  }) {
  return prisma.pagIbig_List.update({
    where: { pagibig_id: id },
    data: {
      pagibig_employee_share: data.pagibig_employee_share,
      pagibig_employer_share: data.pagibig_employer_share,
    }
  })
}






// philhealth 

export async function displayPhilhealthContribution() {
  try {
    const data = await prisma.payroll_Parameters.findFirst();
    return data;
  }
  catch (error) {
    console.error("error occured", error);
  }
}

export async function updatePhilhealth(id: number, SettingPercentage: string) {
  return prisma.payroll_Parameters.update({
    where: { id },
    data: { SettingPercentage: new Prisma.Decimal(SettingPercentage) },
  });
}



export async function displayWTax() {
  try {
    const data = await prisma.tax_table.findMany();
    return data;
  }
  catch (error) {
    console.error("error occured", error);
  }
}




export async function updateWTax(id: number,
  data: {
    start_range: number;
    end_range: number;
    annual_base_tax_bracket: number;
    rate_per_bracket: number;
    annual_base_tax_per_year: number;

  }) {
  return prisma.tax_table.update({
    where: { id: id },
    data: {
      start_range: data.start_range,
      end_range: data.end_range,
      annual_base_tax_bracket: data.annual_base_tax_bracket,
      rate_per_bracket: data.rate_per_bracket,
      annual_base_tax_per_year: data.annual_base_tax_per_year,
    }
  })
}






//wtax conmputation


export async function wtaxComputationList({ page, limit, search }: WtaxListProps) {
  try {
    const phil = await prisma.payroll_Parameters.findFirst({ select: { SettingPercentage: true } });
    const bodPhil = await getBodPhilhealth();
    const sssTable = await getSSSContributions();
    const tax_list = await getTaxTable();

    const searchFilter = search
      ? {
        OR: [
          { EmpCode: { contains: search } },
          { Firstname: { contains: search } },
          { Lastname: { contains: search } },
        ],
      }
      : {};

    const statusOverride = {
      OR: [
        {
          EmployeeStatus: {
            notIn: ["Resigned", "Inactive", "Terminate"],
          },
        },
        {
          bod_member: {
            in: ["bod1", "bod2"],
          },
        },
      ],
    };

    const finalWhere: Prisma.EmployeeWhereInput = {
      AND: [
        {
          Taxable: true,
        },
        searchFilter,
        statusOverride,
      ],
    };



    const employeeList = await prisma.employee.findMany({
      where: finalWhere,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        Firstname: true,
        Lastname: true,
        EmpCode: true,
        bod_member: true,
        employeepayroll: {
          select: {
            basic_salary: true,
          }
        },
        pagibig_list: {
          select: {
            pagibig_employee_share: true,
          }
        }
      }
    })

    const normalized = employeeList.map((emp) => {
      const firstname = emp.Firstname ?? '';
      const lastname = emp.Lastname ?? '';
      const name = `${lastname}, ${firstname}`;
      const basicSalary = Number(emp.employeepayroll?.basic_salary ?? 0);
      const semiMonthly = computeSemiMonthlySalary(basicSalary);
      const phil_percentage = phil?.SettingPercentage?.toNumber() ?? 0;
      const rawPagibigEmployee = emp.pagibig_list[0]?.pagibig_employee_share?.toNumber() ?? 0;

      const bodMap = new Map(
        bodPhil.map((b) => [
          b.EmpCodeId.trim().toUpperCase(),
          b.employee_share?.toNumber() ?? 0,
        ])
      );

      const normalizedId = emp.EmpCode.trim().toUpperCase();
      const bodShare = bodMap.get(normalizedId) ?? 0;

      const isBod = emp.bod_member?.trim().toLowerCase() === "bod1";
      const philhealth = computePhilRateEmployee(semiMonthly, phil_percentage, isBod, bodShare);
      const sssContribEmployee = Number(computeSSSContribution(basicSalary, sssTable));
      const pagibigEmployeeShare = computePagibig(rawPagibigEmployee);

      return {
        EmpCode: emp.EmpCode,
        Name: name,
        basic_salary: emp.employeepayroll?.basic_salary,
        philhealth_emp: philhealth,
        sss_emp: sssContribEmployee,
        pagibig_emp: pagibigEmployeeShare,
        tax: tax_list,
      };
    });

    const total = await prisma.employee.count({ where: finalWhere });

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





export async function SaveWtaxMonthly({ month, year, taxAmount, empCodeId }: SaveWtaxMonthlyParams) {

  try {
    const taxPeriod = await prisma.taxPeriod.upsert({
      where: {
        month_year: {
          month,
          year,
        },
      },
      update: {},
      create: {
        month,
        year,
      },
    });

    const payment =
      await prisma.monthlyTaxPayment.create({
        data: {
          taxAmount,
          taxPeriodId: taxPeriod.id,
          EmpCodeId: empCodeId,
          isPaid: true,
        },
      });

    return payment;
  } catch (error) {
    console.error(
      `Error occurred: ${error}`
    );

    throw error;
  }
}



interface DisplayWtaxParams {
  empCodeId: string;
}

export async function DisplayWtax({ empCodeId }: DisplayWtaxParams) {
  try {
    const data =
      await prisma.monthlyTaxPayment.findMany({
        where: {
          EmpCodeId: empCodeId,
        },
        include: {
          taxPeriod: true,
        },
        orderBy: {
          taxPeriod: {
            month: "asc",
          },
        },
      });

    return data;
  } catch (error) {
    console.error(
      `error occurred in service ${error}`
    );

    throw error;
  }
}

interface DisplayWtaxPaidParams {
  empCodeId: string;
  month: number;
  year: number;
}

export async function DisplayWtaxPaid({ empCodeId, month, year }: DisplayWtaxPaidParams) {
  try {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const allowedMonths = monthNames.slice(0, month);

    const data = await prisma.taxArchive.findMany({
      where: {
        EmpCodeId: empCodeId,
        PayCode: {
          contains: String(year),
        },
      },
      select: {
        PayCode: true,
        Grosspay: true,
        EmpCodeId: true,
      },
    });

    const filteredData = data.filter((item) =>
      allowedMonths.some((monthName) =>
        item.PayCode.includes(monthName)
      )
    );

    const totalGrossPay = filteredData.reduce(
      (sum, item) => sum + Number(item.Grosspay),
      0
    );

    return {
      records: filteredData,
      totalGrossPay,
    };
  } catch (error) {
    console.error(`error occurred ${error}`);
  }
}




interface WtaxProps {
  empcode: string;
  month: number;
  year: number;
}


export async function WtaxFetchData({ empcode, month, year }: WtaxProps) {
  try {


    const sssTable = await getSSSContributions();
    const phil = await prisma.payroll_Parameters.findFirst({ select: { SettingPercentage: true } });
    const bodPhil = await getBodPhilhealth();
    const tax_list = await getTaxTable();

    const data = await prisma.employee.findFirst({
      where: {
        EmpCode: empcode,
      },
      select: {
        EmpCode: true,
        bod_member: true,
        BranchCode: {
          select: {
            CompanyCode: {
              select: {
                CompanyCycle: true,
              }
            }
          }
        },
        employeepayroll: {
          select: {
            basic_salary: true,
          },
        },
        pagibig_list: {
          select: {
            pagibig_employee_share: true,
          },
        },


      },
    });

    if (!data) {
      return null;
    }

    const bodMap = new Map(
      bodPhil.map((b) => [
        b.EmpCodeId.trim().toUpperCase(),
        b.employee_share?.toNumber() ?? 0,
      ])
    );


    //for a2
    const cycleCategory = data?.BranchCode?.CompanyCode?.CompanyCycle;
    const firstHalfPayrollPeriod = cycleCategory === "15-30-Cycle" ? "15-pay-cycle" : "10-pay-cycle";
    const secondHalfPayrollPeriod = cycleCategory === "15-30-Cycle" ? "30-pay-cycle" : "25-pay-cycle";

    const archives = await prisma.taxArchive.findMany({
      where: {
        EmpCodeId: empcode,
        PayCode: {
          endsWith: String(year),
        },
        payroll_period: {
          in: [firstHalfPayrollPeriod, secondHalfPayrollPeriod],
        },
      },
      select: {
        Grosspay: true,
        PayCode: true,
        payroll_period: true,
      },
    });

    const MONTH_ORDER: Record<string, number> = {
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12,
    };

    const result_a2 = archives.reduce((total, item) => {
      const monthName = item.PayCode.split("-")[0];

      const payMonth = MONTH_ORDER[monthName as keyof typeof MONTH_ORDER] ?? 0;

      const isPreviousMonth = payMonth < month;
      const isCurrentMonthFirstHalf =
        payMonth === month && item.payroll_period === firstHalfPayrollPeriod;

      if (isPreviousMonth || isCurrentMonthFirstHalf) {
        return total + Number(item.Grosspay ?? 0);
      }

      return total;
    }, 0);
    //end of a2

    //for k3 
    const taxPaid = await prisma.monthlyTaxPayment.aggregate({
      where: {
        EmpCodeId: empcode,
        taxPeriod: {
          year,
        }
      },
      _sum: {
        taxAmount: true,
      }
    });


    //end k3 


    const rawPagibigShare = data?.pagibig_list?.[0]?.pagibig_employee_share?.toNumber() ?? 0;

    const bodShare = bodMap.get(empcode.trim().toUpperCase()) ?? 0;
    const isBod = data.bod_member === "bod1";
    const basic = Number(data.employeepayroll?.basic_salary ?? 0);
    const phil_percentage = phil?.SettingPercentage?.toNumber() ?? 0;
    const semibasic = basic / 2;
    const remaining_months = 12 - month;
    //const a2 = basic * (month - 0.5);
    const a2 = result_a2;
    const b2 = basic * (remaining_months + 0.5);
    const sssContrib = computeSSSContribution(basic, sssTable);
    const sssContribMonthly = Number(sssContrib) * month;
    const philhealthRate = computePhilRateEmployee(semibasic, phil_percentage, isBod, bodShare);
    const philhealthRateMonthly = philhealthRate * month;
    const pagibigShare = computePagibig(rawPagibigShare);
    const pagibigShareContrib = month === 1 || month === 2 ? pagibigShare : pagibigShare * (month - 1);
    const b3 = philhealthRate * remaining_months;
    const b4 = Number(sssContrib) * remaining_months;
    const b5 = month === 1 || month === 2 ? Number(pagibigShare) * 11 : Number(pagibigShare) * (remaining_months + 1);
    const c3 = philhealthRateMonthly + b3;
    const c4 = Number(sssContribMonthly) + b4;
    const c5 = Number(pagibigShareContrib) + b5;
    const c2 = result_a2 + b2;
    const d2 = c3 + c4 + c5;
    const e2 = c2 - d2;


    const matchedTax = tax_list.find((item) => {
      return (
        e2 >= Number(item.start_range) &&
        e2 <= Number(item.end_range)
      );
    });

    const f2 = matchedTax?.annual_base_tax_bracket ?? 0;
    const h2 = matchedTax?.rate_per_bracket ?? 0;
    const g2 = Number(e2) - Number(f2);
    const i3 = matchedTax?.annual_base_tax_per_year ?? 0;
    const h3 = g2 * Number(h2);
    const j3 = h3 + Number(i3);
    const k3 = taxPaid._sum.taxAmount?.toNumber() ?? 0;
    const l3 = (-k3) + j3;
    const j4 = remaining_months + 1;
    const j5_tax_amount = l3 / j4;
    const month_list = generateMonthlyTaxMap(MathRound(j3));


    const normalized = {
      basic_salary: basic,
      b2,
      a2,
      sss_employe_contrib: Number(sssContribMonthly),
      philhealth_contrib: philhealthRateMonthly,
      pagibig_contrib: MathRound(pagibigShareContrib),
      b3,
      b4,
      b5,
      c3: MathRound(c3),
      c4,
      c5,
      c2,
      d2,
      e2,
      f2: Number(f2),
      h2: Number(h2),
      g2: MathRound(g2),
      h3: MathRound(h3),
      i3: Number(i3),
      j3: MathRound(j3),
      l3: MathRound(l3),
      j4,
      j5: MathRound(j5_tax_amount),
      k3,
      month_list: month_list,
    };

    return normalized;

  }

  catch (error) {
    console.error(`error occured ${error}`);
  }
}



export async function WtaxTaxPeriodArchive({
  page,
  limit,
  search,
}: WTaxTaxPeriodProps) {
  try {
    const searchNumber = Number(search);

    const matchedMonthNumbers = search
      ? Object.entries(MONTH_NAMES)
          .filter(([, monthName]) =>
            monthName.toLowerCase().includes(search.toLowerCase())
          )
          .map(([monthNumber]) => Number(monthNumber))
      : [];

    const finalWhere: Prisma.TaxPeriodWhereInput = search
      ? {
          OR: [
            ...(!Number.isNaN(searchNumber)
              ? [{ month: searchNumber }, { year: searchNumber }]
              : []),

            ...(matchedMonthNumbers.length > 0
              ? [
                  {
                    month: {
                      in: matchedMonthNumbers,
                    },
                  },
                ]
              : []),
          ],
        }
      : {};

    const taxPeriodList = await prisma.taxPeriod.findMany({
      where: finalWhere,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        month: true,
        year: true,
        payments: {
          select: {
            id: true,
            taxAmount: true,
            isPaid: true,
            created_at: true,
            EmpCodeId: true,
            col1: true,
            col2: true,
            col3: true,
            col4: true,
            month_list: true,
            EmpCode: {
              select: {
                EmpCode: true,
                Firstname: true,
                Lastname: true,
                CivilStatus: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    const empCodeIds = [
      ...new Set(
        taxPeriodList.flatMap((period) =>
          period.payments.map((payment) => payment.EmpCodeId)
        )
      ),
    ];

    const years = [...new Set(taxPeriodList.map((period) => period.year))];

    const archivePayrollList =
      await prisma.employeePayrollArchive.findMany({
        where: {
          EmpCodeId: {
            in: empCodeIds,
          },
          OR: years.map((year) => ({
            PayCode: {
              endsWith: `-${year}`,
            },
          })),
        },
        select: {
          EmpCodeId: true,
          PayCode: true,
          Basic_salary: true,
          Grosspay: true,
          philhealth_employee_share: true,
          SSS_employee_share: true,
          Pagibig_employee_share: true,
          w_tax: true,
        },
      });

    const normalized = taxPeriodList.map((period) => {
      return {
        id: period.id,
        month: MONTH_NAMES[period.month] ?? "Unknown",
        monthNumber: period.month,
        year: period.year,

        payments: period.payments.map((payment) => {
          const employeeArchivePayroll = archivePayrollList.filter(
            (archive) => archive.EmpCodeId === payment.EmpCodeId
          );

          const filteredArchivePayroll = filterArchiveByTaxPeriod(
            employeeArchivePayroll,
            period.month,
            period.year
          );

          return {
            EmpCodeId: payment.EmpCodeId,
            taxAmount: Number(payment.taxAmount),
            col1: payment.col1,
            col2: payment.col2,
            col3: payment.col3,
            col4: payment.col4,
            month_list: payment.month_list,
            name: `${payment.EmpCode.Lastname}, ${payment.EmpCode.Firstname}`,
            civil_status: payment.EmpCode.CivilStatus,
            archive_employee_payroll: filteredArchivePayroll,
          };
        }),
      };
    });

    const total = await prisma.taxPeriod.count({
      where: finalWhere,
    });

    return {
      data: normalized,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error(`error occured ${error}`);
    throw error;
  }
}