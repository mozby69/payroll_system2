import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/axios";
import { CompleteVarianceProp, CycleCategory, EmployeeVarianceResponse, SaveFinalVariancePayload, SaveFinalVarianceResponse, UpdateVarianceCategoryPayload, VarianceResponse } from "../types/varianceType";










export function useDisplayVariance(companyCode?: string,cycle?: CycleCategory) {
  return useQuery<VarianceResponse>({
    queryKey: ["variance-display-summary", companyCode, cycle],
    queryFn: async () => {
      const res = await api.get<VarianceResponse>("/variance/fetch-variance", {
        params: {
          company_id: companyCode,
          cycle,
        },
      });

      return res.data;
    },
    enabled: Boolean(companyCode && cycle),
  });
}


export function useDisplayEmployeeVariance(companyCode?: string, cycle?: CycleCategory) {
  return useQuery<EmployeeVarianceResponse>({
    queryKey: ["employee-variance", companyCode, cycle],
    queryFn: async () => {
      const res = await api.get<EmployeeVarianceResponse>(
        "/variance/fetch-emp-variance",
        {
          params: {
            company_id: companyCode,
            cycle,
          },
        }
      );

      return res.data;
    },
    enabled: Boolean(companyCode && cycle),
  });
}


export function useCompleteVariance(companyCode?: string, cycle?: CycleCategory) {
  return useQuery<CompleteVarianceProp>({
    queryKey: ["complete-variance", companyCode, cycle],
    queryFn: async () => {
      const res = await api.get<CompleteVarianceProp>(
        "/variance/complete-variance",
        {
          params: {
            company_id: companyCode,
            cycle,
          },
        }
      );

      return res.data;
    },
    enabled: Boolean(companyCode && cycle),
  });
}








export function useUpdateVarianceCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: UpdateVarianceCategoryPayload
    ) => {
      const response = await api.post("/variance/category-override",payload);
      return response.data;
    },

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: [
          "employee-variance",
          variables.company_id,
          variables.cycle,
        ],
      });
    },
  });
}




export function useSaveFinalVariance() {
  return useMutation<SaveFinalVarianceResponse,Error,SaveFinalVariancePayload>({
    mutationFn: async ({
      company_id,
      cycle,
      paycode,
    }) => {
      const res =
        await api.post<SaveFinalVarianceResponse>("/variance/save-final-variance",null,
          {
            params: {
              company_id,
              cycle,
              paycode,
            },
          }
        );

      return res.data;
    },
  });
}