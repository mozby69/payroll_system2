export function computeTenure(employmentDate: Date, referenceDate: Date): number {
  const refYear = referenceDate.getFullYear();

  const cutoff =
    referenceDate < new Date(refYear, 5, 30)
      ? new Date(refYear - 1, 5, 30)
      : new Date(refYear, 5, 30);

  let tenure = cutoff.getFullYear() - employmentDate.getFullYear();

  const juneCutoff = new Date(employmentDate.getFullYear(), 5, 30);


  if (employmentDate <= juneCutoff) {
    tenure += 1;
  }

  return tenure;
}



export const computeCustomTenure = (
  employmentDate: Date,
  referenceDate: Date
): number => {
  let years = referenceDate.getFullYear() - employmentDate.getFullYear();

  const hasNotReachedAnniversary =
    referenceDate.getMonth() < employmentDate.getMonth() ||
    (referenceDate.getMonth() === employmentDate.getMonth() &&
      referenceDate.getDate() < employmentDate.getDate());

  if (hasNotReachedAnniversary) {
    years--;
  }

  return years;
};

export const getJune30 = (date: Date): Date => {
  return new Date(date.getFullYear(), 5, 30);
};