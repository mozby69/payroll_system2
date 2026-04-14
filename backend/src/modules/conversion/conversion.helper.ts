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