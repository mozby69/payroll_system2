export const formatCurrency = (
  value: number | string | null | undefined
): string => {
  if (value == null) return "₱0.00";

  const numericValue =
    typeof value === "string" ? Number(value) : value;

  if (isNaN(numericValue)) return "₱0.00";

  return numericValue.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
};