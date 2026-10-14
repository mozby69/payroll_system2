import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/axios";
import { DisplayWtaxFetchResponse, DisplayWtaxPaidResponse, DisplayWtaxResponse, PagibigResponse, PhilResponse, SSSResponse, WtaxListComputaionResponse, WTaxResponse, WtaxTaxPeriodResponse } from "../types/statutoryType";
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
  


export function useFetchPhilList() {
    return useQuery<PhilResponse>({
      queryKey: ["phil-list",],
      queryFn: async () => {
        const res = await api.get("/statutory/philhealth-list");
        return res.data;
      },
    });
  }


  
  export function useUpdatePhilhealth() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (payload: {id: number; SettingPercentage: string}) => {
        const res = await api.put(`/statutory/philhealth-edit/${payload.id}`,payload);
        return res.data;
      },
      onSuccess: () => {
        SweetAlert.successAlert("Updated successfully");
        queryClient.invalidateQueries({
          queryKey: ["phil-list"],
        });
        queryClient.invalidateQueries({
          queryKey: ["employees"],
        });
      },
    });
  }



  export function useFetchWTax() {
    return useQuery<WTaxResponse>({
      queryKey: ["wtax-list"],
      queryFn: async () => {
        const res = await api.get("/statutory/display-wtax");
        return res.data;
      },
    });
  }



  export function useUpdateWtax() {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async (payload: {
        id: number;
        start_range: number;
        end_range: number;
        annual_base_tax_bracket: number;
        rate_per_bracket: number;
        annual_base_tax_per_year: number;

      }) => {
        const response = await api.put(`statutory/wtax-edit/${payload.id}`,payload);
        return response.data;
      },
      onSuccess: async () => {
        SweetAlert.successAlert("Updated successfully");
        await queryClient.refetchQueries({
          queryKey: ["wtax-list"],
        });

        await queryClient.refetchQueries({
          queryKey: ["employees"],
        });

      },
    });
  }






    export function useFetchWtaxComputationList(params: {page: number; limit: number; search?: string}) {
    return useQuery<WtaxListComputaionResponse>({
      queryKey: [
        "wtax-computation-list",
        params.page,
        params.limit,
        params.search ?? "",
      ],
      queryFn: async () => {
        const res = await api.get("/statutory/get-wtax-computation-list", {params});
        return res.data;
      },
    });
  }



export type SaveMonthlyTaxPayload = {
  month: number;
  year: number;
  taxAmount: number;
  empCodeId: string;
};

export function useSaveMonthlyTax() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: SaveMonthlyTaxPayload
    ) => {
      const res = await api.post(
        "/statutory/save-monthly-tax",
        payload
      );

      return res.data;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "display-wtax-monthly",
          variables.empCodeId,
        ],
      });
    },
  });
}



export function useDisplayWtax(empCodeId: string) {
  return useQuery<DisplayWtaxResponse>({
    queryKey: ["display-wtax-monthly",empCodeId],
    queryFn: async () => {
      const res = await api.get(`/statutory/display-wtax-monthly/${empCodeId}`);
      return res.data;
    },
    enabled: !!empCodeId,
  });
}




export function useDisplayWtaxPaid(empCodeId: string,month: number,year: number) {
  return useQuery<DisplayWtaxPaidResponse>({
    queryKey: [
      "display-wtax-monthly-paid",
      empCodeId,
      month,
      year,
    ],
    queryFn: async () => {
      const res = await api.get(
        `/statutory/display-tax-paid/${empCodeId}`,
        {
          params: {
            month,
            year,
          },
        }
      );

      return res.data;
    },
    enabled: !!empCodeId && month > 0 && year > 0,
  });
}





export function useDisplayWtaxFetch(empCodeId: string,month: number,year:number) {
  return useQuery<DisplayWtaxFetchResponse>({
    queryKey: ["display-wtax-fetch",empCodeId,month,year],
    queryFn: async () => {
      const res = await api.get<DisplayWtaxFetchResponse>(
        `/statutory/wtax-fetch`,
        {
          params: {
            empcode: empCodeId,
            month,
            year
          },
        }
      );

      return res.data;
    },
    enabled: Boolean(empCodeId) && month > 0,
  });
}





export function useFetchWtaxTaxPeriod(params: {page: number; limit: number; search?: string}) {
    return useQuery<WtaxTaxPeriodResponse>({
      queryKey: [
        "wtax-tax-period-list",
        params.page,
        params.limit,
        params.search ?? "",
      ],
      queryFn: async () => {
        const res = await api.get("/statutory/wtax-tax-period-list", {params});
        return res.data;
      },
    });
  }