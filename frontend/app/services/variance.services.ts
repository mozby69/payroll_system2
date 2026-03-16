import api from "./axios";
import { PayrollVarianceResult } from "../types/varianceType";

export async function getPayrollVariance(
  companyId: string,
  cycleCategory: string
): Promise<PayrollVarianceResult> {

  const res = await api.get(
    `/variance/payroll-variance`,
    {
      params: {
        companyId,
        cycleCategory
      }
    }
  );

  return res.data;
}