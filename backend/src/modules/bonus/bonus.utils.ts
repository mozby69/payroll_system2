import { BonusType, FormulaType } from "@prisma/client"
import { formatDateOnly } from "../../utils/formatDateOnly"
import e from "cors"

export function getTenureInMonths(hireDate: Date, asOf: Date): number {
    return (
      (asOf.getFullYear() - hireDate.getFullYear()) * 12 +
      (asOf.getMonth() - hireDate.getMonth())
    )
  }

  export function getTenureInYears(hireDate: Date, asOf: Date): number {
    const months =
      (asOf.getFullYear() - hireDate.getFullYear()) * 12 +
      (asOf.getMonth() - hireDate.getMonth())
  
    const years = Math.floor(months / 12)
  
    return years >= 1 ? years : 0
  }
  
  export function getLastDayOfMonth(period: string): Date {
    const [year, month] = period.split("-").map(Number)
    return new Date(year, month, 0)
  }


export function calculateBonusAmount(
  formula: FormulaType,
  basicPay: number
): number {
  switch (formula) {
    case "BASIC_DIV_2":
      return basicPay / 2
    case "BASIC_DIV_1":
      return basicPay / 1
    default:
      return 0
  }
}

export function getBonusStartAndEndDate(
  eligibleMonth: number,
  bonusType: BonusType,
  asOfDate: Date
) {
  const year = asOfDate.getFullYear()

  let monthsBack = 0

  switch (bonusType) {
    case "QUARTERLY":
      monthsBack = 2
      break
    case "MIDYEAR":
      monthsBack = 5
      break
    case "ANNUAL":
      monthsBack = 11
      break
  }

  const bonusEnd = new Date(year, eligibleMonth, 0)
  const bonusStart = new Date(bonusEnd)
  bonusStart.setMonth(bonusStart.getMonth() - monthsBack)
  bonusStart.setDate(1)

  return {
    bonusStart: formatDateOnly(bonusStart),
    bonusEnd: formatDateOnly(bonusEnd)
  }
}


export function calculateBonusAmountWithLeave(
  bonusType: string,
  eligibleMonth: number,
  basic_salary: number,
) {
  let count = 0
  let salary = 0

  if (bonusType === "QUARTERLY") {
    salary = basic_salary / 2
    count = 3
  } else if (bonusType === "MIDYEAR") {
    salary = basic_salary / 2
    count = 6
  }else if (bonusType === "ANNUAL") {
    salary = basic_salary / 1
    count = 12
  }
    

  const amount = (salary / count) * eligibleMonth

  return {
    amount,
    count,
  }
}



export function countEligibleMonthsWithHalfRule(
  bonusStart: Date,
  bonusEnd: Date,
  leaveStart: Date | null,
  leaveEnd: Date | null
): number {
  const totalMonths =
    (bonusEnd.getFullYear() - bonusStart.getFullYear()) * 12 +
    (bonusEnd.getMonth() - bonusStart.getMonth()) +
    1;

  if (!leaveStart || !leaveEnd) {
    return totalMonths;
  }

  const normalize = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const bonusFrom = normalize(bonusStart);
  const bonusTo = normalize(bonusEnd);
  const leaveFrom = normalize(leaveStart);
  const leaveTo = normalize(leaveEnd);

  if (leaveTo < bonusFrom || leaveFrom > bonusTo) {
    return totalMonths;
  }

  const start = leaveFrom < bonusFrom ? bonusFrom : leaveFrom;
  const end = leaveTo > bonusTo ? bonusTo : leaveTo;

  // Leave started before the bonus period:
  // Deduct all calendar months affected by leave.
  if (leaveFrom < bonusFrom) {
    const affectedMonths =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth()) +
      1;

    return Math.max(0, totalMonths - affectedMonths);
  }

  const addMonths = (date: Date, months: number): Date => {
    const year = date.getFullYear();
    const month = date.getMonth() + months;

    const lastDay = new Date(year, month + 1, 0).getDate();

    return new Date(
      year,
      month,
      Math.min(date.getDate(), lastDay)
    );
  };

  let completedMonths = 0;

  while (addMonths(start, completedMonths + 1) <= end) {
    completedMonths++;
  }

  let leaveDeduction = Math.max(1, completedMonths);

  if (
    completedMonths >= 1 &&
    end > addMonths(start, completedMonths)
  ) {
    leaveDeduction += 0.5;
  }

  return Math.max(0, totalMonths - leaveDeduction);
}

export function generateBatchId(releasePeriod: string) {
  const timestamp = Date.now()
  return `BONUS-${releasePeriod}-${timestamp}`
}


export function getPayCycleStart(payCycle: string): number {
  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
  ];

  const [monthName, startText, endText, yearText] =
    payCycle.trim().split("-");

  if (!monthName || !startText || !endText || !yearText) {
    throw new Error(`Invalid PayCycle: ${payCycle}`);
  }

  const monthIndex = months.indexOf(monthName);
  const startDay = Number(startText);
  const endDay = Number(endText);
  const year = Number(yearText);

  const lastDay = new Date(
    Date.UTC(year, monthIndex + 1, 0),
  ).getUTCDate();

  if (
    monthIndex < 0 ||
    !Number.isInteger(year) ||
    !Number.isInteger(startDay) ||
    !Number.isInteger(endDay) ||
    startDay < 1 ||
    endDay < startDay ||
    endDay > lastDay
  ) {
    throw new Error(`Invalid PayCycle: ${payCycle}`);
  }

  return Date.UTC(year, monthIndex, startDay);
}
