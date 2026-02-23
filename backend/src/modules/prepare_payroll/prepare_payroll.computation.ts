import { prisma } from "../../config/prismaClient";
import { Prisma } from "@prisma/client";
import { SSSRange, TaxField } from "./prepare_payroll.types";

export const computeSemiMonthlySalary = (basicSalary?: number | null): number => {
    if (!basicSalary) 
        return 0;
    return basicSalary / 2;
};


export const computeDailyRate = (basicSalary?:number | null):number => {
    if (!basicSalary) 
        return 0;
    else{
        const bs = (basicSalary  * 12);
        const result = bs  / 262;
        const final_result = result.toFixed(2);
        return Number(final_result);
    }
}

export const computeAbsent = (absentCount:number | null,basicSalary: number | null ):number => {
    if (!absentCount) 
        return 0;
    
    const dailyRate = computeDailyRate(basicSalary);
    const result = absentCount * dailyRate;
    return (result);
}

export const computeLate = (lateCount:number | null, basicSalary:number | null):number => {
    if(!lateCount)
        return 0;

    const dailyRate = computeDailyRate(basicSalary);
    const lateness = dailyRate / 32;
    const result = lateness * lateCount;
    return Number(result.toFixed(2));
}



export const computeGrossPay = (overtime:number | null,basicPay:number | null,lateCount:number | null, absentCount:number | null ):number => {
  if ( overtime == null || basicPay == null || lateCount == null || absentCount == null)
     return 0;

    const ot_bp = overtime + basicPay;
    const deduct = absentCount + lateCount;
    const res = ot_bp - deduct;
    return Number(res.toFixed(2));
}



export const computePhilRateEmployee = (basicPay: number | null,philPercentage: number | null, isBod:boolean, bodEmployeeShare?: number | null, isNewProbi?: boolean,payCode?: string | null): number => {
  if (basicPay == null || philPercentage == null) return 0;

  if (isBod) {
    return Number(bodEmployeeShare ?? 0);
  }

  if (basicPay == null || philPercentage == null) return 0;

  const isProbi = isNewProbi ?? false;

  if (payCode) {
    const parts = payCode.split("-");
    if (parts.length >= 4) {
      const startDay = Number(parts[1]);

      if (isProbi && startDay !== 1 && startDay !== 16) return 0;
      if (!isProbi && startDay !== 1) return 0;
    }
  }

  const result = basicPay * philPercentage;
  return Number(result.toFixed(2));
};


export const computePhilRateEmployer = (basicPay: number | null,philPercentage: number | null, isBod:boolean,bodEmployeeShare?: number | null, isNewProbi?: boolean,payCode?: string | null): number => {
  if (basicPay == null || philPercentage == null || bodEmployeeShare == null) return 0;

  if (isBod) {
      const res = basicPay * philPercentage;
      const final = res - bodEmployeeShare;
      return Number(final.toFixed(2));
    }

  const isProbi = isNewProbi ?? false;

  if (payCode) {
    const parts = payCode.split("-");
    if (parts.length >= 4) {
      const startDay = Number(parts[1]);

      if (isProbi && startDay !== 1 && startDay !== 16) return 0;
      if (!isProbi && startDay !== 1) return 0;
    }
  }
  const result = (basicPay / 2) * philPercentage;
  return Number(result.toFixed(2));
};




export const computePagibig = (pagibigContrib:number | null, payCode?: string | null):number => {
  if(pagibigContrib == null) return 0
  
  if (payCode) {
    const parts = payCode.split("-");
    if (parts.length < 4) return 0;
    const startDay = Number(parts[1]);
    if (startDay !== 16) return 0;
  }

    return Number(pagibigContrib.toFixed(2));
  

};



export const computeWHTx = (monthlySalary: number, completeContrib: number,taxFields: TaxField[], payCode?: string | null): number => {
  if (!taxFields.length) return 0;

  if (payCode) {
    const parts = payCode.split("-");
    if (parts.length < 4) return 0;
    const startDay = Number(parts[1]);
    if (startDay !== 16) return 0;
  }

  const monthlyTaxable = monthlySalary - (completeContrib);
  if (monthlyTaxable <= 0) return 0;
  const annualTaxable = monthlyTaxable * 12;

  const bracket = taxFields.find((r) => {
    if (r.start_range === null || r.end_range === null) return false;
    return (
      annualTaxable > r.start_range && annualTaxable <= r.end_range
    );
  });
  
  if (!bracket) return 0;
  const baseTax = bracket.annual_base_tax_per_year?.toNumber() ?? 0;
  const excessOver = bracket.annual_base_tax_bracket?.toNumber() ?? 0;
  const rate = bracket.rate_per_bracket?.toNumber() ?? 0;

  const annualTax = baseTax + (annualTaxable - excessOver) * rate;
  return Number((annualTax / 12).toFixed(2));
};



