import { PayrollDateRange } from "../types/generalTypes";

export function normalizeDisabledRanges(
    ranges: { start_date: string; end_date: string }[]
  ): { from: Date; to: Date }[] {
    return ranges.map((r) => {
      const from = new Date(`${r.start_date}T00:00:00`);
      const to = new Date(`${r.end_date}T23:59:59`);
  
      return { from, to };
    });
  }
  