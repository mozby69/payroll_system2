import { useQuery } from "@tanstack/react-query";
import api from "../services/axios";
import { VarianceResponse } from "../types/varianceType";











export function useDisplayVariance() {
    return useQuery<VarianceResponse>({
      queryKey: ["variance-display"],
      queryFn: async () => {
        const res = await api.get("/variance/fetch-variance");
        return res.data;
      },
    });
  }
  