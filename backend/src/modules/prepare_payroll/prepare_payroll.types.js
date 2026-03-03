export const PAYROLL_CYCLE_MAP = {
    "10-pay-cycle": "25-pay-cycle",
    "25-pay-cycle": "10-pay-cycle",
    "15-pay-cycle": "30-pay-cycle",
    "30-pay-cycle": "15-pay-cycle",
};
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
// Dont Delete or Remove ths Backup code ↓
// export function convertPayrollLabelToPeriod(
//   payrollLabel: string
// ): string {
//   const [monthName, startDay, endDay, yearStr] =
//     payrollLabel.split("-");
//   const monthIndex = MONTH_INDEX[monthName];
//   if (monthIndex === undefined) {
//     throw new Error(`Invalid month name: ${monthName}`);
//   }
//   const year = Number(yearStr);
//   const end = Number(endDay);
//   if (Number.isNaN(year) || Number.isNaN(end)) {
//     throw new Error(`Invalid payroll label: ${payrollLabel}`);
//   }
//   let date = new Date(year, monthIndex, 1);
//   if (end >= 28) {
//     date.setMonth(date.getMonth() + 1);
//   }
//   const resultYear = date.getFullYear();
//   const resultMonth = String(date.getMonth() + 1).padStart(2, "0");
//   return `${resultYear}-${resultMonth}`;
// }
// Dont Delete or Remove ths Backup code ↑
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
export function getCurrentPayrollLabel() {
    const now = new Date();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];
    const monthName = monthNames[now.getMonth()];
    const year = now.getFullYear();
    return `${monthName}-1-15-${year}`;
}
