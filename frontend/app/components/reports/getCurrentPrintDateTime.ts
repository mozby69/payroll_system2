export function getCurrentPrintDateTime() {
    const now = new Date()
  
    const month = now.getMonth() + 1
    const day = now.getDate()
    const year = now.getFullYear()
  
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
  
    return {
      date: `${month}/${day}/${year}`,
      time: `${hours}:${minutes}`,
    }
  }