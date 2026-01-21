import { useMutation } from "@tanstack/react-query";
import { loginService } from "../services/login";
import { LoginParams } from "../types/login";

export const useLogin = () => {
  return useMutation({
    mutationFn: (params: LoginParams) => loginService(params),
    
  });
};
