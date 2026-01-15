export function generatePayCode(
    cyclePay: string,
    referenceDate: string
  ): string {
    const date = new Date(referenceDate);
  
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
  
    const lastDayOfMonth = new Date(
      year,
      date.getMonth() + 1,
      0
    ).getDate();
  
    if (cyclePay === "10-pay-cycle") {
      return `${month}-1-15-${year}`;
    }

    if (cyclePay === "15-pay-cycle") {
        return `${month}-1-15-${year}`;
      }
  
    if (cyclePay === "25-pay-cycle") {
      return `${month}-16-${lastDayOfMonth}-${year}`;
    }
    if (cyclePay === "30-pay-cycle") {
        return `${month}-16-${lastDayOfMonth}-${year}`;
      }
  
    throw new Error(`Unknown CyclePay: ${cyclePay}`);
  }
  