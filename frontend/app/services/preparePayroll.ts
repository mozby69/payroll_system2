import api from "./axios";
import { EmployeeRow, PaginatedResponse, PayrollSummary } from "../types/preparePayroll";
import { ImportResponse } from "../hooks/usePreparePayroll";




export const fetchPayroll = async (page:number,limit:number, search?: string,payCode?:string):Promise<PaginatedResponse<PayrollSummary>> => {
  const response = await api.get('/prepare-payroll/employee-summary',{
    params:{page,limit,search,payCode},
  });
  return response.data;
}



export const importBranches = async (): Promise<ImportResponse> => {
  const { data } = await api.post<ImportResponse>(
    "/import/branches"
  );

  return data;
};



export const fetchEmployeesByCycle = async (
  params: {
    cycle: string;
    page: number;
    limit: number;
    search?: string;
  }
): Promise<PaginatedResponse<EmployeeRow>> => {
  const res = await api.get("/prepare-payroll/employee-category-cycle", {
    params,
  });

  return res.data;
};
