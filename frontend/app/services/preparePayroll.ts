import api from "./axios";
import { PaginatedResponse, PayrollSummary } from "../types/preparePayroll";




export const fetchPayroll = async (page:number,limit:number, search?: string,payCode?:string):Promise<PaginatedResponse<PayrollSummary>> => {
  const response = await api.get('/prepare-payroll/employee-summary',{
    params:{page,limit,search,payCode},
  });
  return response.data;
}