

export function formatMonthYear(value?: string) {
    if (!value) return "";
    const [year, month] = value.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

}