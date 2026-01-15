"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEmployeesByCycle, fetchPayroll, importBranches } from "../services/preparePayroll";
import { EmployeeRow, PaginatedResponse, PayrollSummary } from "../types/preparePayroll";




export function useFetchSummary (page:number,limit:number,search?:string,payCode?:string){
  return useQuery<PaginatedResponse<PayrollSummary>>({
    queryKey:["list_summary",page,limit,search,payCode],
    queryFn:() => fetchPayroll(page,limit,search,payCode),
  })
};



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


export function useEmployeesByCycle(
  params: {
    cycle: string | null;
    page: number;
    limit: number;
    search?: string;
  }
) {
  return useQuery<PaginatedResponse<EmployeeRow>>({
    queryKey: ["employees", params],
    queryFn: () =>
      fetchEmployeesByCycle({
        cycle: params.cycle!,
        page: params.page,
        limit: params.limit,
        search: params.search,
      }),
    enabled: !!params.cycle,
  });
}

