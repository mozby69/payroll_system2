export function getLastDayOfMonthFromPeriod(releasePeriod) {
    const [year, month] = releasePeriod.split("-").map(Number);
    return new Date(year, month, 0);
}
