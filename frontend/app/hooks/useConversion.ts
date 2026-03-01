import { useQuery } from "@tanstack/react-query";
import api from "../services/axios";
import { conversionResponse } from "../types/conversionType";






  export function useFetchConversion(params: {page: number; limit: number; search?: string}) {
    return useQuery<conversionResponse>({
      queryKey: ["conversion-list", params.page, params.limit, params.search ?? ""],
      queryFn: async () => {
        const res = await api.get("/conversion/fetch-conversion-list",{params});
        return res.data;
      },
    });
  }



