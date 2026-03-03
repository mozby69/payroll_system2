export function getPreviousMonth(year, month) {
    const prev = new Date(year, month - 2, 1); // JS month is 0-based
    return {
        year: prev.getFullYear(),
        month: prev.getMonth() + 1,
    };
}
export function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}
export function formatAllowanceMonth(selectedMonth) {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    const monthName = date.toLocaleString("en-US", {
        month: "long",
    });
    return `${monthName} ${year}`;
}
