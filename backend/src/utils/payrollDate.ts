export type PayCodeRange = {
    startDate: string;
    endDate: string;
    start: Date;
    end: Date;
  };
  
  export function parsePayCodeRange(payCode: string): PayCodeRange {
    if (!payCode) throw new Error("PayCode is required");
  
    const parts = payCode.split("-");
    if (parts.length !== 4) {
      throw new Error(`Invalid PayCode format: ${payCode}`);
    }
  
    const [month, startDay, endDay, year] = parts;
  
    const monthIndex = new Date(`${month} 1, 2000`).getMonth();
  
    const start = new Date(Number(year), monthIndex, Number(startDay));
    const end = new Date(Number(year), monthIndex, Number(endDay));
  
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error(`Invalid date generated from PayCode: ${payCode}`);
    }
  
    return {
      startDate: `${month}-${startDay}-${year}`,
      endDate: `${month}-${endDay}-${year}`,
      start,
      end,
    };
  }