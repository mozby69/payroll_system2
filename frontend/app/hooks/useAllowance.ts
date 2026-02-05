import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/axios";
import { AllowanceListResponse, AllowanceProps } from "../types/allowanceType";
import SweetAlert from "../components/Swal";
import { ApiErrorResponse } from "../types/generalTypes";
import { AxiosError } from "axios";




export function useFetchAllowance(params: {
    page: number;
    limit: number;
    search?: string;
    month?:string;
  }) {
    return useQuery<AllowanceListResponse>({
      queryKey: [
        "allowance-list",
        params.page,
        params.limit,
        params.search ?? "",
        params.month,
      ],
      queryFn: async () => {
        const res = await api.get("/allowance/fetch-allowance", {
          params,
        });
        return res.data;
      },
      enabled: !!params.month, 
    });
  }
  

  export function useSaveAllowance(selectedMonth: string, onSuccess?: () => void) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async () => {
        if (!selectedMonth) {
          throw new Error("Month is required");
        }
  
        const res = await api.post("/allowance/save-allowance", {
          selectedMonth,
        });
  
        return res.data;
      },
  
      onSuccess: () => {
        SweetAlert.successAlert("Allowance saved successfully");
        queryClient.invalidateQueries({
          queryKey: ["allowance-list"],
        });
  
        queryClient.invalidateQueries({
          queryKey: ["allowance-summary", selectedMonth],
        });
        onSuccess?.();
      },
  
      onError: (error: AxiosError<ApiErrorResponse>) => {
        const status = error.response?.status;
        const message = error.response?.data?.message;
  
        if (status === 409) {
          SweetAlert.warningAlert(
            "Already Saved",
            message ?? "This allowance month is already saved."
          );
          return;
        }
  
        SweetAlert.errorAlert(
          message ?? "Failed to save allowance"
        );
      },
    });
  }






  export function useAllowanceSummary(month?: string) {
    return useQuery<{
      cash_allowance: number;
      ecola: number;
      total: number;
      totalDeduction: number;
    }>({
      queryKey: ["allowance-summary", month],
      queryFn: async () => {
        const res = await api.get("/allowance/summary", {
          params: { month },
        });
        return res.data;
      },
      enabled: !!month,
    });
  }
  