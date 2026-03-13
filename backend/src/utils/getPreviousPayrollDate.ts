export function getPreviousPayrollDate(paycycle: string, cycleCategory: string) {
     if (!paycycle || !cycleCategory) return ""
    const [monthName,, ,yearStr] = paycycle.split("-")
    const year = Number(yearStr)
  
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth()
  
    const startDay = Number(cycleCategory.split("-")[0])
  
    const prevDate = new Date(year, monthIndex, startDay)
  
    return prevDate.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric"
    })
  }