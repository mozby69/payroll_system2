export type PayCodeOption = {
    label: string;
    value: string;
  };
  
  const MONTHS = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  
  const getLastDayOfMonth = (year: number, monthIndex: number): number =>
    new Date(year, monthIndex + 1, 0).getDate();
  
  export const generatePayCodeOptions = (monthsBack = 5): PayCodeOption[] => {
    const result: PayCodeOption[] = [];
    const now = new Date();
  
    for (let i = 0; i < monthsBack; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
  
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const monthName = MONTHS[monthIndex];
      const lastDay = getLastDayOfMonth(year, monthIndex);
  
      const firstHalf = `${monthName}-1-15-${year}`;
      const secondHalf = `${monthName}-16-${lastDay}-${year}`;
  
      result.push(
        { label: firstHalf, value: firstHalf },
        { label: secondHalf, value: secondHalf }
      );
    }
  
    return result;
  };
  