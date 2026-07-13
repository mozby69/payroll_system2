import { useQuery } from "@tanstack/react-query";
import api from "../services/axios";
import { CycleCategory, EmployeeVarianceResponse, VarianceResponse } from "../types/varianceType";










export function useDisplayVariance(companyCode?: string,cycle?: CycleCategory) {
  return useQuery<VarianceResponse>({
    queryKey: ["variance-display-summary", companyCode, cycle],
    queryFn: async () => {
      const res = await api.get<VarianceResponse>("/variance/fetch-variance", {
        params: {
          company_id: companyCode,
          cycle,
        },
      });

      return res.data;
    },
    enabled: Boolean(companyCode && cycle),
  });
}


export function useDisplayEmployeeVariance(companyCode?: string, cycle?: CycleCategory) {
  return useQuery<EmployeeVarianceResponse>({
    queryKey: ["employee-variance", companyCode, cycle],
    queryFn: async () => {
      const res = await api.get<EmployeeVarianceResponse>(
        "/variance/fetch-emp-variance",
        {
          params: {
            company_id: companyCode,
            cycle,
          },
        }
      );

      return res.data;
    },
    enabled: Boolean(companyCode && cycle),
  });
}