export type PayCodeRange = {
    startDate: string;
    endDate: string;
    start: Date;
    end: Date;
  };
  
  export function parsePayCodeRange(payCode: string): PayCodeRange {
    if (!payCode) {
      throw new Error("PayCode is required");
    }
  
    const parts = payCode.split("-");
  
    if (parts.length !== 4) {
      throw new Error(`Invalid PayCode format: ${payCode}`);
    }
  
    const [month, startDay, endDay, year] = parts;
  
    const startDate = `${month}-${startDay}-${year}`;
    const endDate = `${month}-${endDay}-${year}`;
  
    const start = new Date(`${month} ${startDay}, ${year}`);
    const end = new Date(`${month} ${endDay}, ${year}`);
  
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error(`Invalid date generated from PayCode: ${payCode}`);
    }
  
    return {
      startDate,
      endDate,
      start,
      end,
    };
  }