export function toNumber(value: number | string): number {
    return typeof value === "string" ? Number(value) : value;
  }