import { useMutation, useQueryClient, useQuery} from "@tanstack/react-query"
import { UpdateEmployeeSetupPayload, GetMainDisburseParams, DisburseDetailsItem } from "../types/disburseType";
import { UpdateEmployeeSetup, approveDisburse, getDisburseDetails, getMainDisburse} from "../services/disburse.services";


export const useUpdateEmployeeSetup=()=>{
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateEmployeeSetupPayload) =>
            UpdateEmployeeSetup(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey:["employees-by-cycle"],
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