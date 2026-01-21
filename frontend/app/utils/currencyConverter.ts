export const formatCurrency = (value: number) =>
    value.toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    })