
import api from "./axios"; 
import { FetchLoanLedgerPayload,SubmitOverridePayload,VerifyPasswordResponse } from "../types/editableLoanTypes";


export const verifyPassword = async (
  password: string
): Promise<VerifyPasswordResponse> => {
  const { data } = await api.post("/editable-loan/verify-password", {
    password,
  });

  return data;
};

export const fetchLoanLedger = async (
  payload: FetchLoanLedgerPayload
) => {
  const { data } = await api.post("/editable-loan/loan-ledger", payload);
  return data;
};

export const saveOverrideLoan = async (
  payload: SubmitOverridePayload
) => {
  const { data } = await api.post("/editable-loan/loan_override", payload);
  return data;
};