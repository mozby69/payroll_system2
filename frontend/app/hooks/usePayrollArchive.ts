import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/axios";
import { AxiosError } from "axios";
import { ApiErrorResponse, ArchiveSuccessResponse } from "../types/generalTypes";
import SweetAlert from "../components/Swal";
import { PayrollEmployee, PayrollResponse } from "../types/preparePayroll";
import { useRouter } from "next/navigation";







export function useDisplayPayroll() {
  return useQuery<PayrollResponse>({
    queryKey: ["payroll-display"],
    queryFn: async () => {
      const res = await api.get("/payroll-archive/display-all");
      return res.data;
    },
  });
}



export function useDisplayForApprovalPayroll() {
  return useQuery<PayrollResponse>({
    queryKey: ["payroll-display-for-approval"],
    queryFn: async () => {
      const res = await api.get("/payroll-archive/for-approval");
      return res.data;
    },
    refetchOnMount: "always",
  });
}


export function useSavePayroll(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post("/payroll-archive/payroll-save");
      return res.data;
    },
    onSuccess: async () => {
      SweetAlert.successAlert("Saved successfully");
    
      await queryClient.refetchQueries({
        queryKey: ["payroll-display-for-approval"],
      });
    
      await queryClient.refetchQueries({
        queryKey: ["payroll-display"],
      });
    
      await queryClient.refetchQueries({
        queryKey: ["employees-computed"],
      });
    
      onSuccess?.();
    },
    
    onError: () => {
      SweetAlert.errorAlert("Failed to save payroll");
    },
  });
}






export function useSaveFinalPayroll(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post("/payroll-archive/archived-final-payroll");
      return res.data;
    },
    onSuccess: () => {
      SweetAlert.successAlert("Saved successfully");
      queryClient.invalidateQueries({queryKey: ["payroll-display"], exact:true});
      queryClient.invalidateQueries({ queryKey: ["employees-computed"] });
      onSuccess?.();
    },
    onError: () => {
      SweetAlert.errorAlert("Failed to save payroll");
    },
  });
}




export function useReCheckPayroll(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post("/payroll-archive/recheck-payroll");
      return res.data;
    },
    onSuccess: async () => {
      SweetAlert.successAlert("Recheck successful");

      await queryClient.invalidateQueries({
        queryKey: ["payroll-display-for-approval"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["payroll-display"],
      });
      
      await queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === "employees-computed",
      });
    

      onSuccess?.();
    },
    onError: () => {
      SweetAlert.errorAlert("Failed to recheck payroll");
    },
  });
}
