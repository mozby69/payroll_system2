import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/axios";
import { PagibigResponse, SSSResponse } from "../types/statutoryType";
import SweetAlert from "../components/Swal";




export function useFetchSSSList(params: {page: number; limit: number; search?: string}) {
    return useQuery<SSSResponse>({
      queryKey: [
        "sss-list",
        params.page,
        params.limit,
        params.search ?? "",
      ],
      queryFn: async () => {
        const res = await api.get("/statutory/display-sss-contributions", {params});
        return res.data;
      },
    });
  }
  

  export function useUpdateSSSContribution() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (payload: {
        id: number;
        start_range: number;
        end_range: number;
        employee_share: number;
        employer_share: number;
      }) => {
        const response = await api.put(`statutory/sss-contributions/${payload.id}`,payload);
        return response.data;
      },
      onSuccess: async () => {
        SweetAlert.successAlert("Allowance saved successfully");
        await queryClient.refetchQueries({
          queryKey: ["sss-list"],
        });
      },
    });
  }
  





  export function useFetchPagibigList(params: {page: number; limit: number; search?: string}) {
    return useQuery<PagibigResponse>({
      queryKey: [
        "pagibig-list",
        params.page,
        params.limit,
        params.search ?? "",
      ],
      queryFn: async () => {
        const res = await api.get("/statutory/pagibig-list", {params});
        return res.data;
      },
    });
  }




  export function useUpdatePagibigContribution() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (payload: {
        id: number;
        pagibig_employee_share: number;
        pagibig_employer_share: number;
      }) => {
        const response = await api.put(`statutory/pagibig-edit/${payload.id}`,payload);
        return response.data;
      },
      onSuccess: async () => {
        SweetAlert.successAlert("Updated successfully");
        await queryClient.refetchQueries({
          queryKey: ["pagibig-list"],
        });

        await queryClient.refetchQueries({
          queryKey: ["employees"],
        });

      },
    });
  }
  