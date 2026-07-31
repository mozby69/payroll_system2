import { Prisma } from "@prisma/client";

export function getPreviousMonth(year: number, month: number) {
  const prev = new Date(year, month - 2, 1); // JS month is 0-based
  return {
    year: prev.getFullYear(),
    month: prev.getMonth() + 1,
  };
}

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}


export function formatAllowanceMonth(selectedMonth: string): string {
  const [year, month] = selectedMonth.split("-").map(Number);

  const date = new Date(year, month - 1, 1);

  const monthName = date.toLocaleString("en-US", {
    month: "long",
  });

  return `${monthName} ${year}`;
}


export const round2 = (value: number): number => Math.round(value * 100) / 100;


export const to2 = (num: number): number => {
  return Number(num.toFixed(2));
};



export function toPrismaJson<T>(value: T): Prisma.InputJsonValue {
  return JSON.parse(
    JSON.stringify(value)
  ) as Prisma.InputJsonValue;
}







export function toNumber(
  value: string | number | null | undefined
): number {
  const converted = Number(value ?? 0);

  return Number.isFinite(converted)
    ? converted
    : 0;
}

export function normalizeEmail(
  value: string | null | undefined
): string | null {
  const email = value?.trim() ?? "";

  if (!email) {
    return null;
  }

  const validEmailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return validEmailPattern.test(email)
    ? email
    : null;
}

export async function processInBatches<T>(
  items: T[],
  batchSize: number,
  handler: (item: T) => Promise<void>
): Promise<void> {
  for (
    let index = 0;
    index < items.length;
    index += batchSize
  ) {
    const batch = items.slice(
      index,
      index + batchSize
    );

    await Promise.all(
      batch.map((item) => handler(item))
    );
  }
}