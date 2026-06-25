

export function generateMonthlyTaxMap(totalTax: number) {
  const monthly = Number((totalTax / 12).toFixed(2));

  const totalFirst11 = Number((monthly * 11).toFixed(2));
  const december = Number((totalTax - totalFirst11).toFixed(2));

  return {
    January: monthly,
    February: monthly,
    March: monthly,
    April: monthly,
    May: monthly,
    June: monthly,
    July: monthly,
    August: monthly,
    September: monthly,
    October: monthly,
    November: monthly,
    December: december,
  };
}




export const MONTH_NAMES: Record<number, string> = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};






const MONTH_NAME_TO_NUMBER: Record<string, number> = {
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

type ArchivePayrollItem = {
  PayCode: string;
  Basic_salary: unknown;
  Grosspay: unknown;
  philhealth_employee_share: unknown;
  SSS_employee_share: unknown;
  Pagibig_employee_share: unknown;
  w_tax: unknown;
};

function getPayCodeMonthNumber(payCode: string): number | null {
  const monthName = payCode.split("-")[0];

  return MONTH_NAME_TO_NUMBER[monthName] ?? null;
}

function getPayCodeYear(payCode: string): number | null {
  const parts = payCode.split("-");
  const year = Number(parts[parts.length - 1]);

  return Number.isNaN(year) ? null : year;
}

function isFirstHalfPayCode(payCode: string): boolean {
  return payCode.includes("-1-15-");
}

export function filterArchiveByTaxPeriod(
  archiveList: ArchivePayrollItem[],
  monthNumber: number,
  year: number
): ArchivePayrollItem[] {
  return archiveList.filter((archive) => {
    const payCodeMonth = getPayCodeMonthNumber(archive.PayCode);
    const payCodeYear = getPayCodeYear(archive.PayCode);

    if (!payCodeMonth || payCodeYear !== year) {
      return false;
    }

    if (payCodeMonth < monthNumber) {
      return true;
    }

    if (payCodeMonth === monthNumber) {
      return isFirstHalfPayCode(archive.PayCode);
    }

    return false;
  });
}