// Loan Type Code ↓
const MONTH_INDEX = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
};
export function convertPayrollLabelToPeriod(payrollLabel) {
    const [monthName, , , yearStr] = payrollLabel.split("-");
    const monthIndex = MONTH_INDEX[monthName];
    if (monthIndex === undefined) {
        throw new Error(`Invalid month name: ${monthName}`);
    }
    const year = Number(yearStr);
    if (Number.isNaN(year)) {
        throw new Error(`Invalid year in payroll label: ${payrollLabel}`);
    }
    const resultMonth = String(monthIndex + 1).padStart(2, "0");
    return `${year}-${resultMonth}`;
}
