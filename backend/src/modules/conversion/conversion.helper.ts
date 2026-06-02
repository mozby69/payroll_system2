// export function computeTenure(employmentDate: Date, referenceDate: Date): number {
//   const refYear = referenceDate.getFullYear();

//   const cutoff = referenceDate < new Date(refYear, 5, 30) ? new Date(refYear - 1, 5, 30): new Date(refYear, 5, 30);

//   let tenure = cutoff.getFullYear() - employmentDate.getFullYear();

//   const juneCutoff = new Date(employmentDate.getFullYear(), 5, 30);


//   if (employmentDate <= juneCutoff) {
//     tenure += 1;
//   }

//   return tenure;
// }

export function computeTenure(employmentDate: Date,referenceDate: Date,company_id: string): number {
  const refYear = referenceDate.getFullYear();

  const cutoffMonth = company_id === "EMB" ? 5 : 11;
  const cutoffDay = company_id === "EMB" ? 30 : 31;

  const currentCutoff = new Date(
    refYear,
    cutoffMonth,
    cutoffDay
  );

  const cutoff = referenceDate < currentCutoff ? new Date(refYear - 1, cutoffMonth, cutoffDay) : currentCutoff;
  let tenure = cutoff.getFullYear() - employmentDate.getFullYear();

  const employeeCutoff = new Date(employmentDate.getFullYear(),cutoffMonth,cutoffDay);

  if (employmentDate <= employeeCutoff) {
    tenure += 1;
  }

  return tenure;
}


export const computeCustomTenure = (employmentDate: Date,referenceDate: Date): number => {
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



// export const getJune30 = (date: Date): Date => {
//   return new Date(date.getFullYear(), 5, 30);
// };

export const getCompanyCutOffDate = (date: Date,company_id: string): Date => {
  if (company_id === "EMB") {
    return new Date(date.getFullYear(), 5, 30); 
  }

  return new Date(date.getFullYear(), 11, 31); 
};