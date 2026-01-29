import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BonusRule, CreateBonusRuleForm, GenerateBonusInput, UpdateBonusRuleForm } from "../schema/bonus.schema";
import { createBonusrules, deleteBonusRuleServices, generateBonus, getAllBonusRules, getEmployeeBonus, updateBonusRuleServices } from "../services/bonus.services";
import { EmployeeBonus } from "../types/bonusType";

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
