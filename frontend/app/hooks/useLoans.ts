import { useQueryClient, useMutation, useQuery,keepPreviousData} from "@tanstack/react-query";
import { addEmployeeLoan, closedEmployeeLoan, fetchAllLoans,fetchBonusRules,fetchEmpLoanById,fetchLoanDetails, fetchLoansByEmpCode, fetchLoanSummary, loanSearchEmployees, payEmployeeLoan, removeLoanLedger, updateEmployeeLoan, updateLedgerDate } from "../services/loan.services";
import { LoanFilters, LoanResponse,EmpLoanResponse, UpdateLoanVariables, CloseLoanVariables, PayLoanPayload, FetchEmpLoansPayload, EmpLoansByCycleResponse, BonusRules, EmployeeSearchItem, LoanMonitoringRow, RemoveLedgerPayload, UpdateLedgerDateVariables } from "../types/loanTypes";



export function useAddLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addEmployeeLoan,
    onSuccess: (_, loan_id) => {
      queryClient.invalidateQueries({ 
        queryKey: ["addloan"] });

      queryClient.invalidateQueries({
        queryKey: ["emp-loan", loan_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["loan-details", loan_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["loans"],
      });
    },
  
  });
}

 
export const useLoans = (
  page: number,
  limit = 3,
  search = "",
  filters: LoanFilters,
  enabled = true
) => {
  return useQuery<LoanResponse, Error>({
    queryKey: ["loans", page, limit, search, filters],
    queryFn: () => fetchAllLoans(page, limit, search, filters),
    enabled,
    placeholderData: keepPreviousData,
  });
};



export const useLoanDetails = (loan_id: number, enabled: boolean) => {
  return useQuery({
    queryKey: ["loan-details", loan_id],
    queryFn: () => fetchLoanDetails(loan_id),
    enabled,
  });
};


export const useEmpLoanById = (
  loan_id: number,
  enabled = true
) => {
  return useQuery<EmpLoanResponse>({
    queryKey: ["emp-loan", loan_id],
    queryFn: () => fetchEmpLoanById(loan_id),
    enabled,
  });
};

export const useUpdateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({loan_id,payload,}:UpdateLoanVariables) => 
      updateEmployeeLoan(loan_id, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["emp-loan", variables.loan_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["loan-details", variables.loan_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["loans"],
      });
    },
  });
};

export const useClosedLoan = () =>{
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loan_id, payload }: CloseLoanVariables) =>
      closedEmployeeLoan(loan_id, payload),

    onSuccess: (_, variables) =>{
     queryClient.invalidateQueries({
        queryKey: ["emp-loan", variables.loan_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["loan-details", variables.loan_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["loans"],
      });
    },
  });
};



export const usePayEmployeeLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loan_id, actionType }: PayLoanPayload) =>
      payEmployeeLoan(loan_id, actionType),

    onSuccess: (_, { loan_id }) => {
      queryClient.invalidateQueries({ queryKey: ["emp-loan", loan_id] });
      queryClient.invalidateQueries({ queryKey: ["loan-details", loan_id] });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });
};



export const useEmpLoansByCycle = (
  payload: FetchEmpLoansPayload,
  enabled = true
) => {
  return useQuery<EmpLoansByCycleResponse>({
    queryKey: ["emp-loans-by-cycle", payload],
    queryFn: () => fetchLoansByEmpCode(payload),
    enabled,
  });
};

export const useBonusRules = () => {
  return useQuery<BonusRules[]>({
    queryKey: ["bonus-rules"],
    queryFn: fetchBonusRules,
  });
};


export function useEmployeeSearch(keyword: string) {
  return useQuery<EmployeeSearchItem[]>({
    queryKey: ["employee-search", keyword],
    queryFn: () =>
      loanSearchEmployees(keyword).then(res => res.data),
    enabled: keyword.length >= 2,
  });
}



export const useLoanSummary = (
  month: string,
  cycle:string,
  period: string,
  companyCode?: string,
  loanType?:string,
  enabled = true
) => {

  return useQuery<LoanMonitoringRow[]>({
    queryKey: ["loan-summary", month,cycle, period, companyCode, loanType],
    queryFn: () => fetchLoanSummary(month,cycle, period, companyCode, loanType),
    enabled
  });

};



export const useRemoveLoanLedger = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      loan_id,
      ledger_id,
      remarks,
    }: RemoveLedgerPayload) =>
      removeLoanLedger(loan_id, ledger_id, remarks),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["emp-loan", variables.loan_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["loan-details", variables.loan_id],
      });

      queryClient.invalidateQueries({
        queryKey: ["loans"],
      });
    },
  });
};


export const useUpdateLedgerDate = () => {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: ({
      loan_id,
      ledger_id,
      transaction_date,
      remarks
    }: UpdateLedgerDateVariables) =>
      updateLedgerDate(
        loan_id,
        ledger_id,
        transaction_date,
        remarks
      ),

    onSuccess: (_, variables) => {

      queryClient.invalidateQueries({
        queryKey: ["emp-loan", variables.loan_id]
      });

      queryClient.invalidateQueries({
        queryKey: ["loan-details", variables.loan_id]
      });

      queryClient.invalidateQueries({
        queryKey: ["loans"]
      });

    }
  });
};