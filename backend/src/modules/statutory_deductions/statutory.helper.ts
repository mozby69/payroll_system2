

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