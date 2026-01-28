
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchEmployees, fetchEmployeeProfile } from "../services/employee.service";
import { EmployeeResponse ,EmployeeFilters } from "../types/empTypes";


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