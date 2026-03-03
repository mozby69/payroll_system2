export function getLastDayOfMonthFromPeriod(
    releasePeriod: string
  ): Date {
    
    const [year, month] = releasePeriod.split("-").map(Number)
  
    return new Date(year, month, 0)
  }
  