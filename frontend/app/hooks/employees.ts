
import { useQuery, keepPreviousData, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchEmployees, fetchEmployeeProfile, updateEmployeePayroll, fetchCompanies, fetchEmployeesByCompany, bulkIncreaseSalary } from "../services/employee.service";
import { EmployeeResponse ,EmployeeFilters, UpdateEmployeePayrollPayload, Company, EmployeeIncreaseItem, BulkIncreasePayload } from "../types/empTypes";


export const useEmployees = (
  page: number,
  limit = 10,
  search = "",
  filters: EmployeeFilters
) => {
  return useQuery<EmployeeResponse, Error>({
    queryKey: ["employees", page, limit, search, filters],
    queryFn: () => fetchEmployees(page, limit, search, filters),
    placeholderData: keepPreviousData,
  });
};


export const useEmployeeProfile = (empCode: string) => {
  return useQuery({
    queryKey: ["employee-profile", empCode],
    queryFn: () => fetchEmployeeProfile(empCode),
    enabled: !!empCode, 
  });
};

export const useUpdateEmployeePayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEmployeePayrollPayload) =>
      updateEmployeePayroll(payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["employee-profile", variables.empCode],
      });
    },
  });
};


export const useCompanies = () => {
  return useQuery<Company[], Error>({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
    staleTime: 1000 * 60 * 10,
  });
};



export const useEmployeesByCompany = (companyCode: string) => {
  return useQuery<EmployeeIncreaseItem[]>({
    queryKey: ["employees-by-company", companyCode],
    queryFn: () => fetchEmployeesByCompany(companyCode),
    enabled: !!companyCode,
  });
};


export const useBulkIncreaseSalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkIncreasePayload) =>
      bulkIncreaseSalary(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["employees-by-company"],
      });
    },
  });
};