import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../services/axios";


export function useArchivePayroll() {
    return useMutation({
      mutationFn: (payload: {
        cycle: string;
        payrollPeriod: string;
      }) =>
        api.post("/payroll-archive/archive-payroll", payload),
    });
  }
  

