
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createPayroll, ExistingPaycodeProps, getExistingPaycode } from "../services/manual_payroll.service"
import api from "../services/axios";




export function useGetExistingPaycode(){
    return useQuery<ExistingPaycodeProps[]>({
        queryKey: ["manual-existing-paycode"],
        queryFn: getExistingPaycode,
    })
}





export interface ManualPayrollProps {
    paycode: string;
    cycle: string;
    payroll_period: string;
    selected_payroll_date: string;
    EmpCodeId: string;
    Name:string;
    branch:string;
}


export interface ManualPayrollMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ManualPayrollResponse {
  data: ManualPayrollProps[];
  meta: ManualPayrollMeta;
}


export interface CreatePayrollPayload {
  selectedMonth: string;
  selectedRange: string;
  cycleCategory: string;
  payrollPeriod: string;
  fromDate: string;
  toDate: string;
  companyCode: string;
}

export function useCreatePayroll(onSuccess?: () => void) {
      const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPayroll,
      onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ["display-manual-payroll-list"],
      });
      onSuccess?.();
    },
  });
}

 



  export function useManualPayrollList(params: {page: number; limit: number; search?: string}) {
    return useQuery<ManualPayrollResponse>({
      queryKey: [
        "display-manual-payroll-list",
        params.page,
        params.limit,
        params.search ?? "",
      ],
      queryFn: async () => {
        const res = await api.get("/manual-payroll/display-manual-payroll", {params});
        return res.data;
      },
    });
  }
