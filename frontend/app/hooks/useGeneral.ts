import { useQuery } from "@tanstack/react-query";
import { fetchCompanies, fetchLoanTypes, getCompanyDetailsByCodeServices, getCompanyDetailsServices } from "../services/general.services";
import { CompaniesResponse, CompanyDetailsType, FecthCompany } from "../types/generalTypes";
import api from "../services/axios";



export function useGetCompanyDetails(){
    return useQuery<CompanyDetailsType[]>({
        queryKey: ["company-details"],
        queryFn: getCompanyDetailsServices,
        staleTime: 1000 * 60 * 5
    })
}


  
  export function useCompaniesByCycle(cycle: string) {
    return useQuery<CompaniesResponse>({
      queryKey: ["companies-by-cycle",cycle],
      queryFn: async () => {
        const res = await api.get("/general/companies-by-cycle", {
          params: { cycle },
        });
        return res.data;
      },
        enabled: !!cycle,
    });
  }


  export function useGetCompanyByCode(companyCode: string) {
    return useQuery({
      queryKey: ["companies-by-code", companyCode],
      queryFn: () => getCompanyDetailsByCodeServices(companyCode),
      enabled: !!companyCode,
    })
  }

export const useCompanies = () => {
  return useQuery<FecthCompany[], Error>({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
    staleTime: 1000 * 60 * 10,
  });
};


export const useLoanTypes = () => {

  return useQuery<string[], Error>({
    queryKey: ["loan-types"],
    queryFn: fetchLoanTypes,
    staleTime: 1000 * 60 * 10
  });

};