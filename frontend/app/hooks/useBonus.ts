import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BonusRule, CreateBonusRuleCompanyForm, CreateBonusRuleForm, GenerateBonusInput, UpdateBonusRuleForm } from "../schema/bonus.schema";
import { approveBonusService, createBonusCompanyRulesServices, createBonusrules, deleteBonusCompanyBonusServices, deleteBonusRuleServices, generateBonus, getAllBonusRules, getBonusCompanyRulesServices, getBonusSummaryService, getEmployeeBonus, getEmployeeGeneratedBonusService, resetBonusService, submitBonusService, updateBonusRuleServices } from "../services/bonus.services";
import { BonusCompanyRule, BonusSummaryType, EmployeeBonus, EmployeeGenerateBonusResponse } from "../types/bonusType";

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
                    queryKey: ["generated-bonus"]
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
            queryClient.invalidateQueries({
                queryKey: ["bonus-rules"]
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
                queryClient.invalidateQueries({
                    queryKey: ["bonus-rules"]
                })
            }
    })
}


export function useResetBonus(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: resetBonusService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bonus-summary"] })
            queryClient.invalidateQueries({ queryKey: ["generated-bonus"] })
        }
    })
}

export function useSubmitBonus(){
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: submitBonusService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bonus-summary"] })
            queryClient.invalidateQueries({ queryKey: ["generated-bonus"] })
        }
    })
}


export function useGetBonusSummary(){
    return useQuery<BonusSummaryType[]>({
        queryKey: ["bonus-summary"],
        queryFn: getBonusSummaryService,
        staleTime: 1000 * 60 * 5
    })
}


export function useGetEmployeeGeneratedBonus(
    companyCode?: string,
    id?: number
  ) {
    return useQuery<EmployeeGenerateBonusResponse>({
      queryKey: ["generated-bonus", companyCode, id],
      queryFn: () => getEmployeeGeneratedBonusService(companyCode, id),
      staleTime: 1000 * 60 * 5,
    })
  }

  export function useApproveBonus(){
    const quieryClient = useQueryClient();
    return useMutation({
        mutationFn:(id: number) =>
            approveBonusService(id),
        onSuccess: () => {
            quieryClient.invalidateQueries({queryKey: ["bonus-summary"]})
        }
    })
  }
  