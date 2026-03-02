import { PaginatedResponse } from "../types/preparePayroll"
import { EmployeeArchivedType, GetEmployeeArchivedParams, TotalPayroll } from "../types/totalPayroll"
import api from "./axios"

type Params = {
  page: number
  pageSize: number
  search?: string
  payCycle?: string
}

export async function getTotalPayrollRequest(
  params: Params
): Promise<PaginatedResponse<TotalPayroll>> {
  const response = await api.get("/payroll-archive/total-payroll", {
    params,
  })

  return response.data
}



    export async function getEmployeeArchivedService(
      params: GetEmployeeArchivedParams
    ): Promise<PaginatedResponse<EmployeeArchivedType>>{
      const response = await api.get("/payroll-archive/employee-archived", {
         params
      })
      return response.data
    } 


    export async function printEmployeeArchivedService(
      params: Omit<GetEmployeeArchivedParams, "page" | "pageSize">
    ): Promise<EmployeeArchivedType[]> {
      const response = await api.get(
        "/payroll-archive/employee-archived/print",
        { params }
      );
    
      return response.data;
    }