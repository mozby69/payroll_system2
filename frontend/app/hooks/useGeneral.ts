import { useQuery } from "@tanstack/react-query";
import { getCompanyDetailsByCodeServices, getCompanyDetailsServices } from "../services/general.services";
import { CompaniesResponse, CompanyDetailsType } from "../types/generalTypes";
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