import { useQuery } from "@tanstack/react-query";
import api from "../services/axios";
import { VarianceResponse } from "../types/varianceType";










export function useDisplayVariance(companyCode?: string) {
  return useQuery<VarianceResponse>({
    queryKey: ["variance-display-summary", companyCode],
    queryFn: async () => {
      const res = await api.get("/variance/fetch-variance", {
        params: { company_id: companyCode }
      });
      return res.data;
    },
    enabled: !!companyCode
  });
}

export function useDisplayVarianceEmp(companyCode: string) {
  return useQuery({
    queryKey: ["variance-display-emp", companyCode], 
    queryFn: async () => {
      const res = await api.get("/variance/fetch-variance-emp", {
        params: { company_id: companyCode }
      });
      return res.data;
    },
    enabled: !!companyCode
  });
}