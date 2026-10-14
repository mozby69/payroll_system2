

export function formatMonthYear(value?: string) {
    if (!value) return "";
    const [year, month] = value.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

}


// utils/dateFormatter.ts

export function formatDate(
  date: string | Date | null | undefined
): string {
  if (!date) return "";

  const d = new Date(date);

  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}