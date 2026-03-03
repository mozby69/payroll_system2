// export function parsePayCycleToDate(payCycle: string): Date {
//     const parts = payCycle.toLowerCase().split("-");
//     const month = parts[0];
//     const endDay = Number(parts[2]);
//     const year = Number(parts[3]);
//     const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
//     return new Date(year, monthIndex, endDay);
//   }
export function parsePayCycleToDate(payCycle) {
    const parts = payCycle.toLowerCase().split("-");
    const month = parts[0];
    const endDay = Number(parts[2]);
    const year = Number(parts[3]);
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    return new Date(year, monthIndex, endDay);
}
