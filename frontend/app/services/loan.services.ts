import {api} from "./axios"
import {AddLoanPayload, CloseLoanRequest, EmpLoansByCycleResponse, FetchEmpLoansPayload, LoanActionType, LoanFilters,LoanMonitoringRow,UpdateLoanPayload} from "../types/loanTypes"


export const addEmployeeLoan = async (payload: AddLoanPayload) => {
  const res = await api.post("/loans/loans-add", payload);
  return res.data;
};

export const fetchAllLoans = async (
  page = 1,
  limit = 3,
  search = "",
  filters: LoanFilters
) => {
  const { data } = await api.get("/loans/all-loans", {
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
  const { data } = await api.get(`/loans/loans/${loan_id}/details`);
  return data;
};


export const fetchEmpLoanById = async (loan_id:number) =>{
  const {data} = await api.get(`/loans/by-id/${loan_id}`);
  return(data);
}

export const updateEmployeeLoan = async (
  loan_id: number,
  payload: UpdateLoanPayload
) => {
  const { data } = await api.patch(
    `/loans/emp/${loan_id}`,
    payload
  );
  return data;
};


export const closedEmployeeLoan = async (loan_id:number, payload: CloseLoanRequest) =>{
  const {data} = await api.patch(`/loans/emp-loan/${loan_id}`, payload);
  return data
}

export const payEmployeeLoan = async (
  loan_id: number,
  actionType: LoanActionType

) => {
  const { data } = await api.post(
    `/loans/loans/${loan_id}/pay`,
    { actionType }
  );

  return data;
};


export const fetchLoansByEmpCode = async (
  payload: FetchEmpLoansPayload
): Promise<EmpLoansByCycleResponse> => {
  const { data } = await api.post("/loans/by-empcode", payload);
  return data;
};

export const fetchBonusRules = async () => {
  const response = await api.get("/loans/bonus-rules");
  console.log("BONUS RULE RESPONSE:", response.data);
  return response.data;
};



export function loanSearchEmployees(q: string) {
  return api.get("/loans/employees/search", { params: { q } });
}


export const fetchLoanSummary = async (
  month: string,
  period: string,
  companyCode?: string,
  loanType?: string,
): Promise<LoanMonitoringRow[]> => {

  const { data } = await api.get("/loans/get-loan-summary", {
    params: {
      month,
      period,
      company: companyCode,
      loanType:loanType
    }
  });

  return data;
};