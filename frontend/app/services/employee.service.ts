import api from "./axios"; 
import { BulkIncreasePayload, EmployeeFilters, EmployeeProfile } from "../types/empTypes";
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
  const {
    empCode,
    basicSalary,
    cashAssistance,
    ecola,
    pagibigEmployeeShare,
    WithAtm,
    Disbursing,
    remarks,
  } = payload;

  const { data } = await api.put(
    `/list/employee/${empCode}/payroll`,
    {
      basicSalary,
      cashAssistance,
      ecola,
      pagibigEmployeeShare,
      WithAtm,
      Disbursing,
      ...(remarks ? { remarks } : {}),
    }
  );

  return data;
};

export const fetchCompanies = async () => {
  const { data } = await api.get("/list/companies");
  return data.data;
};


export const fetchEmployeesByCompany = async (
  companyCode: string
) => {
  const { data } = await api.get(
    `/list/employees/company/${companyCode}`
  );
  return data.data;
};

export const bulkIncreaseSalary = async (
  payload: BulkIncreasePayload
) => {
  const { data } = await api.put(
    "/list/employees/bulk-increase",
    payload
  );

  return data;
};