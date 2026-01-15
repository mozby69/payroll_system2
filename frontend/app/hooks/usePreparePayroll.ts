"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchPayroll, importBranches } from "../services/preparePayroll";
import { PaginatedResponse, PayrollSummary } from "../types/preparePayroll";




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
