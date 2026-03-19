// utils/date.ts
// export function nowPH(): Date {
//     const now = new Date();
  
//     // Convert to PH time by adding 8 hours
//     const phOffsetMs = 8 * 60 * 60 * 1000;
  
//     return new Date(now.getTime() + phOffsetMs);
//   }
  

export function nowPH(): Date {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);

  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);

  return new Date(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );
}


export function getRoundedPHTime(): Date {
  const phTime = nowPH();

  const minutes = phTime.getMinutes();
  const roundedMinutes = minutes < 30 ? 0 : 30;

  phTime.setMinutes(roundedMinutes);
  phTime.setSeconds(0);
  phTime.setMilliseconds(0);

  return phTime;
}