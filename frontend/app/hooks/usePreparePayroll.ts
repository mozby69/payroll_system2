"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ComputedProps, fetchComputedPayroll, fetchEmployeesByCycle, fetchInitializeComputedPayroll, fetchInitializePayroll, importAttendanceCount, importBranches, searchEmployees, updateEmployeePayroll, UpdateEmployeePayrollPayload } from "../services/preparePayroll";
import { EmployeeRow, PaginatedResponse } from "../types/preparePayroll";
import { DateRange } from "../types/utilsTypes";




// export function useFetchSummary (page:number,limit:number,search?:string,payCode?:string){
//   return useQuery<PaginatedResponse<PayrollSummary>>({
//     queryKey:["list_summary",page,limit,search,payCode],
//     queryFn:() => fetchPayroll(page,limit,search,payCode),
//   })
// };



export type ImportResult = {
  branches: number;
  employees: number;
  employeeDetails:number;
  companyDetails:number;
};

export type ImportResponse = {
  message: string;
  inserted: ImportResult;
};

export const useImportBranches = () => {
  return useMutation<ImportResponse, Error>({
    mutationFn: importBranches,
  });
};




export type ImportAttendanceResult = {
  branches: number;
  employees: number;
  employeeDetails:number;
  companyDetails:number;
};

export type ImportAttendanceResponse = {
  message: string;
  inserted: ImportResult;
};

export const useImportAttendanceCount = () => {
  const queryClient = useQueryClient();

  return useMutation<ImportAttendanceResponse, Error>({
    mutationFn: importAttendanceCount,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversion-list"],
      });
    },
  });
};

export function useEmployeesByCycle(
  params: {
   company_id: string | null;
    page: number;
    limit: number;
    search?: string;
    onlyNew?: boolean;
    onlyMissingSetup?: boolean;
  }

) {
  return useQuery<PaginatedResponse<EmployeeRow>>({
    queryKey: ["employees", params],
    queryFn: () =>
      fetchEmployeesByCycle({
       company_id: params.company_id!,
        page: params.page,
        limit: params.limit,
        search: params.search,
        onlyNew: params.onlyNew,
        onlyMissingSetup: params.onlyMissingSetup
      }),
    enabled: !!params.company_id,
    
  });
}




export function useUpdateEmployeePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEmployeePayrollPayload) =>
      updateEmployeePayroll(payload),

    onSuccess: (_,variables) => {
      // 🔄 Refetch employees list after update
      queryClient.invalidateQueries({
        queryKey: ["employees"],
      });
      queryClient.invalidateQueries({
        queryKey: ["employee-profile", variables.empCode],
      });
    },
  });
}


export function useEmployeeSearch(keyword: string) {
  return useQuery({
    queryKey: ["employee-search", keyword],
    queryFn: () => searchEmployees(keyword).then(res => res.data),
    enabled: keyword.length >= 2,
  });
}




export function useComputedPayroll(params: { company_id: string; page: number; limit: number; search?: string; range: DateRange | null }) {
  return useQuery<PaginatedResponse<ComputedProps>>({
    queryKey: [
      "employees-computed",
      params.company_id ?? "",
      params.page,
      params.limit,
      params.search ?? "",
      params.range?.startDate ?? "",
      params.range?.endDate ?? "",
    ],
    queryFn: () =>
      fetchComputedPayroll(params),

    enabled: !!params.company_id, 
  });
}







export function useFetchInitializePayroll(
  params: {
    cycle: string | null;
    page: number;
    limit: number;
    search?: string;
    onlyNew?: boolean;
    onlyMissingSetup?: boolean;
  }) { return useQuery<PaginatedResponse<EmployeeRow>>({
    queryKey: ["employees-initialize-computed", params],
    queryFn: () =>
      fetchInitializePayroll({
        cycle: params.cycle!,
        page: params.page,
        limit: params.limit,
        search: params.search,
        onlyNew: params.onlyNew,
        onlyMissingSetup: params.onlyMissingSetup
      }),
    enabled: !!params.cycle,
  });
}





export function useInitializeComputedPayroll(params: { cycle: string; page: number; limit: number; search?: string; range: DateRange | null }) {
  return useQuery<PaginatedResponse<ComputedProps>>({
    queryKey: [
      "employees-computed-initialize",
      params.cycle ?? "",
      params.page,
      params.limit,
      params.search ?? "",
      params.range?.startDate ?? "",
      params.range?.endDate ?? "",
    ],
    queryFn: () =>
      fetchInitializeComputedPayroll(params),

    enabled: !!params.cycle, 
  });
}