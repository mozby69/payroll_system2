import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/axios";
import SweetAlert from "../components/Swal";
import {  PayrollResponse } from "../types/preparePayroll";
import { getEmployeeArchivedService, getPayrollArchiveReportService, getTotalPayrollRequest, printEmployeeArchivedService } from "../services/archive.services";
import { BankResponse, GetEmployeeArchivedParams } from "../types/totalPayroll";
import { ApiErrorResponse, ErrorResponse } from "../types/generalTypes";
import { AxiosError } from "axios";
import { PayrollArchiveReport } from "../types/archiveTypes";





export function useSaveWtaxOverride() {
  return useMutation({
    mutationFn: async (payload: {
      PayCode: string;
      EmpCodeId: string;
      PayrollPeriod: string;
      computedWtax: number;
      editedValue: number;
    }) => {
      await api.post("/payroll-archive/wtax-override", payload);
    }
  });
}





export function useDisplayPayroll(company_id?: string) {
  return useQuery<PayrollResponse>({
    queryKey: ["payroll-display", company_id],
    enabled: !!company_id,
    queryFn: async () => {
      const res = await api.get("/payroll-archive/display-all", {
        params: { company_id },
      });
      return res.data;
    },
  });
}



export function useDisplayForApprovalPayroll(status: "FOR_CHECKER" | "FOR_APPROVER") {
  return useQuery<PayrollResponse>({
    queryKey: ["payroll-display-for-approval",status],
    queryFn: async () => {
      const res = await api.get("/payroll-archive/for-approval",{
        params: { status },
      });
      return res.data;
    },
    refetchOnMount: "always",
  });
}


export function useSavePayroll(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (company_id:string) => {
      const res = await api.post("/payroll-archive/payroll-save",null,{
        params:{company_id},
      });
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
    mutationFn: async ({cycle,companyId}:{cycle:string; companyId:string}) => {
      const res = await api.post("/payroll-archive/archived-final-payroll",null,{
        params:{cycle, companyId},
      });
      return res.data;
    },
    onSuccess: async () => {
      SweetAlert.successAlert("Saved successfully");

      await queryClient.invalidateQueries({
        queryKey: ["payroll-display-for-approval"],
      });
      
      await queryClient.invalidateQueries({
        queryKey: ["payroll-display"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["employees-computed"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["disabled-payroll-dates"],
      });

      await queryClient.invalidateQueries({
        queryKey:["totalPayroll"],
      });

      
      onSuccess?.();
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const message = error.response?.data?.message ?? "Failed to save payroll";
      SweetAlert.errorAlert(message);
    },
  });
}




export function useReCheckPayroll(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (company_id:string) => {
      const res = await api.post("/payroll-archive/recheck-payroll",null,{
        params:{company_id},
      });
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





export function useReCheckPayrollToChecker(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (company_id:string) => {
      const res = await api.post("/payroll-archive/recheck-back-to-checker",null,{
        params:{company_id},
      });
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


export function useTotalPayroll(
  page: number,
  pageSize: number,
  search?: string,
  payCycle?: string
) {
  return useQuery({
    queryKey: ["totalPayroll", page, pageSize, search, payCycle],
    queryFn: () =>
      getTotalPayrollRequest({
        page,
        pageSize,
        search,
        payCycle,
      }),
    placeholderData: (previousData) => previousData,
  })
}


export function useGetEmployeeArchived(
 params: GetEmployeeArchivedParams
){
    return useQuery({
      queryKey: ["employee-archived", 
        params.page, 
        params.pageSize,
        params.search,
        params.totalPayrollId ,
        params.selectedCompany,
        params.selectedBranch
      ],
      queryFn: () =>
        getEmployeeArchivedService({
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          totalPayrollId: params.totalPayrollId,
          selectedCompany: params.selectedCompany,
          selectedBranch: params.selectedBranch
        }),
      placeholderData: (previousData) => previousData,
      enabled: !!params.totalPayrollId,
    })
}


export function usePrintEmployeeArchived(
  params: Omit<GetEmployeeArchivedParams, "page" | "pageSize">
) {
  return useQuery({
    queryKey: ["employee-archived-print", params],
    queryFn: () => printEmployeeArchivedService(params),
    enabled: !!params.totalPayrollId,
  });
}








export function useFetchBank(PayCode: string | null,cycle_category:string | null) {
  return useQuery<BankResponse>({
    queryKey: ['fetch-bank-list', PayCode,cycle_category],
    queryFn: async () => {

      if (!PayCode || !cycle_category) {
        throw new Error('PayCode is required');
      }

      const response = await api.get<BankResponse>(`/payroll-archive/employee-bank-list?PayCode=${PayCode}&cycle_category=${cycle_category}`);
      return response.data;
    },
    enabled: Boolean(PayCode && cycle_category), 
  });
}



// interface BankFileRow {
//   bankAccount: string;
//   amount: number;
// }
export function useGenerateBankFile() {
  const generate = async (
    bank: "BDO" | "PNB",
    rows: { bankAccount: string; amount: number }[]
  ) => {
    const response = await api.post(
      `/payroll-archive/generate-bank-file?bank=${bank}`,
      rows
    );

    const { filename, file, mime } = response.data;

    const byteCharacters = atob(file);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mime });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename; 
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  };

  return { generate };
}












// export function useSavePayroll(onSuccess?: () => void) {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (company_id:string) => {
//       const res = await api.post("/payroll-archive/payroll-save",null,{
//         params:{company_id},
//       });
//       return res.data;
//     },



export function useSaveToApproverPayroll(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (company_id:string) => {
      const res = await api.post("/payroll-archive/save-to-approver",null,{
        params:{company_id},
      });
      return res.data;
    },
    onSuccess: async () => {
      SweetAlert.successAlert("successful");

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


export function usePayrollArchiveReport(
  totalPayrollId: number,
  company_id: string
) {
  return useQuery<PayrollArchiveReport>({
    queryKey: ["payroll-archive-report", totalPayrollId, company_id],

    queryFn: () =>
      getPayrollArchiveReportService({
        totalPayrollId,
        company_id,
      }),
      enabled: !!company_id && !!totalPayrollId,
      staleTime: 1000 * 60 * 5,
  });
}