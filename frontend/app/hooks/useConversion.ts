import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/axios";
import { conversionResponse } from "../types/conversionType";
import SweetAlert from "../components/Swal";






export function useFetchConversion(
    params: { page: number; limit: number; search?: string },

  ) {
    return useQuery<conversionResponse>({
      queryKey: [
        "conversion-list",
        params.page,
        params.limit,
        params.search ?? "",
      ],
      queryFn: async () => {
        const res = await api.get("/conversion/fetch-conversion-list", {
          params,
        });
        return res.data;
      },

    });
  }



  
  export function useUpdateVacationLeave() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (payload: {
        id: number;
        leave_convert: boolean;
        Vacation: number;

      }) => {
        const response = await api.put(`conversion/vacation-leave-edit/${payload.id}`,payload);
        return response.data;
      },
      onSuccess: async () => {
        SweetAlert.successAlert("Updated successfully");
        await queryClient.refetchQueries({
          queryKey: ["conversion-list"],
        });

      

      },
    });
  }
