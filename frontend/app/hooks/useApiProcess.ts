import { useQuery } from "@tanstack/react-query";
import { fetchApiAttendance } from "../services/hr.api";
import { ApiParams } from "../types/utilsTypes";
import api from "../services/axios";
import { PayrollDateRange } from "../types/generalTypes";


export function useFetchApiAttendance(params: ApiParams | null) {
  return useQuery({
    queryKey: ["api_attendance", params],
    queryFn: () => fetchApiAttendance(params!),
    enabled: !!params,
    staleTime: 0, // Don't cache this - always fetch fresh
    refetchOnMount: false, // Don't refetch automatically
  });
}






export function useDisabledPayrollDates(cycle: string) {
  return useQuery({
    queryKey: ["disabled-payroll-dates", cycle],
    queryFn: async (): Promise<PayrollDateRange[]> => {
      const res = await api.get("/process/disabled-dates", {
        params: { cycle },
      });
      return res.data;
    },
    enabled: Boolean(cycle),
    staleTime: 5 * 60 * 1000,
  });
}
