// utils/date.ts
export function nowPH(): Date {
    const now = new Date();
  
    // Convert to PH time by adding 8 hours
    const phOffsetMs = 8 * 60 * 60 * 1000;
  
    return new Date(now.getTime() + phOffsetMs);
  }
  