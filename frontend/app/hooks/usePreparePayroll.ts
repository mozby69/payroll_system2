"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchPayroll } from "../services/preparePayroll";
import { PaginatedResponse, PayrollSummary } from "../types/preparePayroll";




export function useFetchSummary (page:number,limit:number,search?:string,payCode?:string){
  return useQuery<PaginatedResponse<PayrollSummary>>({
    queryKey:["list_summary",page,limit,search,payCode],
    queryFn:() => fetchPayroll(page,limit,search,payCode),
  })
};

