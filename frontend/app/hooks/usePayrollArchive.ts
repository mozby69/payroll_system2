import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/axios";
import { AxiosError } from "axios";
import { ApiErrorResponse, ArchiveSuccessResponse } from "../types/generalTypes";
import SweetAlert from "../components/Swal";

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
  absence:number;
  gross_pay:number;
  sss_contrib_employee:number;
  sss_contrib_employer:number;
  pagibig_contrib_employee:number;
  pagibig_contrib_employer:number,
  philhealth_contrib:number;
  net_pay:number;
  wtax:number;
}

export interface PayrollResponse {
  status: "SUCCESS";
  data: PayrollEmployee[];
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



export function useSavePayroll(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post("/payroll-archive/payroll-save");
      return res.data;
    },
    onSuccess: () => {
     
      SweetAlert.successAlert("Saved successfully");
      queryClient.invalidateQueries({
        queryKey: ["payroll-display"],
      });
      onSuccess?.();
    },
    onError: () => {
      SweetAlert.errorAlert("Failed to save payroll");
    },
  });
}