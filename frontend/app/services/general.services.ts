import { CompaniesResponse } from "../types/generalTypes";
import api from "./axios";

export async function getCompanyDetailsServices() {
    const res = await api.get("/general/company-details")
    return res.data
}

export async function getCompanyDetailsByCodeServices(CompanyCode: string) : Promise <CompaniesResponse> {
        const res = await api.get(`/general/companies-by-code/${CompanyCode}`)
        return res.data
}

export const fetchCompanies = async () => {
  const { data } = await api.get("/general/companies");
  return data.data;
};


export const fetchLoanTypes = async (): Promise<string[]> => {

  const { data } = await api.get("/general/loan-types");

  return data.data;
};