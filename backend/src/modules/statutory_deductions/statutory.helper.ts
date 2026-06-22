

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