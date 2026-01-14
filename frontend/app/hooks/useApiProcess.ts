import { useQuery } from "@tanstack/react-query";
import { fetchApiAttendance } from "../services/hr.api";
import { ApiParams } from "../types/utilsTypes";


export function useFetchApiAttendance(params: ApiParams | null) {
    return useQuery({
      queryKey: ["api_attendance", params],
      queryFn: () => fetchApiAttendance(params!),
      enabled: !!params,        // ⬅ only fetch when ready
      staleTime: 5 * 60 * 1000, // ⬅ cache for 5 minutes
    });
  }
  