
import { useQuery, keepPreviousData, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchEmployees, fetchEmployeeProfile, updateEmployeePayroll } from "../services/employee.service";
import { EmployeeResponse ,EmployeeFilters, UpdateEmployeePayrollPayload } from "../types/empTypes";


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
