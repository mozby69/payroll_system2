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



export type AddLoanPayload = {
  empCode: string;
  loan_type: "FCH_LOAN" | "SSS_LOAN" | "PAGIBIG_LOAN";
  principal: number;
  term_value: number;
  term_unit: "MONTHS" | "YEARS";
  start_date: string;
};


export function addEmployeeLoan(payload: AddLoanPayload) {
  return api.post("/prepare-payroll/loans-add", payload);
}

export function searchEmployees(q: string) {
  return api.get("/prepare-payroll/employees/search", { params: { q } });
}