import { PaginatedResponse } from "../types/preparePayroll"
import { TotalPayroll } from "../types/totalPayroll"
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
