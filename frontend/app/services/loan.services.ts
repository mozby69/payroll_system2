import {api} from "./axios"
import {AddLoanPayload, CloseLoanRequest, LoanActionType, LoanFilters,UpdateLoanPayload} from "../types/loanTypes"

export const addEmployeeLoan = async (payload: AddLoanPayload) => {
  const res = await api.post("/approved/loans-add", payload);
  return res.data;
};

export const fetchAllLoans = async (
  page = 1,
  limit = 3,
  search = "",
  filters: LoanFilters
) => {
  const { data } = await api.get("/get-loan/all-loans", {
    params: {
      page,
      limit,
      search,
      "department[]": filters.department,
      "company[]": filters.company,
      "status[]": filters.status,
      "loanStatus[]": filters.loanStatus
    },
    paramsSerializer: {
      indexes: false,
    },
  });

  return data;
};

export const fetchLoanDetails = async (loan_id: number) => {
  const { data } = await api.get(`/get-loan-ledger/loans/${loan_id}/details`);
  return data;
};


export const fetchEmpLoanById = async (loan_id:number) =>{
  const {data} = await api.get(`/get-emp-loan/by-id/${loan_id}`);
  return(data);
}

export const updateEmployeeLoan = async (
  loan_id: number,
  payload: UpdateLoanPayload
) => {
  const { data } = await api.patch(
    `/update/emp/${loan_id}`,
    payload
  );
  return data;
};


export const closedEmployeeLoan = async (loan_id:number, payload: CloseLoanRequest) =>{
  const {data} = await api.patch(`/closed/emp-loan/${loan_id}`, payload);
  return data
}

export const payEmployeeLoan = async (
  loan_id: number,
  actionType: LoanActionType

) => {
  const { data } = await api.post(
    `/early/loans/${loan_id}/pay`,
    { actionType }
  );

  return data;
};