export const computeSSSContribution = (monthlySalary: number,ranges: SSSRange[],isNewProbi?: boolean,payCode?: string | null): string => {
  if (!monthlySalary || !ranges.length) return "0.00";

  const isProbi = isNewProbi ?? false;

  // ✅ Only apply cutoff logic if payCode exists
  if (payCode) {
    const parts = payCode.split("-");
    if (parts.length >= 4) {
      const startDay = Number(parts[1]);

      if (isProbi && startDay !== 1 && startDay !== 16) return "0.00";
      if (!isProbi && startDay !== 1) return "0.00";
    }
  }

  const match = ranges.find((r) => {
    if (!r.start_range || !r.end_range) return false;

    const start = r.start_range.toNumber();
    const end = r.end_range.toNumber();

    return monthlySalary >= start && monthlySalary <= end;
  });

  return (match?.employee_share?.toNumber() ?? 0).toFixed(2);
};



export const computeSSSContributionEmployer = (monthlySalary: number,ranges: SSSRange[],isNewProbi?: boolean,payCode?: string | null): string => {
  if (!monthlySalary || !ranges.length) return "0.00";

  const isProbi = isNewProbi ?? false;

  if (payCode) {
    const parts = payCode.split("-");
    if (parts.length >= 4) {
      const startDay = Number(parts[1]);

      if (isProbi && startDay !== 1 && startDay !== 16) return "0.00";
      if (!isProbi && startDay !== 1) return "0.00";
    }
  }

  const match = ranges.find((r) => {
    if (!r.start_range || !r.end_range) return false;

    const start = r.start_range.toNumber();
    const end = r.end_range.toNumber();

    return monthlySalary >= start && monthlySalary <= end;
  });

  return (match?.employer_share?.toNumber() ?? 0).toFixed(2);
};




type JsonField = | Prisma.JsonValue | string | null | undefined;

type OvertimeSources = {
  overtime?: JsonField;
  nightShift?: JsonField;
  regular?: JsonField;
  nightShiftOt?: JsonField;
};

const parseJson = (field: JsonField): Record<string, string> => {
    if (!field) return {};
  
    if (typeof field === "string") {
      try {
        return JSON.parse(field);
      } catch {
        return {};
      }
    }
  
    if (typeof field === "object" && !Array.isArray(field)) {
      return field as Record<string, string>;
    }
  
    return {};
  };
  

const timeToHours = (time: string): number => {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return h + (m || 0) / 60;
};

const computeSource = (source: Record<string, string>,multipliers: Record<string, number>,basicSalary: number): number => {
    let total = 0;
  
    const dailyRate = computeDailyRate(basicSalary);
    if (!dailyRate) return 0;
  
    for (const label in source) {
      const multiplier = multipliers[label];
      if (!multiplier) continue;
  
      const hours = timeToHours(source[label]); // HH:MM → decimal
  
      const otHourlyRate = (dailyRate / 8) * multiplier;
      const otPay = otHourlyRate * hours;
  
      total += Number(otPay.toFixed(2));
    }
  
    return total;
  };
  

  export const computeOvertime = (basicSalary: number,sources: OvertimeSources): number => {
    if (!basicSalary) return 0;


    const overtimeLabels = {
        "Ordinary Day":1.25,
        "Rest Day": 1.69,
        "Special Day": 1.69,
        "Special Day FRD": 1.95,
        "Regular Holiday": 2.6,
        "Regular HFRD": 3.38,
        "Double RH": 3.9,
        "Double RHFRD":5.07,
      };
  
      const nightShiftLabels = {
        "Ordinary Day":1.1,
        "Rest Day": 1.43,
        "Special Day": 1.43,
        "Special Day FRD": 1.65,
        "Regular Holiday": 2.2,
        "Regular HFRD": 2.86,
        "Double RH": 3.3,
        "Double RHFRD":4.29,
      };
  
      const regularLabels = {
        "Rest Day": 1.3,
        "Special Day": 1.3,
        "Special Day FRD": 1.5,
        "Regular Holiday": 2,
        "Regular HFRD": 2.6,
        "Double RH": 3,
        "Double RHFRD":3.9,
      };
  
      const nightShiftOtLabels = {
        "Ordinary Day":1.375,
        "Rest Day": 1.859,
        "Special Day": 1.859,
        "Special Day FRD": 2.145,
        "Regular Holiday": 2.86,
        "Regular HFRD": 3.718,
        "Double RH": 4.29,
        "Double RHFRD":5.577,
      };
  
  
    const total = 
      computeSource(parseJson(sources.overtime), overtimeLabels, basicSalary) +
      computeSource(parseJson(sources.nightShift), nightShiftLabels, basicSalary) +
      computeSource(parseJson(sources.regular), regularLabels, basicSalary) +
      computeSource(parseJson(sources.nightShiftOt), nightShiftOtLabels, basicSalary);

      return Number(total.toFixed(2));
    
  };
  

