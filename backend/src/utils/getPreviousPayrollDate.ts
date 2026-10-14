export function getPreviousPayrollDate(
  paycycle: string,
  cycleCategory: string,
): string {
  if (!paycycle || !cycleCategory) return "";

  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
  ];

  const [monthName, cycleStartText, , yearText] = paycycle.split("-");
  const [firstPaydayText, secondPaydayText] = cycleCategory.split("-");

  const monthIndex = months.indexOf(monthName ?? "");
  const year = Number(yearText);
  const cycleStart = Number(cycleStartText);

  const payday = Number(
    cycleStart <= 15 ? firstPaydayText : secondPaydayText,
  );

  if (
    monthIndex < 0 ||
    !Number.isInteger(year) ||
    !Number.isInteger(cycleStart) ||
    cycleStart < 1 ||
    cycleStart > 31 ||
    !Number.isInteger(payday) ||
    payday < 1 ||
    payday > 31
  ) {
    return "";
  }

  const lastDay = new Date(
    Date.UTC(year, monthIndex + 1, 0),
  ).getUTCDate();

  // Clamp paydays such as 30 to February's last day.
  const day = Math.min(payday, lastDay);

  return `${String(monthIndex + 1).padStart(2, "0")}/${String(day).padStart(2, "0")}/${year}`;
}