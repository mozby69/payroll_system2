export function parsePayCode(payCode?: string) {
    if (!payCode) return null
  
    const [monthName, startDay, endDay, year] = payCode.split("-")
  
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth() + 1
  
    const month = String(monthIndex).padStart(2, "0")
    const start = String(startDay).padStart(2, "0")
    const end = String(endDay).padStart(2, "0")
  
    return {
      from: `${month}/${start}/${year}`,
      to: `${month}/${end}/${year}`,
    }
  }