import { useQuery } from "@tanstack/react-query";
import { fetchEmployeeFilters } from "../services/Filter.services";

export const useEmployeeFilters = () => {
  return useQuery({
    queryKey: ["employee-filters"],
    queryFn: fetchEmployeeFilters,
    staleTime: 1000 * 60 * 10,
  });
};
