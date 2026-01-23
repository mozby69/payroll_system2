const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  
  function convertBelowThousand(num: number): string {
    let result = "";
  
    if (num >= 100) {
      result += `${ones[Math.floor(num / 100)]} Hundred `;
      num %= 100;
    }
  
    if (num >= 20) {
      result += tens[Math.floor(num / 10)];
      if (num % 10 !== 0) {
        result += `-${ones[num % 10]}`;
      }
    } else if (num > 0) {
      result += ones[num];
    }
  
    return result.trim();
  }
  
  function convertNumber(num: number): string {
    if (num === 0) return "Zero";
  
    const units = [
      "",
      "Thousand",
      "Million",
      "Billion",
      "Trillion",
    ];
  
    let result = "";
    let unitIndex = 0;
  
    while (num > 0) {
      const chunk = num % 1000;
      if (chunk !== 0) {
        result =
          `${convertBelowThousand(chunk)} ${units[unitIndex]} ` + result;
      }
      num = Math.floor(num / 1000);
      unitIndex++;
    }
  
    return result.trim();
  }
  
  export function numberToPesoWords(amount: number): string {
    const [pesoPart, centPart] = amount.toFixed(2).split(".");
    const pesos = Number(pesoPart);
    const cents = Number(centPart);
  
    const pesoWords = convertNumber(pesos);
  
    const centWords =
      cents === 0
        ? "No Cents"
        : `${convertNumber(cents)} Cents`;
  
    return `${pesoWords} Pesos and ${centWords}`;
  }
  