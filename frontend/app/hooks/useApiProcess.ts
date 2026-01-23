import { useQuery } from "@tanstack/react-query";
import { fetchApiAttendance } from "../services/hr.api";
import { ApiParams } from "../types/utilsTypes";


export function useFetchApiAttendance(params: ApiParams | null) {
  return useQuery({
    queryKey: ["api_attendance", params],
    queryFn: () => fetchApiAttendance(params!),
    enabled: !!params,
    staleTime: 0, // Don't cache this - always fetch fresh
    refetchOnMount: false, // Don't refetch automatically
  });
}