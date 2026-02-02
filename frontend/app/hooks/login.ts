import { useMutation, useQuery } from "@tanstack/react-query";
import { loginService } from "../services/login";
import { LoginParams } from "../types/login";
import api from "../services/axios";
import { AuthUser } from "../types/generalTypes";

export const useLogin = () => {
  return useMutation({
    mutationFn: (params: LoginParams) => loginService(params),
    
  });
};



