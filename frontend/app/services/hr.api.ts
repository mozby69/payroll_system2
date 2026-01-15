import { ApiParams } from "../types/utilsTypes";
import api from "./axios"

export const fetchApiAttendance = async (params: ApiParams) => {
    const res = await api.post("/process/employee-attendance", params);
    return res.data;
  };