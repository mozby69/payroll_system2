import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BonusRule, CreateBonusRuleCompanyForm, CreateBonusRuleForm, GenerateBonusInput, UpdateBonusRuleForm } from "../schema/bonus.schema";
import { createBonusCompanyRulesServices, createBonusrules, deleteBonusCompanyBonusServices, deleteBonusRuleServices, generateBonus, getAllBonusRules, getBonusCompanyRulesServices, getEmployeeBonus, updateBonusRuleServices } from "../services/bonus.services";
import { BonusCompanyRule, EmployeeBonus } from "../types/bonusType";

export function useGetAllBonusRules(){
    return useQuery<BonusRule[]>({
        queryKey: ["bonus-rules"],
        queryFn: getAllBonusRules,
        staleTime: 1000 * 60 * 5
    })
}


export function useCreateBonusRules(){
    const queryClient = useQueryClient();
    return useMutation({
            mutationFn: (payload: CreateBonusRuleForm) =>
                createBonusrules(payload),
                onSuccess: () =>{
                    queryClient.invalidateQueries({
                        queryKey: ["bonus-rules"]
                    })
                }
            })
}

type UpdateBonusRuleArgs = {
    id: number
    payload: UpdateBonusRuleForm
  }

export function useUpdateBonusRules(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, payload}: UpdateBonusRuleArgs) =>
            updateBonusRuleServices(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["bonus-rules"]
            })
        }
    })
}

export function useDeleteBonusRules(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn:(id: number)=>
            deleteBonusRuleServices(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["bonus-rules"]
            })
        }
    })
}



export function useGetEmployeeBonus(){
    return useQuery<EmployeeBonus[]>({
        queryKey: ["employee-bonus"],
        queryFn: getEmployeeBonus,
        staleTime: 1000 * 60 * 5
    })
}

export function useGenerateBonus(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: GenerateBonusInput) =>
            generateBonus(payload),

            onSuccess: () =>{
                queryClient.invalidateQueries({
                    queryKey: ["employee-bonus"]
                })
            }

    })
}


export function useGetBonusCompanyRules(
    bonusRuleId: number | null
  ) {
    return useQuery<BonusCompanyRule[]>({
      queryKey: ["bonus-company-rules", bonusRuleId],
      queryFn: () => {
        if (!bonusRuleId) return Promise.resolve([])
        return getBonusCompanyRulesServices(bonusRuleId)
      },
      enabled: !!bonusRuleId
    })
  }
  

  export function useDeleteBonusCompanyRUles(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn:(id: number)=>
            deleteBonusCompanyBonusServices(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["bonus-company-rules"]
            })
        }
    })
}


export function useCreateBonusCompanyRules(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateBonusRuleCompanyForm) =>
            createBonusCompanyRulesServices(payload),
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ["bonus-company-rules"]
                })
            }
    })
}
