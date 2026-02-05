import api from "./axios";
import { EmployeeRow, PaginatedResponse, PayrollSummary } from "../types/preparePayroll";
import { ImportResponse } from "../hooks/usePreparePayroll";
import { DateRange } from "../types/utilsTypes";




// export const fetchPayroll = async (page:number,limit:number, search?: string,payCode?:string):Promise<PaginatedResponse<PayrollSummary>> => {
//   const response = await api.get('/prepare-payroll/employee-summary',{
//     params:{page,limit,search,payCode},
//   });
//   return response.data;
// }



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


export interface UpdateEmployeePayrollPayload {
  empCode: string;
  basic_salary?: number;
  pagibig_employee_share?: number;
  pagibig_employer_share?:number;
}

export const updateEmployeePayroll = async (
  payload: UpdateEmployeePayrollPayload
): Promise<{ message: string }> => {
  const res = await api.patch(
    "/prepare-payroll/edit-payroll",
    payload
  );

  return res.data;
};



export function searchEmployees(q: string) {
  return api.get("/prepare-payroll/employees/search", { params: { q } });
}




export interface ComputedProps{
  PayCode:string;
  EmpCodeId:string;
  PayrollPeriod:string;
  LateCount:number;
  late_count:number;
  absence_count:number;
  overtime:number;
  gross_pay:number;
  EmpCode:{
    Firstname:string;
    Lastname:string;
  }
}

export const fetchComputedPayroll = async (params: {
  page: number;
  limit: number;
  search?: string;
  range: DateRange | null;
}): Promise<PaginatedResponse<ComputedProps>> => {
  const res = await api.get("/prepare-payroll/computed-payroll", {
    params: {
      ...params,
      startDate: params.range?.startDate,
      endDate: params.range?.endDate,
    },
  });

  return res.data;
};
