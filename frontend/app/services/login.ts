import api from "./axios"; 
import { LoginParams, LoginResponse } from "../types/login";

export const loginService = async (
  params: LoginParams
): Promise<LoginResponse> => {
  
  const res = await api.post("/auth/login", params);
  return res.data;
};
