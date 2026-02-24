import { useQuery } from "@tanstack/react-query";
import { getCompanyDetailsServices } from "../services/general.services";
import { CompanyDetailsType } from "../types/generalTypes";
import api from "../services/axios";



export function useGetCompanyDetails(){
    return useQuery<CompanyDetailsType[]>({
        queryKey: ["company-details"],
        queryFn: getCompanyDetailsServices,
        staleTime: 1000 * 60 * 5
    })
}


interface Company {
    CompanyCode: string;
    CompanyName: string | null;
    CompanyCycle: string | null;
  }
  
  interface CompaniesResponse {
    success: boolean;
    data: Company[];
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