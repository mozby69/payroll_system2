import api from "./axios";
import { EmployeeFilterOptions } from "../types/FilterTypes";

export const fetchEmployeeFilters = async (): Promise<EmployeeFilterOptions> => {
  const { data } = await api.get("/opt/filters");
  return data;
};
