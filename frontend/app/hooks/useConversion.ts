import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/axios";
import { conversionResponse } from "../types/conversionType";
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