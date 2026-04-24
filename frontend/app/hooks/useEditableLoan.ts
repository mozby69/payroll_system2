import { useMutation,useQueryClient  } from "@tanstack/react-query";
import { verifyPassword, fetchLoanLedger, saveOverrideLoan } from "../services/editableLoan.services";
import { VerifyPasswordResponse } from "../types/editableLoanTypes";

export const useVerifyPassword = () => {
  return useMutation<VerifyPasswordResponse, Error, string>({
    mutationFn: (password: string) => verifyPassword(password),
  });
};

export const useFetchLoanLedger = () => {
  return useMutation({
    mutationFn: fetchLoanLedger,
  });
};

export const useSaveOverrideLoan = (company_id?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveOverrideLoan,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payroll-display", company_id],
      });
    },
  });
};