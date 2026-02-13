import api from "./axios"; 
import { EmployeeFilters, EmployeeProfile } from "../types/empTypes";
import { UpdateEmployeePayrollPayload } from "../types/empTypes";

export const fetchEmployees = async (
  page = 1,
  limit = 10,
  search = "",
  filters: EmployeeFilters
) => {
  const { data } = await api.get("/list/employee", {
    params: {
      page,
      limit,
      search,
      "department[]": filters.department,
      "company[]": filters.company,
      "status[]": filters.status,
    },
    paramsSerializer: {
      indexes: false,
    },
  });

  return data;
};



export const fetchEmployeeProfile = async (
  empCode: string
): Promise<EmployeeProfile> => {
  const { data } = await api.get(`/list/employee/${empCode}`);
  return data;
};



export const updateEmployeePayroll = async (
  payload: UpdateEmployeePayrollPayload
) => {
  const { empCode, basicSalary, cashAssistance, ecola } = payload;

  const { data } = await api.put(
    `/list/employee/${empCode}/payroll`,
    {
      basicSalary,
      cashAssistance,
      ecola,
    }
  );

  return data;
};
