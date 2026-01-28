import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApiAttendance } from "../services/hr.api";
import { ApiParams } from "../types/utilsTypes";
import { useEffect } from "react";


export function useFetchApiAttendance(params: ApiParams | null) {

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["api_attendance", params],
    queryFn: () => fetchApiAttendance(params!),
    enabled: !!params,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.dataUpdatedAt) {
      queryClient.invalidateQueries({
        queryKey: ["employees-computed"],
        refetchType: "all",
      }); 
    }
  }, [query.dataUpdatedAt, queryClient]);
  
  return query;
}
