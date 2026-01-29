import { useQuery } from "@tanstack/react-query";
import { getCompanyDetailsServices } from "../services/general.services";
import { CompanyDetailsType } from "../types/generalTypes";



export function useGetCompanyDetails(){
    return useQuery<CompanyDetailsType[]>({
        queryKey: ["company-details"],
        queryFn: getCompanyDetailsServices,
        staleTime: 1000 * 60 * 5
    })
}