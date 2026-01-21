import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchEmployees } from "../services/employee.service";
import { EmployeeResponse } from "../types/empTypes";

export const useEmployees = (page: number, limit = 10) => {
  return useQuery<EmployeeResponse, Error>({
    queryKey: ["employees", page, limit],
    queryFn: () => fetchEmployees(page, limit),
    placeholderData: keepPreviousData, 
  });
};
