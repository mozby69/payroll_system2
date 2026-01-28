import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../services/axios";
import { AxiosError } from "axios";
import { ApiErrorResponse, ArchiveSuccessResponse } from "../types/generalTypes";

export interface PayrollEmployee {
  PayCode: string;
  CycleCategory: string;
  PayrollPeriod: string;
  LateCount: number;
  TotalAbsentHours: string;
  TotalOvertime: string;
  TotalUndertime: number;
  RegularAtt: Record<string, string>;
  OvertimeAtt: Record<string, string>;
  NightShiftAtt: Record<string, string>;
  NightShiftOtAtt: Record<string, string>;
  EmpCodeId: string;
  EmpCode: {
    Firstname: string;
    Lastname: string;
  };
  semi_monthly:number;
  overtime:number;
  late_count:number;
}

export interface PayrollResponse {
  status: "SUCCESS";
  data: PayrollEmployee[];
}




export function useArchivePayroll() {
  return useMutation<ArchiveSuccessResponse,AxiosError<ApiErrorResponse>,     
    { cycle: string; payrollPeriod: string }>({
    mutationFn: async (payload) => {
      const res = await api.post("/payroll-archive/archive-payroll",payload);
      return res.data;
    },
  });
}


export function useDisplayPayroll() {
  return useQuery<PayrollResponse>({
    queryKey: ["payroll-display"],
    queryFn: async () => {
      const res = await api.get("/payroll-archive/display-all");
      return res.data;
    },
  });
}
