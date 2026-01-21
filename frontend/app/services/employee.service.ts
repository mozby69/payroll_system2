import api from "./axios"; 
import { EmployeeResponse } from "../types/empTypes";

export const fetchEmployees = async (
  page = 1,
  limit = 10
): Promise<EmployeeResponse> => {
  const { data } = await api.get("/list/employee", {
    params: { page, limit },
  });
  return data;
};
