


export function generatePayCode(selectedMonth: string,selectedRange: string): string {

  const [year, month] = selectedMonth.split("-");

  const monthName = new Date(
    Number(year),
    Number(month) - 1
  ).toLocaleString("en-US", {
    month: "long",
  });

  return `${monthName}-${selectedRange}-${year}`;
}
