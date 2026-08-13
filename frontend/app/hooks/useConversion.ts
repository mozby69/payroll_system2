import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/axios";
import { conversionArchiveList, conversionArchiveResponse, conversionResponse } from "../types/conversionType";
import SweetAlert from "../components/Swal";






export function useFetchConversion(
    params: { page: number; limit: number; search?: string; company_id?:string },

  ) {
    return useQuery<conversionResponse>({
      queryKey: [
        "conversion-list",
        params.page,
        params.limit,
        params.search ?? "",
        params.company_id,
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
        leave_convert: number;
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
        await queryClient.refetchQueries({
          queryKey:["conversion-report-list"],
        });
      },
    });
  }


interface ConversionReportResponse{
  Sick:number;
  Vacation:number;
  EmployementDate:string;
  basic_salary:number;
  fullname:string;
  daily_rate:number;
  tenure:number;
  leave_convert:number;
  total_leave_for_conversion:number;
  leave_amount_for_conversion:number;
  as_of_date:{
    as_of_date:string;
  };
}



export function useConversionReport(company_id?:string) {
      return useQuery<ConversionReportResponse[]>({
        queryKey: ["conversion-report-list",company_id],
        queryFn: async () => {
          const res = await api.get("/conversion/fetch-reports", {
          params: { company_id }, 
      });
          return res.data;
        
        },
        enabled: !!company_id,
      });
}


export function useSaveConversionArchive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (company_id: string) => {
      const res = await api.post(
        "/conversion/save-conversion",
        null,
        {
          params: { company_id },
        }
      );

      return res.data;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["conversion-list"],
      });
    },
  });
}



export function useDisplayConversionArchive(params: { page: number; limit: number; search?: string;company_id?:string}){
    return useQuery<conversionArchiveResponse>({
      queryKey: [
        "display-conversion-archive",
        params.page,
        params.limit,
        params.search ?? "",
        params.company_id,
      ],
      queryFn: async () => {
        const res = await api.get("/conversion/display-conversion-archive", {
          params,
        });
        return res.data;
      },
    });
  }





export const useConversionArchiveDetails = (id: number | null) => {
  return useQuery<conversionArchiveList[]>({
    queryKey: ['conversion-archive-list', id],
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");

      const res = await api.get<conversionArchiveList[]>(
        `/conversion/conversion-archive/${id}`
      );
      return res.data;
    },
    enabled: !!id,
  });
};





export const useConversionArchiveDetailsBank = (id: number | null) => {
  return useQuery<conversionArchiveList[]>({
    queryKey: ['conversion-archive-bank-list', id],
    queryFn: async () => {
      if (!id) throw new Error("No ID provided");

      const res = await api.get<conversionArchiveList[]>(
        `/conversion/conversion-bank/${id}`
      );
      return res.data;
    },
    enabled: !!id,
  });
};