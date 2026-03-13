import { useMutation, useQueryClient, useQuery} from "@tanstack/react-query"
import { UpdateEmployeeSetupPayload, GetMainDisburseParams, DisburseDetailsItem, DisburseCompany, GetDisburseCompaniesParams, UpdateCompanySetupPayload } from "../types/disburseType";
import { UpdateEmployeeSetup, approveDisburse, getDisburseCompanies, getDisburseDetails, getMainDisburse, updateCompanySetup} from "../services/disburse.services";


export const useUpdateEmployeeSetup=()=>{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateEmployeeSetupPayload) =>
            UpdateEmployeeSetup(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey:["employees-by-cycle"],
            });
            queryClient.invalidateQueries({
              queryKey: ["employees-initialize-computed"],
            });
        },
    });
};


export const useMainDisburse = (
  params: GetMainDisburseParams
) => {
  return useQuery({
    queryKey: ["main-disburse", params],
    queryFn: () => getMainDisburse(params),
    placeholderData: (previousData) => previousData,
  });
};


export const useApproveDisburse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      approveDisburse(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["main-disburse"],
      });
    },
  });
};


export const useDisburseDetails = (
  mainDisburseID: number | null
) => {
  return useQuery<DisburseDetailsItem[]>({
    queryKey: ["disburse-details", mainDisburseID],
    queryFn: () =>
      getDisburseDetails(mainDisburseID!),
    enabled: !!mainDisburseID,
  });
};


export function useDisburseCompanies(params: GetDisburseCompaniesParams) {
  const { cycle, isDisburse } = params;

  return useQuery<DisburseCompany[]>({
    queryKey: ["disburse-companies", cycle, isDisburse],
    queryFn: () => getDisburseCompanies(params),
    enabled: !!cycle,
  });
}

export const useUpdateCompanySetup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCompanySetupPayload) =>
      updateCompanySetup(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["disburse-companies"],
      });

      queryClient.invalidateQueries({
        queryKey: ["employees-by-cycle"],
      });
      queryClient.invalidateQueries({
        queryKey: ["employees-initialize-computed"],
      });
    },
  });
};
