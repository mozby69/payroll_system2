
export function MathRound(
  amount?: number | string | null
): number {
  const value = Number(amount ?? 0);

  return Math.round(value * 100) / 100;
}